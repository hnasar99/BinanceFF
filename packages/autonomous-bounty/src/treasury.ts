export type TreasuryStatus =
  | 'active'
  | 'low_funds'
  | 'needs_funding'
  | 'paused';

export interface TreasuryPolicy {
  minOperatingBalance: number;
  maxSpendPerBounty: number;
  maxSpendPerHour: number;
  maxSpendPerDay: number;
  reserveRatio: number;
}

export interface TreasurySnapshot {
  walletId: string;
  balance: number;
  realizedRevenue: number;
  realizedCosts: number;
  realizedPnl: number;
  activeCapitalAtRisk: number;
  status: TreasuryStatus;
}

export interface BountySettlementInput {
  grossRevenue: number;
  executionCost: number;
  agentPayouts: number;
  platformFees: number;
  capitalLoss?: number;
}

export interface BountySettlementResult {
  netPnl: number;
  nextBalance: number;
  nextStatus: TreasuryStatus;
}

export function settleTreasury(
  current: TreasurySnapshot,
  input: BountySettlementInput,
  policy: TreasuryPolicy,
): BountySettlementResult {
  const netPnl =
    input.grossRevenue -
    input.executionCost -
    input.agentPayouts -
    input.platformFees -
    (input.capitalLoss ?? 0);

  const nextBalance = current.balance + netPnl;

  let nextStatus: TreasuryStatus = 'active';
  if (nextBalance <= 0 || nextBalance < policy.minOperatingBalance) {
    nextStatus = 'needs_funding';
  } else if (nextBalance < policy.minOperatingBalance * 2) {
    nextStatus = 'low_funds';
  }

  return { netPnl, nextBalance, nextStatus };
}

export function canFundBounty(
  treasury: TreasurySnapshot,
  requestedBudget: number,
  policy: TreasuryPolicy,
): boolean {
  if (treasury.status === 'paused' || treasury.status === 'needs_funding') {
    return false;
  }

  if (requestedBudget > policy.maxSpendPerBounty) {
    return false;
  }

  const reserve = treasury.balance * policy.reserveRatio;
  return treasury.balance - requestedBudget >= reserve;
}
