# Experience Architecture

## Non-negotiable

The interface is part of the product thesis, not decoration.

BinanceFF should feel closer to a strategy game, economic simulation, or sci-fi operating system than a traditional SaaS dashboard.

The user should be able to understand the autonomous economy by watching it operate.

## Experience principles

1. **World, not dashboard**
   - Avoid default SaaS patterns as the primary experience: card grids, CRUD tables, generic admin sidebars.
   - The main surface is a live simulation space.

2. **Events are visible**
   - Important backend behavior must emit domain events that can be represented visually.
   - No critical orchestration behavior should be hidden behind static status text only.

3. **3D must encode meaning**
   - Depth, motion, particles and camera movement are used to reveal system structure, relationships, state and flow.
   - Do not add 3D purely as visual garnish.

4. **Cinematic but legible**
   - The system should produce moments of surprise without sacrificing comprehension.
   - The demo must remain understandable with sound disabled and without narration.

5. **Simulation-first architecture**
   - The frontend consumes real orchestration events.
   - Mock/demo events must be explicitly marked and never presented as real on-chain activity.

## Primary visual model

- Intent = central mission/core/objective node
- Agent = autonomous actor/entity
- Capability = role/function required by the intent
- Job = active contract/edge between actors
- Budget/payment = animated value flow along a job edge
- Evidence = artifacts orbiting or attaching to outcomes
- Evaluator = independent verification actor
- Failure = visible interruption/fracture/re-routing
- Replacement = new node entering the graph
- Proof of Outcome = final collapsed, inspectable execution artifact
- Organization = temporary spatial graph formed around an intent

## Event stream

The orchestrator should eventually emit events such as:

- `intent.created`
- `intent.decomposed`
- `capability.required`
- `agent.discovered`
- `agent.assigned`
- `organization.formed`
- `job.created`
- `job.started`
- `budget.reserved`
- `payment.locked`
- `job.progress`
- `job.completed`
- `job.failed`
- `agent.replaced`
- `evidence.attached`
- `evaluation.started`
- `evaluation.rejected`
- `evaluation.completed`
- `outcome.proposed`
- `outcome.verified`
- `organization.dissolved`

Every event should contain a timestamp, correlation identifiers, actor references and a payload suitable for replay.

## Simulation application

Prefer the name `apps/simulation` over `apps/web` for the primary experience.

Candidate stack:

- React + TypeScript
- React Three Fiber / Three.js
- Drei where useful
- GSAP for timeline/camera/interface choreography
- postprocessing only when it improves hierarchy and atmosphere
- WebSocket or SSE event feed from the orchestration runtime

The stack is not sacred. Performance, clarity and execution quality win.

## First wow sequence

1. Empty simulation field.
2. User enters an intent.
3. Intent core materializes.
4. Required capabilities emerge spatially.
5. Candidate agents are discovered and pulled into the field.
6. Selected agents bind into a temporary organization.
7. Jobs activate and budget flows become visible.
8. Provider results return as evidence objects.
9. Evaluator enters independently.
10. A failure or rejection should visibly reconfigure the graph when present.
11. Verified result collapses into a Proof of Outcome object.
12. User can inspect exactly who did what, what it cost, what evidence exists and what was verified.

## Quality bar

If a feature is architecturally important but visually indistinguishable from a generic loading spinner, the experience is unfinished.

The target reaction is not "nice dashboard". The target reaction is "I have not seen an agent economy behave like this before."
