export type Money = { amount: number; currency: 'USD' | 'USDT' };

export type IntentStatus = 'received' | 'planned' | 'executing' | 'evaluating' | 'completed' | 'rejected' | 'failed';
export type JobStatus = 'created' | 'accepted' | 'running' | 'submitted' | 'completed' | 'rejected' | 'failed';

export interface Intent {
  id: string;
  objective: string;
  constraints: string[];
  budget: Money;
  deadlineMs: number;
  requester: string;
  status: IntentStatus;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
}

export interface AgentIdentity {
  id: string;
  name: string;
  identityRef: string;
  capabilities: string[];
  mock: boolean;
}

export interface Evidence {
  kind: 'analysis' | 'source' | 'trace' | 'attestation';
  label: string;
  value: string;
  mock?: boolean;
}

export interface AgentResult {
  summary: string;
  evidence: Evidence[];
  confidence: number;
}

export interface Job {
  id: string;
  intentId: string;
  capabilityId: string;
  providerAgentId: string;
  consumerAgentId: string;
  budget: Money;
  status: JobStatus;
  startedAt?: number;
  finishedAt?: number;
  result?: AgentResult;
}

export interface PlanStep {
  capability: Capability;
  providerAgentId: string;
  budget: Money;
}

export interface Plan {
  id: string;
  intentId: string;
  steps: PlanStep[];
}

export interface Evaluation {
  accepted: boolean;
  score: number;
  rationale: string;
  evidence: Evidence[];
}

export interface ProofOfOutcome {
  version: '0.1';
  intent: Intent;
  plan: Plan;
  agents: AgentIdentity[];
  jobs: Job[];
  totalCost: Money;
  durationMs: number;
  evidence: Evidence[];
  evaluation: Evaluation;
  mockExecution: boolean;
}

export interface AgentRuntime {
  identity: AgentIdentity;
  execute(capability: Capability, intent: Intent): Promise<AgentResult>;
}

export class BudgetExceededError extends Error {}
export class ProviderExecutionError extends Error {}
export class EvaluationRejectedError extends Error {}
