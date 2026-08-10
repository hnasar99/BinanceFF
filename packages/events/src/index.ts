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
  | 'job.completed'
  | 'job.failed'
  | 'evidence.attached'
  | 'evaluation.started'
  | 'evaluation.rejected'
  | 'evaluation.completed'
  | 'outcome.verified'
  | 'organization.dissolved';

export interface EconomyEvent<T = Record<string, unknown>> {
  id: string;
  type: EconomyEventType;
  timestamp: number;
  intentId: string;
  actorId?: string;
  jobId?: string;
  payload: T;
  mock?: boolean;
}

export type EconomyEventSink = (event: EconomyEvent) => void;
