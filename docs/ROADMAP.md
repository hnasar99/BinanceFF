# Roadmap

## Phase 0 — Executable vertical slice

Goal: prove that an intent can be decomposed into multiple jobs, executed by multiple agents, evaluated, and returned with a structured Proof of Outcome.

### Deliverables

- TypeScript monorepo scaffold
- shared domain contracts
- in-memory agent registry
- deterministic intent decomposition for one demo scenario
- research-agent, risk-agent and evaluator-agent
- orchestrator
- structured Proof of Outcome
- API endpoint to execute an intent
- unit tests for domain logic and orchestration failures
- one CLI or script-based demo

### Explicitly out of scope

- production wallet custody
- real capital deployment
- generic marketplace UI
- agent spawning
- persistent database
- production reputation scoring
- real settlement on mainnet

## Phase 1 — BNB-native execution

- ERC-8004 identity adapter
- ERC-8183 job lifecycle adapter
- x402 payment adapter
- BSC testnet integration
- signed transaction/evidence references
- execution replay and trace viewer

## Phase 2 — Dynamic market composition

- semantic capability matching
- competing plans
- provider bidding
- quality/cost/latency optimization
- agent-to-agent hiring
- failure recovery and provider substitution

## Phase 3 — Economic evolution

- capability gaps
- dynamic agent configuration/spawn experiments
- temporary organizations
- budget delegation
- recurring obligations / SLA-like jobs
- learned routing based on verified outcomes

## Decision rule

At every phase, prefer an end-to-end demonstrable behavior over breadth. If a feature does not improve the core loop or the demo, defer it.
