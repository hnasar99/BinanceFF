# BinanceFF Master Roadmap

## Objective

Build an autonomous agent economy rooted in BNB Chain that can:

`generate/receive intent -> form teams -> transact -> execute -> verify -> settle -> learn -> repeat`

The product must feel like a living economic simulation, not a SaaS marketplace.

## Integration rule

- `main` stays stable.
- `agent/vertical-slice-v0` is the current integration base for the first executable milestone.
- Each major workstream owns a focused branch/PR.
- Shared contracts live in `packages/domain` and `packages/events`.
- Cross-workstream integration happens through typed domain/event contracts, not direct imports into private implementation details.

## Workstream map

### Lane A — Core agent economy

Issue: #1
PR: #2
Branch: `agent/vertical-slice-v0`

Goal: produce the canonical end-to-end lifecycle.

Scope:
- Intent
- deterministic decomposition v0
- capability matching
- team formation
- jobs
- evaluator
- Proof of Outcome
- canonical EconomyEvent stream
- failure/budget/evaluator tests

Definition of done:
- `pnpm install`
- `pnpm test`
- `pnpm demo`
- demo emits replayable events plus Proof of Outcome
- failure paths are observable

Priority: P0 / dependency root

### Lane B — Simulation-first UI

Issue: #3 and #10
PR: #4
Branch: `agent/simulation-ui-v0`

Goal: create the primary product experience as a live 3D economic simulation.

Scope:
- React + TypeScript
- React Three Fiber / Three.js
- deterministic event replay
- Intent / capabilities / agents / jobs / evaluator / outcome
- budget/value flow
- failures and team reconfiguration
- semantic camera movement
- external capability zones and cross-venue traversal
- Proof of Outcome inspection
- i18n integration hooks

Definition of done:
- one command runs the simulation locally
- canonical fixture/event stream replays end-to-end
- no generic dashboard as primary surface
- muted demo remains understandable
- external read-only capability is spatially legible

Priority: P0 / parallel after event contract

### Lane C — Ultra-low-latency execution engine

Issue: #5
PR: #6
Branch: `agent/execution-engine-v0`

Goal: establish the deterministic Rust hot path for latency-sensitive strategies such as arbitrage.

Scope:
- Rust service/crate
- ExecutionPolicy
- MarketEvent
- Opportunity
- risk/profit gate
- transaction build/sign/submit abstractions
- stale-state rejection
- kill switch
- bounded Tokio channels
- Criterion benchmarks
- p50/p95/p99 internal stage telemetry

Definition of done:
- `cargo test` passes
- benchmark harness runs locally
- no DB/LLM/Python/UI dependency in hot path
- no network-level latency claims before real infrastructure tests

Priority: P0 / independent parallel lane

### Lane D — Product plane

Issue: #7
PR: #8
Branch: `agent/product-plane-v0`

Goal: give the economy persistent memory, users, economics and teaching UX.

Scope:
- Supabase/Postgres schema
- auth/profile boundary
- bounties
- teams/team runs
- jobs
- Proofs of Outcome
- revenue/cost/net accounting
- rankings
- notifications
- Tutor Agent
- multilingual foundation: EN, ES, PT-BR, ZH-CN, KO, JA, FR, DE
- fixed/performance/hybrid bounty settlement primitives

Definition of done:
- migrations/schema are reproducible
- settlement math is unit tested
- ranking inputs are measurable, not vanity ratings
- Tutor suggestions are locale-aware
- product plane remains outside arbitrage hot path

Priority: P1 / parallel after domain contracts

### Lane E — Autonomous Bounty Generator + learning loop

Issue: #9
Branch: `agent/autonomous-bounty-loop-v0`

Goal: keep the platform economically alive without human traffic.

Scope:
- always-on Bounty Generator Agent
- generator treasury/wallet model
- platform-funded/simulation/sponsor/user funding provenance
- bounty budget reservation
- settlement back into generator treasury
- P&L / ROI / drawdown / runway
- `active`, `low_funds`, `needs_funding`, `paused`
- deterministic internal bounty generator v0
- learning signals
- agent/team selection priors
- failed experiments included in learning
- economy events for visible continuous activity

Definition of done:
- generator can fund a safe internal bounty
- result settles treasury deterministically
- profitable generator can continue
- depleted generator stops and emits `needs_funding`
- historical outcomes modify selection priors without self-modifying production risk code

Priority: P0 after Lane A event/orchestration contract

### Lane F — External Capability Registry / venues

Issue: #10

Goal: let agents use capabilities outside BNB while BNB remains the home economic/settlement core.

Scope:
- Capability Registry
- venue metadata
- read-only vs executable capabilities
- approval/risk/jurisdiction policy state
- external result/evidence/cost/latency events
- Polymarket read-only adapter as first external example
- later: other APIs/chains/execution venues

Definition of done:
- planner can discover an external capability
- permission evaluation is explicit
- read-only adapter returns typed evidence
- final Proof of Outcome preserves full cross-venue trace
- executable external actions remain separately policy-gated

Priority: P1 / parallel after event + capability contracts

## Dependency graph

```text
                  Lane A: CORE
                 /      |      \
                /       |       \
               v        v        v
      Lane B: UI   Lane D: Product   Lane E: Bounty Loop
           |             |               |
           |             +-------+-------+
           |                     |
           v                     v
      Lane F: External Capabilities / Venues

      Lane C: Rust Execution Engine
               |
               +---- consumes deterministic ExecutionPolicy
                     from intelligence/control plane
```

Lane C runs largely independently and integrates through `ExecutionPolicy` + telemetry/events.

## Parallel Codex task packets

Run these as separate Codex cloud tasks/environments. Do not ask one task to implement another lane.

### Codex A — Core completion

Branch: `agent/vertical-slice-v0`

Prompt objective:
Complete Issue #1. Make the canonical event stream and Proof of Outcome lifecycle executable and thoroughly tested. Treat `packages/events` as the single event contract. Do not expand scope into UI, Supabase, real wallets or mainnet.

### Codex B — Simulation UI

Branch: `agent/simulation-ui-v0`

Prompt objective:
Implement Issue #3 and the visualization portion of #10. Build the first stunning R3F/Three.js simulation replay using the canonical economy-event shape. Prioritize spatial legibility, cinematic motion with meaning, and event-driven architecture. Do not build a generic SaaS dashboard.

### Codex C — Rust execution engine

Branch: `agent/execution-engine-v0`

Prompt objective:
Complete Issue #5. Focus on deterministic Rust hot path, benchmarks, telemetry, stale-state rejection and swappable provider/signer interfaces. No LLM, DB, Python or UI in the critical path.

### Codex D — Product plane

Branch: `agent/product-plane-v0`

Prompt objective:
Complete Issue #7. Harden the Supabase schema, settlement/ranking primitives, Tutor and i18n boundaries. Add tests and repository interfaces for persistence. Do not couple product persistence to the Rust execution hot path.

### Codex E — Autonomous bounty economy

Branch: `agent/autonomous-bounty-loop-v0`

Prompt objective:
Complete Issue #9. Implement generator treasury lifecycle, deterministic bounty generation, safe execution through the orchestrator, settlement, learning signals and `needs_funding`. All internal/simulation economics must be clearly labeled.

### Codex F — External capability adapter

Recommended new branch: `agent/external-capabilities-v0`

Prompt objective:
Implement the non-visual core of Issue #10: Capability Registry + venue permission model + a Polymarket read-only adapter interface/fixture. Keep execution-capable actions disabled/policy-gated in v0. Emit typed cross-venue economy events and evidence.

## Merge order for first integrated demo

1. Lane A / PR #2 — canonical core contracts
2. Lane C / PR #6 — independent engine can merge once tests/bench harness are clean
3. Rebase/refresh Lane B, D and E on the finalized Lane A contracts
4. Merge Lane D product plane
5. Merge Lane E autonomous bounty loop
6. Merge Lane B simulation UI once it consumes the real event stream
7. Merge Lane F external capabilities after the capability/event contract is stable
8. Integrate Rust telemetry into simulation as a consumer, never a dependency

## First integrated milestone

The milestone is complete when the system can demonstrate:

1. Bounty Generator has a bounded treasury.
2. It creates a safe internal bounty.
3. Agents auto-form a team.
4. Jobs execute and emit canonical events.
5. Evaluator verifies or rejects the result.
6. Proof of Outcome is generated.
7. Revenue/cost settles into treasury.
8. Learning signals update agent/team priors.
9. The outcome is persisted.
10. The 3D simulation replays the entire lifecycle.
11. A profitable generator continues; a depleted generator emits `needs_funding` and stops.

## Non-negotiables

- stunning simulation-first UI
- multilingual UX from the beginning
- Tutor teaches by doing
- measurable outcomes/revenue/costs
- visible agent/team rankings based on verified performance
- autoorganization of temporary teams
- persistent historical success/failure graph
- BNB as home economic core
- external capabilities as explicit policy-gated venues
- no fake on-chain activity or fake revenue
- no LLM in arbitrage hot path
- no unrestricted autonomous mainnet capital deployment in v0
