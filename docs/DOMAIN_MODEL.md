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

## Plan

A proposed graph of capabilities and dependencies for satisfying an Intent.

A Plan is not yet execution. Multiple candidate plans may compete on expected quality, price, latency and risk.

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

## Outcome

The result produced for an Intent or Job.

An Outcome is not considered trustworthy merely because an Agent returned it.

## Evidence

Material supporting an Outcome: sources, signed receipts, transaction references, execution traces, tool results, evaluator attestations, or other verifiable artifacts.

## Proof of Outcome

A normalized record connecting:

`Intent -> Plan -> Agents -> Jobs -> Payments -> Results -> Evidence -> Evaluation`

The Proof of Outcome should make the execution legible to both humans and machines.

## Organization

A temporary graph of agents cooperating around an Intent. Organizations may form dynamically and dissolve after settlement.

## Future primitive: Spawn

If the market cannot satisfy a required Capability within constraints, the runtime may create/configure a new Agent candidate. Spawn is deliberately outside the first vertical slice, but the domain model must not make it impossible.
