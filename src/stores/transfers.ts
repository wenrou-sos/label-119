import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transferLogRepo, transferRepo } from '@/data/repositories'
import { useTeamStore } from './team'
import type { Transfer, TransferLog, TransferStatus } from '@/data/types'

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
    transfers.value.map((t) => ({
      ...t,
      player: team.playerById(t.playerId),
      logs: logsOf.value(t.id),
    })),
  )

  async function setStatus(id: string, status: TransferStatus) {
    const updated = await transferRepo.update(id, { status })
    if (updated) {
      const i = transfers.value.findIndex((t) => t.id === id)
      transfers.value[i] = updated
    }
  }
  async function saveTransfer(t: Transfer) {
    const exists = transfers.value.some((x) => x.id === t.id)
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

  return {
    transfers,
    logs,
    loaded,
    loading,
    load,
    logsOf,
    transfersWithPlayer,
    setStatus,
    saveTransfer,
    addLog,
  }
})
