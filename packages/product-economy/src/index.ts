export type PricingModel = 'fixed' | 'performance' | 'hybrid';

export interface BountyEconomics {
  pricingModel: PricingModel;
  budgetUsd: number;
  successFeeBps: number;
}

export interface BountySettlementInput {
  economics: BountyEconomics;
  grossResultUsd?: number;
  executionCostUsd: number;
  agentFeesUsd: number;
}

export interface BountySettlement {
  userNetResultUsd: number;
  platformFeeUsd: number;
  totalCostUsd: number;
  measurableUpsideUsd: number;
}

export function settleBounty(input: BountySettlementInput): BountySettlement {
  const gross = input.grossResultUsd ?? 0;
  const baseCost = input.executionCostUsd + input.agentFeesUsd;
  const measurableUpside = Math.max(0, gross - baseCost);

  let platformFeeUsd = 0;

  if (input.economics.pricingModel === 'fixed') {
    platformFeeUsd = input.economics.budgetUsd;
  } else if (input.economics.pricingModel === 'performance') {
    platformFeeUsd = measurableUpside * (input.economics.successFeeBps / 10_000);
  } else {
    platformFeeUsd = input.economics.budgetUsd + measurableUpside * (input.economics.successFeeBps / 10_000);
  }

  return {
    measurableUpsideUsd: measurableUpside,
    platformFeeUsd,
    totalCostUsd: baseCost + platformFeeUsd,
    userNetResultUsd: gross - baseCost - platformFeeUsd,
  };
}

export interface PerformanceVector {
  verifiedSuccessRate: number;
  revenueEfficiency: number;
  latencyScore: number;
  riskAdjustedScore: number;
  taskSimilarity: number;
}

export function rankPerformance(vector: PerformanceVector): number {
  const score =
    vector.verifiedSuccessRate * 0.35 +
    vector.revenueEfficiency * 0.25 +
    vector.latencyScore * 0.1 +
    vector.riskAdjustedScore * 0.2 +
    vector.taskSimilarity * 0.1;

  return Math.max(0, Math.min(1, score));
}

export function teamFingerprint(agentIds: string[]): string {
  return [...agentIds].sort().join('::');
}
