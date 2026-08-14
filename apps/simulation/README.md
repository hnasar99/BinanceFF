# Simulation App

Primary interactive experience for BinanceFF.

This app is a live visualization of the agent economy. It must consume replayable orchestration events and render the lifecycle of an intent as a spatial, animated system.

## First milestone

Replay a deterministic fixture stream covering:

- intent creation
- decomposition into capabilities
- agent discovery and assignment
- organization formation
- job execution
- budget flow
- evidence return
- evaluation
- verified outcome

The first implementation may use fixtures only, but the event schema must match the future runtime feed.

## UX rule

Do not default to a dashboard shell. The simulation field is the application.

## Suggested stack

- React + TypeScript
- Vite
- React Three Fiber
- Drei
- GSAP

## Integration boundary

The app should depend on a typed event contract rather than backend implementation details. The same event stream should support:

- live mode
- recorded replay
- cinematic demo mode
- debugging timeline
