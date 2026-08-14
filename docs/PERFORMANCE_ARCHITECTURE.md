# Performance Architecture

## Principle

Arbitrage and other latency-sensitive execution must not share the same critical path as LLM reasoning, UI rendering, or general-purpose orchestration.

We split the system into two planes:

1. **Intelligence plane** — slower, adaptive, agentic. Finds opportunities, composes strategies, evaluates risk, updates policy.
2. **Execution plane** — deterministic, precomputed, ultra-low-latency. Watches chain state, prices opportunities, signs and submits transactions.

The execution plane must be able to operate without waiting on an LLM.

## Target stack

### Hot path

- Rust
- Tokio runtime
- Alloy for EVM RPC / signing / typed primitives
- direct WebSocket / IPC connections to our own BSC node(s)
- zero-copy / allocation-conscious data structures where practical
- in-memory state, bounded channels, lock avoidance on critical paths
- pre-built transaction templates and calldata
- local signing / HSM-compatible signer abstraction
- nanosecond/microsecond instrumentation for internal stages

### Control / intelligence plane

- TypeScript where developer velocity matters
- LLM/agent orchestration outside the hot path
- strategy compilation into deterministic execution policies
- asynchronous persistence and analytics

### UI plane

- React + React Three Fiber / Three.js
- receives sampled/aggregated execution events
- never blocks execution

## Node strategy

Public RPC is unacceptable for competitive arbitrage. Production design assumes dedicated BSC full nodes close to execution infrastructure, with WebSocket and preferably IPC/local network access.

The system should support multiple nodes/providers for redundancy and latency racing.

## Hot-path lifecycle

`new block / pending tx / pool update -> local state update -> opportunity calculation -> profitability/risk gate -> transaction build -> local sign -> submit/race -> observe inclusion`

No database call, HTTP microservice hop, UI call, or LLM call is allowed in this path.

## Architecture boundary

Agent output is compiled into an **ExecutionPolicy** containing deterministic rules such as:

- markets/pools allowed
- assets allowed
- max capital
- minimum expected net profit
- maximum slippage
- gas policy
- routing constraints
- expiry
- kill switch

The execution engine consumes ExecutionPolicy, never natural language.

## Performance budgets

Every hot-path stage must emit latency telemetry. Initial engineering budgets are internal targets and must be benchmarked rather than claimed as network guarantees.

Track at minimum:

- event receive -> decoded
- state update
- opportunity calculation
- route calculation
- transaction construction
- signing
- submission
- node/RPC round trip
- event -> submission total
- submission -> inclusion

Report p50 / p95 / p99 and worst-case.

## Design rules

1. No Python in the arbitrage hot path.
2. No LLM calls in the arbitrage hot path.
3. No unbounded queues.
4. No synchronous database access.
5. No unnecessary serialization between internal stages.
6. Prefer one process for the first production-grade execution engine before distributing the hot path into microservices.
7. Benchmark before optimizing; profile CPU, allocations, locks, network and node latency separately.
8. Precompute everything that can be precomputed.
9. Fail closed when policy, state freshness or profitability confidence is uncertain.
10. UI and telemetry are consumers of execution events, never dependencies.

## Forward path

The larger BinanceFF agent economy can discover strategies and create/modify agents, while the arbitrage executor behaves more like an exchange-grade engine: deterministic, bounded and aggressively optimized.
