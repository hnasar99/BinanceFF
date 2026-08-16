# AGENTS.md

## Mission

Build forward-looking infrastructure for autonomous agent economies on BNB Chain. Optimize for a compelling executable system, not a generic agent marketplace dashboard.

## Product invariant

Every major feature must strengthen at least one stage of this loop:

`intent -> decompose -> discover/compose -> plan -> mandate check -> transact -> execute -> verify -> settle -> learn/spawn`

If a proposed feature does not strengthen that loop or the demo, challenge it before implementing it.

Economic autonomy is bounded autonomy: agents may discover, negotiate, compose, learn and propose actions, but they may not expand delegated authority over capital.

`Mandate > Agent`

## Working rules

1. Never commit feature work directly to `main`. Use a focused branch and PR.
2. Keep PRs small enough to review independently.
3. Add tests for domain logic and failure paths.
4. Prefer explicit domain contracts over framework-specific coupling.
5. Keep BNB-specific integrations behind adapters so the core orchestration can be tested locally.
6. Never fabricate blockchain transactions, agent identities, payments, evidence, mandate decisions, risk assessments or benchmark results in production paths.
7. Demo fixtures must be clearly identified as fixtures and must never authorize production capital movement.
8. Do not add infrastructure, frameworks or dependencies without a concrete need.
9. Preserve observability: every orchestration and economic authorization step should eventually be traceable through the canonical event stream.
10. Security boundaries around wallets, signing, budgets, permissions and Mandates are first-class requirements.
11. Agents may propose economic actions; deterministic policy enforcement has veto power over execution.
12. Child Mandates may narrow delegated authority but must never broaden their parent Mandate.
13. Autonomous agents must never receive unrestricted signing authority. Prefer scoped wallets, smart accounts, session permissions or equivalent constrained mechanisms.
14. If required risk cannot be assessed with sufficient confidence, economic execution fails closed while non-economic discovery, simulation and learning may continue.
15. Failover may replace only semantically equivalent infrastructure. Never silently change chain, asset, venue, protocol, Mandate limits or transaction meaning.
16. Learning and Spawn may create better strategies or new capability supply, but they may not self-expand execution authority or risk limits.
17. Mandate decisions, risk assessments and execution receipts belong in BinanceFF Evidence / Proof of Outcome; do not create a parallel audit truth.

## Initial architecture boundaries

- `apps/web`: user-facing experience and live execution visualization
- `apps/api`: orchestration API and runtime entrypoints
- `packages/domain`: shared types and state machines, including Mandate contracts
- `packages/intent-engine`: intent normalization and decomposition
- `packages/agent-market`: capability discovery, matching and composition
- `packages/mandate`: delegated authority, policy evaluation and treasury guards
- `packages/risk`: capability-specific risk assessments and conservative fallbacks
- `packages/outcome-proof`: evidence and Proof of Outcome
- `packages/bnb-adapter`: ERC-8004 / ERC-8183 / x402 / BNB integration boundary
- `packages/execution`: scoped execution adapters and SHADOW / TESTNET / MAINNET boundaries where relevant
- `agents`: first-party experimental agents
- `experiments`: disposable research prototypes
- `docs`: architecture decisions and product hypotheses

These boundaries are directional. Do not create an empty package merely because it is listed here; introduce a package when executable work requires the boundary.

## Economic Mandate model

A Mandate is not an Intent, Plan or Job.

- Intent says what outcome is wanted.
- Plan says how capabilities may satisfy it.
- Job assigns a capability contractually.
- Mandate says what economic authority is available while doing so.

Common profiles include user-capital Mandates, Job Mandates and treasury Mandates for actors such as the Bounty Generator.

The Bounty Generator remains outside the Mandate layer. It proposes and operates economically, while its Treasury Mandate limits how much capital, risk and execution authority it can deploy.

See `docs/MANDATE_LAYER.md` before implementing wallet, treasury, policy, risk, bounty funding or autonomous execution behavior.

## First vertical slice

The first system worth demoing accepts one intent, decomposes it into multiple capabilities, assigns at least two agents, records their jobs, combines results, runs an evaluator, and returns a Proof of Outcome with cost, timing, participants and evidence.

Add only the minimum Mandate behavior needed by that slice: domain references and deterministic budget/capability enforcement when an economic action is introduced. Do not build the full financial safety stack before the core orchestration works.

Do not start with a catalog UI.

## Definition of done for a PR

- builds successfully
- relevant tests pass
- no secrets committed
- README/docs updated when contracts change
- failure behavior is explicit
- economic authorization boundaries are tested when touched
- PR explains what was deliberately not implemented
