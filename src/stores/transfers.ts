import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transferLogRepo, transferRepo } from '@/data/repositories'
import { useTeamStore } from './team'
import type { Transfer, TransferLog, TransferStatus, NegotiationStep } from '@/data/types'
import { uid } from '@/data/repositories'
import { computeCounterOffer, evaluateDeal, computeComplexity, hoursUntilDeadline } from '@/lib/negotiation'

export const useTransferStore = defineStore('transfers', () => {
  const transfers = ref<Transfer[]>([])
  const logs = ref<TransferLog[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    const [t, l] = await Promise.all([
      transferRepo.list(),
      transferLogRepo.list(),
    ])
    transfers.value = t
    logs.value = l
    loaded.value = true
    loading.value = false
  }

  const team = useTeamStore()
  const logsOf = computed(
    () => (transferId: string) =>
      logs.value
        .filter((l) => l.transferId === transferId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  )

  const transfersWithPlayer = computed(() =>
    transfers.value.map((t) => {
      const player = team.playerById(t.playerId)
      const contract = team.contractByPlayer(t.playerId)
      return {
        ...t,
        player,
        contract,
        logs: logsOf.value(t.id),
        complexity: computeComplexity({ player, contract, transfer: t }),
        hoursLeft: hoursUntilDeadline(t.negotiationDeadline),
      }
    }),
  )

  function transferById(id: string) {
    return transfersWithPlayer.value.find((t) => t.id === id)
  }

  async function setStatus(id: string, status: TransferStatus) {
    const updated = await transferRepo.update(id, { status })
    if (updated) {
      const i = transfers.value.findIndex((t) => t.id === id)
      transfers.value[i] = updated
    }
  }
  async function saveTransfer(t: Transfer) {
    const exists = t.id && transfers.value.some((x) => x.id === t.id)
    if (exists) {
      const updated = await transferRepo.update(t.id, t)
      if (updated) {
        const i = transfers.value.findIndex((x) => x.id === t.id)
        transfers.value[i] = updated
      }
    } else {
      transfers.value.push(await transferRepo.create(t))
    }
  }
  async function addLog(log: TransferLog) {
    logs.value.push(await transferLogRepo.create(log))
  }

  async function startNegotiation(id: string) {
    const t = transfers.value.find((x) => x.id === id)
    if (!t) return
    const deadline = new Date(Date.now() + 72 * 3600 * 1000).toISOString()
    const updated = await transferRepo.update(id, {
      status: 'negotiating',
      negotiationStep: 'offer_sent' as NegotiationStep,
      roundCount: 1,
      maxRounds: 4,
      negotiationDeadline: deadline,
      marketHeat: t.marketHeat ?? Math.round(Math.random() * 60 + 20),
    })
    if (updated) {
      const i = transfers.value.findIndex((x) => x.id === id)
      transfers.value[i] = updated
    }
    await addLog({
      id: uid('tl'),
      transferId: id,
      event: '发起谈判',
      amount: undefined,
      note: '启动正式转会谈判流程，限时 72 小时。',
      createdAt: new Date().toISOString(),
      side: 'system',
    })
  }

  async function submitOffer(id: string, amount: number) {
    const t = transfers.value.find((x) => x.id === id)
    if (!t) return { error: '转会不存在' }
    const player = team.playerById(t.playerId)
    const contract = team.contractByPlayer(t.playerId)
    if (!player) return { error: '选手不存在' }

    const ctx = { player, contract, transfer: t }
    const counter = computeCounterOffer(ctx, amount)

    const nextStep: NegotiationStep =
      t.negotiationStep === 'idle' || t.negotiationStep === undefined
        ? 'offer_sent'
        : t.negotiationStep === 'counter_received'
          ? 'offer_2_sent'
          : 'final_offer'

    const updated = await transferRepo.update(id, {
      status: 'negotiating',
      negotiationStep: counter.nextStep,
      currentOffer: amount,
      currentCounter: counter.counterPrice,
      roundCount: (t.roundCount ?? 0) + 1,
    })
    if (updated) {
      const i = transfers.value.findIndex((x) => x.id === id)
      transfers.value[i] = updated
    }

    await addLog({
      id: uid('tl'),
      transferId: id,
      event: '我方报价',
      amount,
      note: `我方提出报价，预期成交概率 ${counter.acceptProbability}%。`,
      createdAt: new Date().toISOString(),
      side: 'us',
    })

    await new Promise((r) => setTimeout(r, 600))

    await addLog({
      id: uid('tl'),
      transferId: id,
      event: '对方还价',
      amount: counter.counterPrice,
      note: counter.rationale,
      createdAt: new Date().toISOString(),
      side: 'them',
    })

    return { counter, nextStep }
  }

  async function acceptCounter(id: string) {
    const t = transfers.value.find((x) => x.id === id)
    if (!t) return
    const finalPrice = t.currentCounter ?? t.askPrice
    const updated = await transferRepo.update(id, {
      status: 'done',
      negotiationStep: 'deal',
      acceptedPrice: finalPrice,
    })
    if (updated) {
      const i = transfers.value.findIndex((x) => x.id === id)
      transfers.value[i] = updated
    }
    await addLog({
      id: uid('tl'),
      transferId: id,
      event: '成交',
      amount: finalPrice,
      note: `双方达成一致，转会成交。`,
      createdAt: new Date().toISOString(),
      side: 'system',
    })
  }

  async function walkOut(id: string) {
    const updated = await transferRepo.update(id, {
      status: 'walked_out',
      negotiationStep: 'collapse',
    })
    if (updated) {
      const i = transfers.value.findIndex((x) => x.id === id)
      transfers.value[i] = updated
    }
    await addLog({
      id: uid('tl'),
      transferId: id,
      event: '愤然离席',
      amount: undefined,
      note: '我方对对方报价严重不满，终止谈判。',
      createdAt: new Date().toISOString(),
      side: 'us',
    })
  }

  async function cancelNegotiation(id: string) {
    const updated = await transferRepo.update(id, {
      status: 'failed',
      negotiationStep: 'collapse',
    })
    if (updated) {
      const i = transfers.value.findIndex((x) => x.id === id)
      transfers.value[i] = updated
    }
    await addLog({
      id: uid('tl'),
      transferId: id,
      event: '谈判破裂',
      amount: undefined,
      note: '未能在期限内达成一致。',
      createdAt: new Date().toISOString(),
      side: 'system',
    })
  }

  return {
    transfers,
    logs,
    loaded,
    loading,
    load,
    logsOf,
    transfersWithPlayer,
    transferById,
    setStatus,
    saveTransfer,
    addLog,
    startNegotiation,
    submitOffer,
    acceptCounter,
    walkOut,
    cancelNegotiation,
  }
})
