import {
  BudgetExceededError,
  EvaluationRejectedError,
  type AgentRuntime,
  type Capability,
  type EconomyEvent,
  type Intent,
  type Job,
  type Plan,
  type ProofOfOutcome
} from '../../domain/src/index.js';

export interface EvaluatorRuntime {
  identity: { id: string; name: string; identityRef: string; capabilities: string[]; mock: boolean };
  evaluate(summaries: string[]): Promise<{
    accepted: boolean;
    score: number;
    rationale: string;
    evidence: { kind: 'analysis' | 'source' | 'trace' | 'attestation'; label: string; value: string; mock?: boolean }[];
  }>;
}

export interface OrchestratorDependencies {
  providers: AgentRuntime[];
  evaluator: EvaluatorRuntime;
  now?: () => number;
  emit?: (event: EconomyEvent) => void | Promise<void>;
}

export async function executeIntent(intent: Intent, deps: OrchestratorDependencies): Promise<ProofOfOutcome> {
  const now = deps.now ?? Date.now;
  const startedAt = now();
  let eventCounter = 0;
  const emit = async (
    type: EconomyEvent['type'],
    payload: Record<string, unknown>,
    actorId?: string,
    jobId?: string,
    mock = true
  ) => {
    if (!deps.emit) return;
    eventCounter += 1;
    await deps.emit({
      id: `${intent.id}:${eventCounter}`,
      type,
      timestamp: now(),
      intentId: intent.id,
      actorId,
      jobId,
      mock,
      payload
    });
  };

  await emit('intent.created', { objective: intent.objective, budget: intent.budget }, intent.requester, undefined, false);

  const required: Capability[] = [
    { id: 'market-research', name: 'Market Research', description: 'Analyze the opportunity and supporting context.' },
    { id: 'risk-analysis', name: 'Risk Analysis', description: 'Evaluate whether the opportunity satisfies risk constraints.' }
  ];

  await emit('intent.decomposed', { capabilityIds: required.map((capability) => capability.id) }, intent.requester, undefined, false);
  for (const capability of required) {
    await emit('capability.required', { capability }, intent.requester, undefined, false);
  }

  const providerByCapability = new Map<string, AgentRuntime>();
  for (const capability of required) {
    const provider = deps.providers.find((candidate) => candidate.identity.capabilities.includes(capability.id));
    if (!provider) throw new Error(`No provider for capability: ${capability.id}`);
    providerByCapability.set(capability.id, provider);
    await emit('agent.discovered', { capabilityId: capability.id, agent: provider.identity }, provider.identity.id, undefined, provider.identity.mock);
    await emit('agent.assigned', { capabilityId: capability.id }, provider.identity.id, undefined, provider.identity.mock);
  }

  const perJobCost = 0.1;
  const evaluatorCost = 0.05;
  const projectedCost = required.length * perJobCost + evaluatorCost;
  if (projectedCost > intent.budget.amount) {
    throw new BudgetExceededError(`Projected cost ${projectedCost} exceeds budget ${intent.budget.amount}`);
  }

  const plan: Plan = {
    id: `plan-${intent.id}`,
    intentId: intent.id,
    steps: required.map((capability) => ({
      capability,
      providerAgentId: providerByCapability.get(capability.id)!.identity.id,
      budget: { amount: perJobCost, currency: intent.budget.currency }
    }))
  };

  await emit('organization.formed', {
    planId: plan.id,
    agentIds: plan.steps.map((step) => step.providerAgentId)
  }, undefined, undefined, deps.providers.some((agent) => agent.identity.mock));

  intent.status = 'executing';
  const jobs: Job[] = [];
  const allEvidence = [] as ProofOfOutcome['evidence'];

  for (const step of plan.steps) {
    const provider = providerByCapability.get(step.capability.id)!;
    const job: Job = {
      id: `job-${intent.id}-${step.capability.id}`,
      intentId: intent.id,
      capabilityId: step.capability.id,
      providerAgentId: provider.identity.id,
      consumerAgentId: intent.requester,
      budget: step.budget,
      status: 'running',
      startedAt: now()
    };

    await emit('job.created', { capabilityId: job.capabilityId, budget: job.budget }, provider.identity.id, job.id, provider.identity.mock);
    await emit('job.started', { capabilityId: job.capabilityId }, provider.identity.id, job.id, provider.identity.mock);

    try {
      const result = await provider.execute(step.capability, intent);
      job.result = result;
      job.status = 'completed';
      allEvidence.push(...result.evidence);
      await emit('job.completed', { confidence: result.confidence, summary: result.summary }, provider.identity.id, job.id, provider.identity.mock);
      for (const evidence of result.evidence) {
        await emit('evidence.attached', { evidence }, provider.identity.id, job.id, evidence.mock ?? provider.identity.mock);
      }
    } catch (error) {
      job.status = 'failed';
      job.finishedAt = now();
      jobs.push(job);
      intent.status = 'failed';
      await emit('job.failed', { error: error instanceof Error ? error.message : String(error) }, provider.identity.id, job.id, provider.identity.mock);
      throw error;
    }

    job.finishedAt = now();
    jobs.push(job);
  }

  intent.status = 'evaluating';
  await emit('evaluation.started', { evaluatorId: deps.evaluator.identity.id }, deps.evaluator.identity.id, undefined, deps.evaluator.identity.mock);
  const evaluation = await deps.evaluator.evaluate(jobs.map((job) => job.result?.summary ?? ''));
  allEvidence.push(...evaluation.evidence);

  if (!evaluation.accepted) {
    intent.status = 'rejected';
    await emit('evaluation.rejected', { score: evaluation.score, rationale: evaluation.rationale }, deps.evaluator.identity.id, undefined, deps.evaluator.identity.mock);
    throw new EvaluationRejectedError(evaluation.rationale);
  }

  await emit('evaluation.completed', { score: evaluation.score, rationale: evaluation.rationale }, deps.evaluator.identity.id, undefined, deps.evaluator.identity.mock);

  intent.status = 'completed';
  const finishedAt = now();
  const participants = [
    ...deps.providers.map((agent) => agent.identity),
    deps.evaluator.identity
  ].filter((agent, index, arr) => arr.findIndex((x) => x.id === agent.id) === index);

  const proof: ProofOfOutcome = {
    version: '0.1',
    intent,
    plan,
    agents: participants,
    jobs,
    totalCost: { amount: projectedCost, currency: intent.budget.currency },
    durationMs: Math.max(0, finishedAt - startedAt),
    evidence: allEvidence,
    evaluation,
    mockExecution: participants.some((agent) => agent.mock)
  };

  await emit('outcome.verified', {
    totalCost: proof.totalCost,
    durationMs: proof.durationMs,
    evaluationScore: proof.evaluation.score
  }, deps.evaluator.identity.id, undefined, proof.mockExecution);
  await emit('organization.dissolved', { planId: plan.id }, undefined, undefined, proof.mockExecution);

  return proof;
}
