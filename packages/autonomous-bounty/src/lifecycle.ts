import {
  canFundBounty,
  settleTreasury,
  type BountySettlementInput,
  type TreasuryPolicy,
  type TreasurySnapshot,
} from './treasury';

export type GeneratorAction =
  | { type: 'launch_bounty'; budget: number }
  | { type: 'reduce_bounty_size'; budget: number }
  | { type: 'request_funding'; reason: string }
  | { type: 'pause'; reason: string };

export interface GeneratorPolicy extends TreasuryPolicy {
  targetBountyBudget: number;
  lowFundsBountyFactor: number;
}

export function nextGeneratorAction(
  treasury: TreasurySnapshot,
  policy: GeneratorPolicy,
): GeneratorAction {
  if (treasury.status === 'paused') {
    return { type: 'pause', reason: 'generator_paused' };
  }

  if (treasury.status === 'needs_funding') {
    return {
      type: 'request_funding',
      reason: `Treasury balance ${treasury.balance.toFixed(2)} is below the minimum operating threshold`,
    };
  }

  const desiredBudget =
    treasury.status === 'low_funds'
      ? Math.min(policy.targetBountyBudget * policy.lowFundsBountyFactor, policy.maxSpendPerBounty)
      : Math.min(policy.targetBountyBudget, policy.maxSpendPerBounty);

  if (!canFundBounty(treasury, desiredBudget, policy)) {
    return {
      type: 'request_funding',
      reason: 'Treasury cannot fund the next bounded bounty while preserving required reserves',
    };
  }

  return treasury.status === 'low_funds'
    ? { type: 'reduce_bounty_size', budget: desiredBudget }
    : { type: 'launch_bounty', budget: desiredBudget };
}

export function applyBountyOutcome(
  treasury: TreasurySnapshot,
  settlement: BountySettlementInput,
  policy: TreasuryPolicy,
): TreasurySnapshot {
  const result = settleTreasury(treasury, settlement, policy);

  return {
    ...treasury,
    balance: result.nextBalance,
    realizedRevenue: treasury.realizedRevenue + settlement.grossRevenue,
    realizedCosts:
      treasury.realizedCosts +
      settlement.executionCost +
      settlement.agentPayouts +
      settlement.platformFees +
      (settlement.capitalLoss ?? 0),
    realizedPnl: treasury.realizedPnl + result.netPnl,
    status: result.nextStatus,
  };
}
