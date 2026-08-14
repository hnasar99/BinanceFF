use binanceff_execution_engine::{ExecutionEngine, ExecutionPolicy, FixedClock, MarketEvent, NoopSubmitter};
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn hot_path_benchmark(c: &mut Criterion) {
    let engine = ExecutionEngine::new(
        ExecutionPolicy {
            min_profit_bps: 5,
            max_notional_usd: 25_000.0,
            max_state_age_ms: 25,
            kill_switch: false,
        },
        FixedClock(1_000),
        NoopSubmitter,
    );

    let event = MarketEvent {
        sequence: 42,
        observed_at_unix_ms: 995,
        buy_price: 100.0,
        sell_price: 100.15,
        available_notional_usd: 50_000.0,
    };

    c.bench_function("event_to_mock_submit", |b| {
        b.iter(|| {
            let result = engine.process(black_box(&event));
            black_box(result).unwrap();
        })
    });
}

criterion_group!(benches, hot_path_benchmark);
criterion_main!(benches);
