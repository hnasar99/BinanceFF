# Architecture v0

## Goal

Prove one executable path end-to-end before optimizing for breadth.

`Intent -> Plan -> Jobs -> Agent execution -> Evaluation -> Proof of Outcome`

The first version is deliberately local-first. BNB Chain integrations sit behind adapters so orchestration can be exercised and tested without requiring chain access for every test.

## Runtime shape

```text
apps/api
  -> packages/intent-engine
  -> packages/agent-market
  -> packages/domain
  -> agents/*
  -> packages/outcome-proof
  -> packages/bnb-adapter
```

## Initial responsibilities

### apps/api
HTTP entrypoint and orchestration boundary. It accepts an Intent and returns an execution result plus Proof of Outcome.

### packages/domain
Shared types, state machines and invariants. No framework dependencies.

### packages/intent-engine
Normalizes an intent and produces a capability plan. V0 may use deterministic decomposition for a narrow demo scenario; later versions can use models/planners.

### packages/agent-market
Registers agent offers, matches capabilities and selects candidate providers based on constraints.

### agents
First-party experimental providers. V0 ships with at least:

- research-agent
- risk-agent
- evaluator-agent

### packages/outcome-proof
Builds a normalized artifact containing participating agents, jobs, timings, costs, evidence and evaluation.

### packages/bnb-adapter
Boundary for ERC-8004 identity/discovery, ERC-8183 jobs/settlement and x402 payments. V0 provides interfaces and a mock implementation; real BNB integration follows once the orchestration loop is stable.

## Design constraints

- Core orchestration must run locally without a wallet.
- Every job transition is explicit and traceable.
- An evaluator is a distinct actor, not implicit trust in provider output.
- Costs and timings are first-class fields even in mocks.
- Evidence is structured data, not prose appended at the end.
- Chain-specific code must not leak into domain types.

## V0 demo scenario

Input intent:

> Analyze a hypothetical BNB Chain yield opportunity under a medium-risk constraint and return a verified recommendation.

Expected composition:

1. research-agent gathers structured opportunity evidence.
2. risk-agent evaluates risk independently.
3. orchestrator combines both outputs.
4. evaluator-agent verifies that the result satisfies the intent and evidence requirements.
5. outcome-proof emits a complete execution record.

This scenario is intentionally synthetic at first. No fake on-chain claims may be presented as real chain activity.
