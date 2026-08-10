import type { AgentRuntime, Capability, Intent } from '../../../packages/domain/src/index.js';

export const researchAgent: AgentRuntime = {
  identity: {
    id: 'agent-research-001',
    name: 'Mock Research Agent',
    identityRef: 'mock:erc8004:research-001',
    capabilities: ['market-research'],
    mock: true
  },
  async execute(_capability: Capability, _intent: Intent) {
    return {
      summary: 'Hypothetical opportunity shows attractive yield, but source quality is limited in mock mode.',
      confidence: 0.72,
      evidence: [
        { kind: 'analysis', label: 'research-note', value: 'Mock market research completed', mock: true }
      ]
    };
  }
};

export const riskAgent: AgentRuntime = {
  identity: {
    id: 'agent-risk-001',
    name: 'Mock Risk Agent',
    identityRef: 'mock:erc8004:risk-001',
    capabilities: ['risk-analysis'],
    mock: true
  },
  async execute(_capability: Capability, _intent: Intent) {
    return {
      summary: 'Medium-risk constraint can be satisfied if concentration and contract exposure remain capped.',
      confidence: 0.79,
      evidence: [
        { kind: 'analysis', label: 'risk-note', value: 'Mock risk assessment completed', mock: true }
      ]
    };
  }
};

export const evaluatorAgent = {
  identity: {
    id: 'agent-evaluator-001',
    name: 'Mock Evaluator Agent',
    identityRef: 'mock:erc8004:evaluator-001',
    capabilities: ['outcome-evaluation'],
    mock: true
  },
  async evaluate(summaries: string[]) {
    const accepted = summaries.length >= 2 && summaries.every(Boolean);
    return {
      accepted,
      score: accepted ? 0.81 : 0.2,
      rationale: accepted
        ? 'Research and risk outputs are mutually consistent enough for a mock recommendation.'
        : 'Insufficient provider evidence.',
      evidence: [
        { kind: 'attestation' as const, label: 'mock-evaluator', value: accepted ? 'accepted' : 'rejected', mock: true }
      ]
    };
  }
};
