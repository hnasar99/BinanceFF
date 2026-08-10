# AGENTS.md

## Mission

Build forward-looking infrastructure for autonomous agent economies on BNB Chain. Optimize for a compelling executable system, not a generic agent marketplace dashboard.

## Product invariant

Every major feature must strengthen at least one stage of this loop:

`intent -> decompose -> discover/compose -> transact -> execute -> verify -> learn/spawn`

If a proposed feature does not strengthen that loop or the demo, challenge it before implementing it.

## Working rules

1. Never commit feature work directly to `main`. Use a focused branch and PR.
2. Keep PRs small enough to review independently.
3. Add tests for domain logic and failure paths.
4. Prefer explicit domain contracts over framework-specific coupling.
5. Keep BNB-specific integrations behind adapters so the core orchestration can be tested locally.
6. Never fabricate blockchain transactions, agent identities, payments, evidence, or benchmark results in production paths.
7. Demo fixtures must be clearly identified as fixtures.
8. Do not add infrastructure, frameworks or dependencies without a concrete need.
9. Preserve observability: every orchestration step should eventually be traceable.
10. Security boundaries around wallets, signing, budgets and permissions are first-class requirements.

## Initial architecture boundaries

- `apps/web`: user-facing experience and live execution visualization
- `apps/api`: orchestration API and runtime entrypoints
- `packages/domain`: shared types and state machines
- `packages/intent-engine`: intent normalization and decomposition
- `packages/agent-market`: capability discovery, matching and composition
- `packages/outcome-proof`: evidence and Proof of Outcome
- `packages/bnb-adapter`: ERC-8004 / ERC-8183 / x402 / BNB integration boundary
- `agents`: first-party experimental agents
- `experiments`: disposable research prototypes
- `docs`: architecture decisions and product hypotheses

## First vertical slice

The first system worth demoing accepts one intent, decomposes it into multiple capabilities, assigns at least two agents, records their jobs, combines results, runs an evaluator, and returns a Proof of Outcome with cost, timing, participants and evidence.

Do not start with a catalog UI.

## Definition of done for a PR

- builds successfully
- relevant tests pass
- no secrets committed
- README/docs updated when contracts change
- failure behavior is explicit
- PR explains what was deliberately not implemented
