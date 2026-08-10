# BinanceFF

Experimental lab for the next generation of autonomous agent economies on BNB Chain.

## Thesis

We are not building a static directory of AI agents. We are exploring the infrastructure that becomes necessary when agents have identity, wallets, budgets, contractual obligations, the ability to discover other agents, hire them, evaluate outcomes, and form temporary organizations.

Core loop:

`intent -> decompose -> discover/compose -> transact -> execute -> verify -> learn/spawn`

## Initial product hypothesis

A human or agent expresses an **intent**. The system decomposes it into capabilities, finds or composes the agents required to satisfy it, negotiates jobs and budgets, executes the work, and produces a verifiable **Proof of Outcome**.

If a required capability does not exist or is economically unattractive, the system should eventually be able to create or configure new supply dynamically.

## Core primitives

- **Intent** — desired outcome + constraints + budget + deadline
- **Capability** — atomic thing an agent can credibly perform
- **Agent** — economic actor with identity, endpoint, permissions and history
- **Job** — contractual unit of work between actors
- **Outcome** — result of a job or composed workflow
- **Evidence** — sources, traces, tool calls and attestations supporting an outcome
- **Proof of Outcome** — verifiable record explaining how an outcome was produced
- **Organization** — temporary graph of agents formed around an intent

## Engineering strategy

`main` stays stable. New executable work uses small branches and pull requests. Experiments may be disposable; protocol and domain contracts are not.

## Status

Phase 0 — establish the executable vertical slice: intent -> multiple agents -> jobs -> outcome -> verification.
