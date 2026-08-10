use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionPolicy {
    pub min_profit_bps: u32,
    pub max_notional_usd: f64,
    pub max_state_age_ms: u64,
    pub kill_switch: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketEvent {
    pub sequence: u64,
    pub observed_at_unix_ms: u64,
    pub buy_price: f64,
    pub sell_price: f64,
    pub available_notional_usd: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Opportunity {
    pub gross_profit_bps: f64,
    pub notional_usd: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DecisionKind {
    Execute,
    Reject,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionDecision {
    pub kind: DecisionKind,
    pub reason: &'static str,
    pub opportunity: Option<Opportunity>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionTelemetry {
    pub event_to_decision_ns: u128,
    pub decision_to_submit_ns: u128,
    pub total_ns: u128,
}

#[derive(Debug, Error)]
pub enum EngineError {
    #[error("kill switch enabled")]
    KillSwitch,
    #[error("stale market state")]
    StaleState,
}

pub trait Clock {
    fn now_unix_ms(&self) -> u64;
}

pub trait Submitter {
    fn submit(&self, payload: &[u8]);
}

pub struct ExecutionEngine<C, S> {
    policy: ExecutionPolicy,
    clock: C,
    submitter: S,
}

impl<C: Clock, S: Submitter> ExecutionEngine<C, S> {
    pub fn new(policy: ExecutionPolicy, clock: C, submitter: S) -> Self {
        Self { policy, clock, submitter }
    }

    pub fn process(&self, event: &MarketEvent) -> Result<(ExecutionDecision, ExecutionTelemetry), EngineError> {
        let started = Instant::now();

        if self.policy.kill_switch {
            return Err(EngineError::KillSwitch);
        }

        let age = self.clock.now_unix_ms().saturating_sub(event.observed_at_unix_ms);
        if age > self.policy.max_state_age_ms {
            return Err(EngineError::StaleState);
        }

        let gross_profit_bps = ((event.sell_price / event.buy_price) - 1.0) * 10_000.0;
        let notional_usd = event.available_notional_usd.min(self.policy.max_notional_usd);
        let opportunity = Opportunity { gross_profit_bps, notional_usd };

        let decision_started = Instant::now();
        let decision = if gross_profit_bps >= self.policy.min_profit_bps as f64 {
            ExecutionDecision {
                kind: DecisionKind::Execute,
                reason: "profit_threshold_met",
                opportunity: Some(opportunity),
            }
        } else {
            ExecutionDecision {
                kind: DecisionKind::Reject,
                reason: "profit_below_threshold",
                opportunity: Some(opportunity),
            }
        };

        if decision.kind == DecisionKind::Execute {
            // Placeholder deterministic payload. Production path will replace this with prebuilt calldata templates.
            let payload = event.sequence.to_le_bytes();
            self.submitter.submit(&payload);
        }

        let finished = Instant::now();
        let telemetry = ExecutionTelemetry {
            event_to_decision_ns: decision_started.duration_since(started).as_nanos(),
            decision_to_submit_ns: finished.duration_since(decision_started).as_nanos(),
            total_ns: finished.duration_since(started).as_nanos(),
        };

        Ok((decision, telemetry))
    }
}

pub struct FixedClock(pub u64);
impl Clock for FixedClock {
    fn now_unix_ms(&self) -> u64 { self.0 }
}

#[derive(Default)]
pub struct NoopSubmitter;
impl Submitter for NoopSubmitter {
    fn submit(&self, _payload: &[u8]) {}
}

pub async fn bounded_event_loop<C, S>(
    engine: ExecutionEngine<C, S>,
    mut rx: tokio::sync::mpsc::Receiver<MarketEvent>,
) where
    C: Clock + Send + Sync + 'static,
    S: Submitter + Send + Sync + 'static,
{
    while let Some(event) = rx.recv().await {
        let _ = engine.process(&event);
        tokio::task::yield_now().await;
    }
}

pub fn ns_to_duration(ns: u128) -> Duration {
    Duration::from_nanos(ns.min(u64::MAX as u128) as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn engine(policy: ExecutionPolicy) -> ExecutionEngine<FixedClock, NoopSubmitter> {
        ExecutionEngine::new(policy, FixedClock(1_000), NoopSubmitter)
    }

    #[test]
    fn executes_profitable_opportunity() {
        let e = engine(ExecutionPolicy { min_profit_bps: 10, max_notional_usd: 5_000.0, max_state_age_ms: 50, kill_switch: false });
        let (decision, _) = e.process(&MarketEvent { sequence: 1, observed_at_unix_ms: 990, buy_price: 100.0, sell_price: 100.2, available_notional_usd: 10_000.0 }).unwrap();
        assert_eq!(decision.kind, DecisionKind::Execute);
        assert_eq!(decision.opportunity.unwrap().notional_usd, 5_000.0);
    }

    #[test]
    fn rejects_stale_state() {
        let e = engine(ExecutionPolicy { min_profit_bps: 10, max_notional_usd: 5_000.0, max_state_age_ms: 5, kill_switch: false });
        let err = e.process(&MarketEvent { sequence: 1, observed_at_unix_ms: 990, buy_price: 100.0, sell_price: 101.0, available_notional_usd: 1_000.0 }).unwrap_err();
        assert!(matches!(err, EngineError::StaleState));
    }

    #[test]
    fn kill_switch_blocks_execution() {
        let e = engine(ExecutionPolicy { min_profit_bps: 10, max_notional_usd: 5_000.0, max_state_age_ms: 50, kill_switch: true });
        let err = e.process(&MarketEvent { sequence: 1, observed_at_unix_ms: 1_000, buy_price: 100.0, sell_price: 101.0, available_notional_usd: 1_000.0 }).unwrap_err();
        assert!(matches!(err, EngineError::KillSwitch));
    }
}
