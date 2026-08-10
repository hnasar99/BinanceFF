import { researchAgent, riskAgent, evaluatorAgent } from '../../../agents/mock-agents/src/index.js';
import type { EconomyEvent, Intent } from '../../../packages/domain/src/index.js';
import { executeIntent } from '../../../packages/orchestrator/src/index.js';

const intent: Intent = {
  id: 'intent-demo-001',
  objective: 'Analyze a hypothetical BNB Chain yield opportunity under a medium-risk constraint and return a verified recommendation.',
  constraints: ['risk <= medium', 'no real capital execution', 'mock providers must be clearly labeled'],
  budget: { amount: 1, currency: 'USDT' },
  deadlineMs: 60_000,
  requester: 'human:demo',
  status: 'received'
};

const events: EconomyEvent[] = [];
const proof = await executeIntent(intent, {
  providers: [researchAgent, riskAgent],
  evaluator: evaluatorAgent,
  emit(event) {
    events.push(event);
    console.log(`[${event.type}]`, JSON.stringify(event.payload));
  }
});

console.log('\n--- PROOF OF OUTCOME ---');
console.log(JSON.stringify(proof, null, 2));
console.log(`\nEvents emitted: ${events.length}`);
