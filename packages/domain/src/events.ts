export type EconomyEventType =
  | 'intent.created'
  | 'intent.decomposed'
  | 'capability.required'
  | 'agent.discovered'
  | 'agent.assigned'
  | 'organization.formed'
  | 'job.created'
  | 'job.started'
  | 'budget.reserved'
  | 'payment.locked'
  | 'job.progress'
  | 'job.completed'
  | 'job.failed'
  | 'agent.replaced'
  | 'evidence.attached'
  | 'evaluation.started'
  | 'evaluation.rejected'
  | 'evaluation.completed'
  | 'outcome.proposed'
  | 'outcome.verified'
  | 'organization.dissolved'

export interface EconomyEvent<TPayload = Record<string, unknown>> {
  id: string
  type: EconomyEventType
  occurredAt: string
  sequence: number
  intentId: string
  organizationId?: string
  actorId?: string
  jobId?: string
  source: 'runtime' | 'fixture'
  payload: TPayload
}

export interface IntentCreatedPayload {
  objective: string
  budget: number
  currency: string
  deadline?: string
}

export interface CapabilityRequiredPayload {
  capabilityId: string
  label: string
  order: number
}

export interface AgentAssignedPayload {
  agentId: string
  capabilityId: string
  label: string
}

export interface JobStatePayload {
  jobId: string
  providerAgentId: string
  capabilityId: string
  cost?: number
  progress?: number
  error?: string
}

export interface EvidenceAttachedPayload {
  evidenceId: string
  kind: string
  label: string
  producerAgentId: string
}

export interface EvaluationCompletedPayload {
  evaluatorAgentId: string
  accepted: boolean
  score?: number
  reasoningSummary?: string
}

export interface OutcomeVerifiedPayload {
  outcomeId: string
  totalCost: number
  durationMs: number
  participatingAgentIds: string[]
  jobIds: string[]
  evidenceIds: string[]
}

/**
 * Events are deliberately transport-agnostic. Live SSE/WebSocket streams and
 * recorded demo replays must use the same contract.
 */
export type EconomyEventStream = EconomyEvent[]
