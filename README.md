# BinanceFF

Experimental lab for the next generation of autonomous agent economies on BNB Chain.

## Thesis

We are not building a static directory of AI agents. We are exploring the infrastructure that becomes necessary when agents have identity, wallets, budgets, contractual obligations, the ability to discover other agents, hire them, evaluate outcomes, and form temporary organizations.

Core loop:

`intent -> decompose -> discover/compose -> plan -> mandate check -> transact -> execute -> verify -> settle -> learn/spawn`

## Initial product hypothesis

A human or agent expresses an **intent**. The system decomposes it into capabilities, finds or composes the agents required to satisfy it, negotiates jobs and budgets, executes the work, and produces a verifiable **Proof of Outcome**.

If a required capability does not exist or is economically unattractive, the system should eventually be able to create or configure new supply dynamically.

Autonomy does not imply unrestricted authority over capital. Economic actions are governed by explicit **Mandates** that define budgets, permissions, venues, risk limits, execution modes and stop conditions. Agents may propose and coordinate actions; Mandates, risk evaluation and policy enforcement determine whether those actions are authorized.

## Core primitives

- **Intent** — desired outcome + constraints + budget + deadline
- **Capability** — atomic thing an agent can credibly perform
- **Agent** — economic actor with identity, endpoint, permissions and history
- **Plan** — candidate graph of capabilities and dependencies
- **Mandate** — machine-verifiable envelope of delegated economic authority and risk constraints
- **Job** — contractual unit of work between actors
- **Outcome** — result of a job or composed workflow
- **Evidence** — sources, traces, tool calls, mandate decisions, receipts and attestations supporting an outcome
- **Proof of Outcome** — verifiable record explaining how an outcome was produced
- **Organization** — temporary graph of agents formed around an intent

## Economic safety model

`Mandate > Agent`

An agent may decide what to propose, but it cannot expand the authority granted to it. Before capital is committed or a scoped signer is used, the action must pass the Mandate layer:

`proposal -> risk evaluation -> policy decision -> execution permission -> execution receipt`

The Mandate layer is not a separate product or agent marketplace. It is the economic safety and delegated-authority layer inside BinanceFF.

See [`docs/MANDATE_LAYER.md`](docs/MANDATE_LAYER.md).

## Engineering strategy

`main` stays stable. New executable work uses small branches and pull requests. Experiments may be disposable; protocol and domain contracts are not.

## Status

Phase 0 — establish the executable vertical slice: intent -> multiple agents -> jobs -> outcome -> verification, while defining the Mandate contract that future economic execution must satisfy.
