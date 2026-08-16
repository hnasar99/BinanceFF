# Economic Mandate Layer

## Purpose

The Economic Mandate Layer is the delegated-authority, risk and execution-safety layer inside BinanceFF.

It is not a separate product, planner, marketplace or agent. BinanceFF remains the system that decomposes intents, discovers capabilities, composes agents, creates jobs, forms temporary organizations, verifies outcomes and learns from execution.

The Mandate Layer answers a narrower question:

> Is this agent, job or organization authorized to commit this capital or privileged capability under the current rules and risk limits?

The core invariant is:

`Mandate > Agent`

Agents decide what to propose. Mandates define what they are allowed to do.

## Architectural placement

```text
Intent
  -> Decompose
  -> Discover / Compose
  -> Plan
  -> Mandate Check
  -> Contract / Job
  -> Agent Action Proposal
  -> Risk Assessment
  -> Policy Decision
  -> Execute
  -> Proof of Outcome
  -> Settlement
  -> Reputation
  -> Learn / Spawn
```

The Mandate Layer sits between agent autonomy and capital commitment.

## What remains owned by BinanceFF

The following primitives remain part of the BinanceFF orchestration and economy model:

- Intent
- Capability
- Agent
- Plan
- Job
- Outcome
- Evidence
- Proof of Outcome
- Organization
- discovery and composition
- bounties
- teams / temporary organizations
- marketplace behavior
- learning
- spawn
- Bounty Generator
- canonical event stream
- external capabilities

The Mandate Layer must not redefine these primitives.

## What the Mandate Layer adds

- Mandate Registry
- Policy Engine
- Risk evaluation / Risk Twin
- Treasury guards
- scoped execution permissions
- kill switch
- equivalent-provider failover rules
- SHADOW / TESTNET / MAINNET execution modes where applicable
- execution receipts
- synthetic-data guards
- risk-aware reputation evidence
- heuristic governance

## Mandate profiles

The same primitive can support multiple economic contexts.

### User Capital Mandate

A user delegates authority over a bounded amount of capital.

Example:

```text
capital <= $5,000
chain = BNB
assets = [USDT, USDC]
max_protocol_exposure = 20%
leverage = false
```

### Job Mandate

A Job receives only the authority required to fulfill its contractual obligation.

Example:

```text
job_budget <= $300
capabilities = [research, quote, execute]
expiry = job deadline
```

### Treasury Mandate

A system actor such as the Bounty Generator receives bounded authority over a treasury.

Example:

```text
treasury = $10,000
max_bounty = $500
max_daily_deployment = $2,000
max_open_bounties = 8
reserve_floor = $2,000
max_drawdown = 20%
```

The Bounty Generator remains autonomous in deciding which bounties to propose, but it cannot spend outside this envelope.

## Hierarchical delegation

Mandates may form a delegation tree.

```text
Parent Mandate
  -> Organization Mandate
      -> Job Mandate
          -> Agent Session Permission
```

A child may always narrow authority and must never broaden it.

Examples:

```text
Parent: max capital $10,000
Child:  max capital $500
=> valid
```

```text
Parent: chains [BNB]
Child:  chains [BNB, Ethereum]
=> invalid
```

This property is required for safe agent-to-agent hiring.

## Agent autonomy versus economic authority

BinanceFF should preserve strong agent autonomy for:

- opportunity discovery
- plan generation
- team formation
- capability discovery
- negotiation
- job proposal
- bounty proposal
- learning
- candidate spawn

Economic execution is different.

An agent may propose:

> Spend 300 USDT to hire Agent B.

The system evaluates:

```text
Agent proposal
  -> Mandate scope
  -> Risk assessment
  -> Policy decision
  -> scoped signer / wallet permission
  -> execution
```

An agent never gains authority merely by deciding that it needs it.

## Wallet model

The long-term rule is not "agents can never sign".

The rule is:

> Agents must never receive unrestricted signing authority.

Autonomous economic agents may use:

- scoped wallets
- smart accounts
- session keys
- delegated permissions
- MPC or equivalent constrained signers

Example permission:

```text
spend <= $500
asset = USDT
chain = BNB
venue = PancakeSwap
expiry = 24h
```

An unrestricted permission such as `send entire treasury anywhere` is incompatible with the architecture.

## Always-on economy versus fail-closed execution

BinanceFF may remain continuously active even when capital execution is paused.

```text
Discovery       RUNNING
Planning        RUNNING
Tutor           RUNNING
Learning        RUNNING
Simulation      RUNNING
Bounty Drafting RUNNING
Capital Execute PAUSED
```

Fail-closed means the system refuses uncertain economic execution. It does not require the whole agent economy to stop learning, simulating or discovering.

## Policy Engine

The Policy Engine answers:

> Does this proposed action comply with the active Mandate?

It should be deterministic wherever practical and have veto power over agents.

Typical checks include:

- budget
- asset
- chain
- venue / protocol
- capability
- operation size
- rate limits
- slippage
- concentration
- risk score
- confidence
- expiry
- reserve floor
- signer scope
- synthetic-data restrictions
- kill-switch state

Typical result:

```text
ALLOW
```

or

```text
DENY(reason_codes[])
```

## Risk layer

Risk evaluation is separate from policy enforcement.

The strategy or agent proposes what appears economically attractive. The risk layer quantifies or classifies the downside. The policy layer decides whether that risk is permitted.

Financial actions may use a fallback hierarchy such as:

```text
Monte Carlo
  -> Historical simulation
  -> Stress scenarios
  -> Conservative deterministic checks
  -> FAIL CLOSED
```

The implementation may vary by capability. The invariant is that inability to measure required risk must never be interpreted as low risk.

## Execution modes

For blockchain and financial execution the same policy path should support progressive validation:

```text
SHADOW -> TESTNET -> MAINNET
```

### SHADOW

Generate decisions and receipts without real capital movement.

Shadow is a product feature, not merely a developer environment. It enables agent evaluation before delegated capital is granted.

### TESTNET

Exercise the same execution path using test infrastructure when available.

### MAINNET

Real economic execution. Mainnet must be explicit, revocable and protected by multiple independent gates.

Synthetic fixtures must never authorize real capital execution.

## Failover invariant

Infrastructure may fail over only to a semantically equivalent provider.

> Failover may change an equivalent infrastructure provider. It must never silently change the chain, mandate, asset, venue, protocol, risk limits or transaction semantics.

Examples:

- RPC A -> RPC B on the same chain: valid
- price provider A -> approved price provider B for the same asset: valid
- missing ETH price -> trade BNB instead: invalid
- unavailable BNB venue -> execute on Ethereum without authorization: invalid

## Bounty Generator integration

The Bounty Generator stays outside the Mandate Layer and uses it as a treasury governor.

```text
Bounty Generator
  -> proposes bounty
  -> Treasury Mandate
  -> risk / capital allocation / policy
  -> publish and fund bounty
```

Its economic lifecycle can remain autonomous:

```text
generate -> fund -> execute -> evaluate -> earn -> reinvest
```

but only inside its active Treasury Mandate.

If performance depletes the available treasury, the actor may enter states such as:

- low_funds
- needs_funding
- paused

It cannot self-authorize a larger treasury or higher risk limit.

## External capabilities

BNB Chain is the home ecosystem, but Mandates should govern economic authority across both BNB-native and approved external capabilities.

A Mandate may therefore include fields such as:

- `allowedChains`
- `allowedVenues`
- `allowedProtocols`
- `allowedExternalCapabilities`

Example:

```yaml
external_capabilities:
  prediction_market:
    enabled: true
    max_exposure: 250
```

External capability access must never imply unrestricted treasury access.

## Learning and Spawn

BinanceFF intentionally learns from outcomes and may eventually spawn new supply.

The safe sequence is:

```text
Experience
  -> Learning Engine
  -> heuristic / strategy / agent candidate
  -> validation
  -> activation
```

Never:

```text
loss
  -> agent increases its own risk limit
```

Spawn may increase capability supply. It may not increase authority.

## Proof of Outcome integration

The Mandate Layer must not create a parallel truth system.

Policy decisions, risk assessments and execution receipts become Evidence in BinanceFF's existing Proof of Outcome.

```text
ProofOfOutcome
  -> Evidence[]
       - mandateDecision
       - riskAssessment
       - executionReceipt
       - paymentReceipt
       - blockchainTx
       - providerEvidence
```

A profitable action that violates its Mandate is not a successful outcome.

## Reputation implications

Revenue alone is an unsafe ranking signal.

Agent and team reputation should eventually account for:

- economic performance
- risk-adjusted performance
- policy compliance
- outcome quality
- evidence quality
- reliability
- execution quality
- cost efficiency

A positive return with a policy violation should negatively affect reputation even if the raw P&L is positive.

## Canonical event stream

The Mandate Layer emits into BinanceFF's canonical event stream rather than maintaining an independent source of truth.

Relevant event types may include:

- mandate.created
- mandate.delegated
- mandate.revoked
- action.proposed
- risk.assessed
- risk.degraded
- policy.allowed
- policy.denied
- execution.shadowed
- execution.submitted
- execution.confirmed
- execution.failed
- failover.activated
- kill_switch.activated

Consumers may include UI, Tutor, persistence, evaluation and learning.

## Non-negotiable invariants

1. Mandate > Agent.
2. Agents propose; policy authorizes economic execution.
3. Child Mandates may narrow but never broaden parent authority.
4. No unrestricted signing authority for autonomous agents.
5. Failure to assess required risk results in fail-closed execution.
6. Failover never changes economic semantics silently.
7. Synthetic fixtures cannot authorize production capital movement.
8. Spawn increases capability, not authority.
9. Every economic decision must be reconstructable from evidence.
10. Mandate events feed BinanceFF's Proof of Outcome and canonical event stream; they do not create a parallel audit universe.

## Implementation order

Do not build the entire Mandate system before the first BinanceFF vertical slice.

Recommended progression:

1. Keep the first intent -> multi-agent -> jobs -> outcome -> Proof of Outcome slice small.
2. Add `Mandate` and `mandateId` to domain contracts.
3. Add a minimal deterministic policy gate for budget and capability scope.
4. Emit mandate/policy decisions as Evidence.
5. Add Shadow execution for economic actions.
6. Add treasury delegation and child Mandates.
7. Add risk evaluation appropriate to the first real financial capability.
8. Add scoped signing and testnet execution.
9. Add production/mainnet gates only after failure paths are exercised.

This keeps Mandates structural without allowing the safety layer to stall the executable product.
