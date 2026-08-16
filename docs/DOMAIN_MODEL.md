# Domain Model v0

This vocabulary is intentionally small. We will evolve it from executable experiments rather than designing a complete protocol up front.

## Intent

A requested outcome expressed by a human or agent.

Minimum fields:

- `id`
- `objective`
- `constraints`
- `budget`
- `deadline`
- `requester`
- `status`

## Capability

An atomic economic capability that can be requested, priced, executed and evaluated.

Minimum fields:

- `id`
- `name`
- `inputSchema`
- `outputSchema`
- `evaluationCriteria`

## Agent

An actor capable of offering one or more capabilities.

Minimum fields:

- `id`
- `identityRef`
- `endpoint`
- `capabilities`
- `pricing`
- `permissions`

An Agent may propose, coordinate and execute actions, but it cannot expand the economic authority granted by a Mandate.

## Plan

A proposed graph of capabilities and dependencies for satisfying an Intent.

A Plan is not yet execution. Multiple candidate plans may compete on expected quality, price, latency and risk.

A Plan may reference one or more Mandates that constrain how its Jobs can commit capital or use delegated permissions.

## Mandate

A machine-verifiable envelope of delegated economic authority.

A Mandate constrains what an Agent, Job, Organization or treasury is allowed to do with capital or privileged execution capabilities. It does not replace Intent, Plan or Job.

Minimum fields:

- `id`
- `principal`
- `scope`
- `budgetLimits`
- `allowedCapabilities`
- `allowedVenues`
- `allowedChains`
- `allowedAssets`
- `riskLimits`
- `executionMode`
- `expiry`
- `status`

Possible additional fields:

- `maxOperationSize`
- `maxDailyDeployment`
- `maxDrawdown`
- `maxSlippage`
- `minConfidence`
- `reserveFloor`
- `stopConditions`
- `parentMandateId`

### Mandate hierarchy

Mandates may delegate narrower authority through child Mandates.

A child Mandate may reduce authority but must never expand its parent.

Examples:

- parent budget `$10,000` -> child budget `$500`: valid
- parent chains `[BNB]` -> child chains `[BNB, Ethereum]`: invalid

This invariant is fundamental to agent-to-agent delegation and Bounty Generator treasury control.

## Job

A contractual assignment of a capability to an Agent.

Minimum fields:

- `id`
- `intentId`
- `capabilityId`
- `providerAgentId`
- `consumerAgentId/requester`
- `budget`
- `deadline`
- `status`
- `resultRef`

Optional economic authorization fields:

- `mandateId`
- `childMandateId`

A Job defines an obligation; a Mandate defines the authority available to fulfill it.

## Action Proposal

A concrete economic or privileged action proposed during execution of a Plan or Job.

Examples include publishing a funded bounty, spending treasury funds, swapping assets, hiring another Agent, paying for an external capability, or invoking a scoped signer.

An Action Proposal is not authorized merely because an Agent produced it.

Before execution it may pass through:

`proposal -> risk evaluation -> policy decision -> execution permission`

## Policy Decision

A deterministic authorization result stating whether an Action Proposal complies with its active Mandate.

Typical result:

- `ALLOW`
- `DENY`

A denial should contain machine-readable reasons.

Policy enforcement has veto power over agent execution.

## Risk Assessment

An assessment of the expected economic or operational risk associated with an Action Proposal.

For financial actions, implementations may use model fallbacks such as Monte Carlo, historical simulation, stress testing and conservative deterministic checks.

If the system cannot assess required risk with sufficient confidence, economic execution should fail closed rather than assume low risk.

## Execution Receipt

An auditable record of an attempted or completed economic execution.

It may include:

- mandate reference
- agent and job references
- policy decision
- risk assessment
- execution mode
- selected infrastructure/provider
- transaction or payment reference
- status
- fallback path
- errors

Execution Receipts become Evidence inside Proof of Outcome rather than creating a second audit model.

## Outcome

The result produced for an Intent or Job.

An Outcome is not considered trustworthy merely because an Agent returned it.

## Evidence

Material supporting an Outcome: sources, signed receipts, transaction references, execution traces, tool results, mandate decisions, risk assessments, evaluator attestations, or other verifiable artifacts.

## Proof of Outcome

A normalized record connecting:

`Intent -> Plan -> Agents -> Jobs -> Payments -> Results -> Evidence -> Evaluation`

The Proof of Outcome should make the execution legible to both humans and machines.

Mandate decisions, risk assessments and execution receipts should be represented as Evidence within this record.

## Organization

A temporary graph of agents cooperating around an Intent. Organizations may form dynamically and dissolve after settlement.

Organizations can receive scoped authority through a Mandate, then delegate only narrower child Mandates to member Agents or Jobs.

## Treasury

Capital controlled by a human, Agent, Organization or first-party system actor such as the Bounty Generator.

A Treasury should not imply unrestricted signing authority. Economic autonomy should be implemented through scoped wallets, smart accounts, session permissions or equivalent mechanisms constrained by Mandates.

## Future primitive: Spawn

If the market cannot satisfy a required Capability within constraints, the runtime may create/configure a new Agent candidate. Spawn is deliberately outside the first vertical slice, but the domain model must not make it impossible.

Spawn may increase available capability but must never implicitly expand an existing Mandate or bypass policy enforcement.
