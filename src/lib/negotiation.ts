import type { Transfer, Contract, Player, NegotiationStep } from '@/data/types'
import { daysUntil } from './format'

export interface NegotiationContext {
  player: Player
  contract: Contract | null
  transfer: Transfer
}

export interface CounterOfferResult {
  counterPrice: number
  acceptProbability: number
  isLowball: boolean
  rationale: string
  nextStep: NegotiationStep
}

export interface DealResult {
  success: boolean
  finalPrice: number
  message: string
}

const STEP_ORDER: NegotiationStep[] = [
  'idle',
  'offer_sent',
  'counter_received',
  'offer_2_sent',
  'counter_2_received',
  'final_offer',
  'deal',
  'collapse',
]

export function stepIndex(step: NegotiationStep | undefined): number {
  if (!step) return 0
  return STEP_ORDER.indexOf(step)
}

export function nextStep(current: NegotiationStep, isOurMove: boolean): NegotiationStep {
  const order = [...STEP_ORDER]
  const idx = order.indexOf(current)
  if (idx < 0) return 'offer_sent'
  if (isOurMove && order[idx] === 'idle') return 'offer_sent'
  if (isOurMove && order[idx] === 'counter_received') return 'offer_2_sent'
  if (isOurMove && order[idx] === 'counter_2_received') return 'final_offer'
  if (!isOurMove && order[idx] === 'offer_sent') return 'counter_received'
  if (!isOurMove && order[idx] === 'offer_2_sent') return 'counter_2_received'
  return order[Math.min(idx + 1, order.length - 1)]
}

function computeBaseValue(ctx: NegotiationContext): number {
  const { player, contract, transfer } = ctx
  const ageFactor = Math.max(0.6, 1 - Math.abs(player.age - 23) * 0.04)
  const ratingFactor = (player.rating ?? 75) / 80
  const ask = transfer.askPrice
  return Math.round(ask * ratingFactor * ageFactor)
}

export function computeComplexity(ctx: NegotiationContext): 'standard' | 'urgent' | 'complex' {
  const days = ctx.contract ? daysUntil(ctx.contract.endDate) : 365
  if (ctx.contract?.buyout && ctx.contract.buyout > 0) return 'complex'
  if (days < 180) return 'urgent'
  return 'standard'
}

export function computeCounterOffer(
  ctx: NegotiationContext,
  ourOffer: number,
): CounterOfferResult {
  const { contract, transfer } = ctx
  const baseValue = computeBaseValue(ctx)
  const days = contract ? daysUntil(contract.endDate) : 365
  const heat = transfer.marketHeat ?? 50
  const buyout = contract?.buyout ?? 0

  const ask = transfer.askPrice
  const offerRatio = ourOffer / Math.max(1, ask)
  const valueRatio = ourOffer / Math.max(1, baseValue)

  let minAccept = baseValue * 0.7
  let targetAccept = baseValue * 0.95

  if (days < 60) {
    minAccept *= 0.75
    targetAccept *= 0.8
  } else if (days < 180) {
    minAccept *= 0.9
    targetAccept *= 0.92
  }
  if (buyout > 0 && ourOffer >= buyout * 0.9) {
    minAccept = buyout * 0.9
    targetAccept = buyout
  }
  const heatMul = 0.9 + (heat / 100) * 0.3
  minAccept *= heatMul
  targetAccept *= heatMul

  let counter: number
  let isLowball = false
  let rationale = ''

  if (offerRatio < 0.5) {
    isLowball = true
    counter = Math.round(baseValue * 0.95)
    rationale = '报价过低，对方团队表示不满，给出接近市价的还价。'
  } else if (valueRatio < 0.7) {
    isLowball = true
    counter = Math.round(targetAccept)
    rationale = '报价明显低于选手身价，对方坚持要价。'
  } else if (ourOffer >= targetAccept) {
    counter = ourOffer
    rationale = '报价已达到对方心理预期，可直接成交。'
  } else {
    const gap = targetAccept - ourOffer
    counter = Math.round(ourOffer + gap * 0.55)
    rationale = '进入正常议价区间，对方让步一半。'
  }

  counter = Math.max(Math.round(minAccept), Math.min(counter, Math.round(ask * 1.05)))

  const buyoutBonus = buyout > 0 && ourOffer >= buyout * 0.85 ? 0.35 : 0
  const deadlineBonus = days < 60 ? 0.25 : days < 180 ? 0.12 : 0
  const valueBonus = Math.max(0, Math.min(0.5, (ourOffer / Math.max(1, baseValue)) - 0.7) * 1.2)
  const acceptProbability = Math.min(
    0.98,
    Math.max(0.05, 0.25 + buyoutBonus + deadlineBonus + valueBonus),
  )

  const stepsAfter = STEP_ORDER.indexOf(transfer.negotiationStep ?? 'idle')
  const nextS: NegotiationStep =
    stepsAfter <= 1 ? 'counter_received' : stepsAfter <= 3 ? 'counter_2_received' : 'final_offer'

  return {
    counterPrice: counter,
    acceptProbability: Math.round(acceptProbability * 100),
    isLowball,
    rationale,
    nextStep: nextS,
  }
}

export function evaluateDeal(
  ctx: NegotiationContext,
  ourOffer: number,
): DealResult {
  const result = computeCounterOffer(ctx, ourOffer)
  const success = Math.random() * 100 < result.acceptProbability || ourOffer >= result.counterPrice
  if (success) {
    const finalPrice = Math.round(ourOffer + (result.counterPrice - ourOffer) * Math.random() * 0.4)
    return {
      success: true,
      finalPrice,
      message: `谈判成功，最终成交价 ¥${finalPrice.toLocaleString()}`,
    }
  }
  return {
    success: false,
    finalPrice: 0,
    message: '对方团队拒绝报价，谈判陷入僵局。',
  }
}

export function hoursUntilDeadline(deadline?: string): number {
  if (!deadline) return 72
  return Math.max(0, Math.round((new Date(deadline).getTime() - Date.now()) / 3600000))
}
