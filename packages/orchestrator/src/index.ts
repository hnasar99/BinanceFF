import {
  BudgetExceededError,
  EvaluationRejectedError,
  type AgentRuntime,
  type Capability,
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
}

export async function executeIntent(intent: Intent, deps: OrchestratorDependencies): Promise<ProofOfOutcome> {
  const now = deps.now ?? Date.now;
  const startedAt = now();

  const required: Capability[] = [
    { id: 'market-research', name: 'Market Research', description: 'Analyze the opportunity and supporting context.' },
    { id: 'risk-analysis', name: 'Risk Analysis', description: 'Evaluate whether the opportunity satisfies risk constraints.' }
  ];

  const providerByCapability = new Map<string, AgentRuntime>();
  for (const capability of required) {
    const provider = deps.providers.find((candidate) => candidate.identity.capabilities.includes(capability.id));
    if (!provider) throw new Error(`No provider for capability: ${capability.id}`);
    providerByCapability.set(capability.id, provider);
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

    try {
      const result = await provider.execute(step.capability, intent);
      job.result = result;
      job.status = 'completed';
      allEvidence.push(...result.evidence);
    } catch (error) {
      job.status = 'failed';
      job.finishedAt = now();
      jobs.push(job);
      intent.status = 'failed';
      throw error;
    }

    job.finishedAt = now();
    jobs.push(job);
  }

  intent.status = 'evaluating';
  const evaluation = await deps.evaluator.evaluate(jobs.map((job) => job.result?.summary ?? ''));
  allEvidence.push(...evaluation.evidence);

  if (!evaluation.accepted) {
    intent.status = 'rejected';
    throw new EvaluationRejectedError(evaluation.rationale);
  }

  intent.status = 'completed';
  const finishedAt = now();
  const participants = [
    ...deps.providers.map((agent) => agent.identity),
    deps.evaluator.identity
  ].filter((agent, index, arr) => arr.findIndex((x) => x.id === agent.id) === index);

  return {
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
}
