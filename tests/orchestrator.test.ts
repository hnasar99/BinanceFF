import { describe, expect, it } from 'vitest';
import { evaluatorAgent, researchAgent, riskAgent } from '../agents/mock-agents/src/index.js';
import { BudgetExceededError, EvaluationRejectedError, type Intent } from '../packages/domain/src/index.js';
import { executeIntent } from '../packages/orchestrator/src/index.js';

function makeIntent(budget = 1): Intent {
  return {
    id: `intent-test-${budget}`,
    objective: 'Test intent',
    constraints: ['risk <= medium'],
    budget: { amount: budget, currency: 'USDT' },
    deadlineMs: 60_000,
    requester: 'test',
    status: 'received'
  };
}

describe('executeIntent', () => {
  it('produces a proof of outcome with multiple provider jobs and an evaluator', async () => {
    let tick = 0;
    const proof = await executeIntent(makeIntent(), {
      providers: [researchAgent, riskAgent],
      evaluator: evaluatorAgent,
      now: () => ++tick
    });

    expect(proof.intent.status).toBe('completed');
    expect(proof.jobs).toHaveLength(2);
    expect(proof.jobs.every((job) => job.status === 'completed')).toBe(true);
    expect(proof.agents).toHaveLength(3);
    expect(proof.evaluation.accepted).toBe(true);
    expect(proof.totalCost.amount).toBeCloseTo(0.25);
    expect(proof.mockExecution).toBe(true);
    expect(proof.evidence.length).toBeGreaterThanOrEqual(3);
  });

  it('rejects execution when projected cost exceeds the intent budget', async () => {
    await expect(executeIntent(makeIntent(0.1), {
      providers: [researchAgent, riskAgent],
      evaluator: evaluatorAgent
    })).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it('fails when evaluator rejects the combined provider result', async () => {
    const rejectingEvaluator = {
      ...evaluatorAgent,
      async evaluate() {
        return {
          accepted: false,
          score: 0.1,
          rationale: 'Evidence quality below threshold.',
          evidence: [{ kind: 'attestation' as const, label: 'reject', value: 'rejected', mock: true }]
        };
      }
    };

    await expect(executeIntent(makeIntent(), {
      providers: [researchAgent, riskAgent],
      evaluator: rejectingEvaluator
    })).rejects.toBeInstanceOf(EvaluationRejectedError);
  });

  it('propagates provider failure and marks the intent failed', async () => {
    const intent = makeIntent();
    const failingRisk = {
      ...riskAgent,
      async execute() {
        throw new Error('risk provider unavailable');
      }
    };

    await expect(executeIntent(intent, {
      providers: [researchAgent, failingRisk],
      evaluator: evaluatorAgent
    })).rejects.toThrow('risk provider unavailable');

    expect(intent.status).toBe('failed');
  });
});
