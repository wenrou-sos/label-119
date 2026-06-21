<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus, MapPin, ArrowRight, MessageSquare } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import LeafletMap from '@/components/LeafletMap.vue'
import type { MapMarker } from '@/components/LeafletMap.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useTransferStore } from '@/stores/transfers'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { formatDate, formatMoney } from '@/lib/format'
import type { Transfer, TransferType, TransferStatus } from '@/data/types'

const transfers = useTransferStore()
const team = useTeamStore()
const { canEdit, canSeeSensitive, maskMoney } = usePermission()

const TYPE_LABELS: Record<TransferType, string> = { list: '挂牌', trial: '试训', renew: '续约', negotiate: '谈判' }
type Tone = 'acid' | 'ember' | 'steel' | 'violetx' | 'muted' | 'gold'
const STATUS_LABELS: Record<TransferStatus, string> = { open: '进行中', trialing: '试训中', done: '已完成', failed: '已失败' }
const STATUS_TONE: Record<TransferStatus, Tone> = { open: 'gold', trialing: 'steel', done: 'acid', failed: 'ember' }

const selectedId = ref(transfers.transfers[0]?.id ?? '')
watch(
  () => transfers.transfers,
  (list) => {
    if (!list.some((t) => t.id === selectedId.value) && list.length > 0) {
      selectedId.value = list[0].id
    }
  },
  { deep: true },
)
const selected = computed(() =>
  transfers.transfersWithPlayer.find((t) => t.id === selectedId.value),
)

const markers = computed<MapMarker[]>(() =>
  transfers.transfers.map((t) => ({
    lat: t.latitude,
    lng: t.longitude,
    title: team.playerById(t.playerId)?.handle ?? '',
    label: `${t.city} · ${TYPE_LABELS[t.type]}`,
    tone: STATUS_TONE[t.status] === 'acid' ? 'acid' : STATUS_TONE[t.status] === 'ember' ? 'ember' : 'steel',
  })),
)

const logEvent = ref('')
const logAmount = ref<number | undefined>()
const logNote = ref('')
async function addLog() {
  if (!selected.value || !logEvent.value) return
  await transfers.addLog({
    id: `log_${Date.now()}`,
    transferId: selected.value.id,
    event: logEvent.value,
    amount: logAmount.value,
    note: logNote.value,
    createdAt: new Date().toISOString(),
  })
  logEvent.value = ''
  logAmount.value = undefined
  logNote.value = ''
}

const modalOpen = ref(false)
const form = ref<Transfer>(blank())
function blank(): Transfer {
  return { id: '', playerId: team.players[0]?.id ?? '', type: 'list', status: 'open', askPrice: 500000, city: '', latitude: 0, longitude: 0 }
}
function openNew() {
  form.value = blank()
  modalOpen.value = true
}
async function save() {
  await transfers.saveTransfer({ ...form.value })
  modalOpen.value = false
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <BaseCard title="转会市场" icon="🔄" accent="steel" padded class="lg:col-span-2">
        <template #actions>
          <button v-if="canEdit" class="btn-acid !py-1.5 text-xs" @click="openNew"><Plus :size="13" /> 挂牌</button>
        </template>
        <div class="space-y-2">
          <button
            v-for="t in transfers.transfersWithPlayer"
            :key="t.id"
            class="w-full rounded-md border p-2.5 text-left transition"
            :class="selectedId === t.id ? 'border-acid/40 bg-acid/5' : 'border-edge bg-ink-800/40 hover:border-ink-300'"
            @click="selectedId = t.id"
          >
            <div class="flex items-center justify-between">
              <span class="font-display text-sm font-bold text-fg">{{ t.player?.handle }}</span>
              <Badge :tone="STATUS_TONE[t.status]" :label="STATUS_LABELS[t.status]" dot />
            </div>
            <div class="mt-1 flex items-center gap-2 text-[11px] text-muted">
              <span class="rounded bg-ink-700/60 px-1.5 py-0.5">{{ TYPE_LABELS[t.type] }}</span>
              <span class="flex items-center gap-0.5"><MapPin :size="10" /> {{ t.city }}</span>
              <span class="ml-auto font-mono text-acid">{{ canSeeSensitive ? formatMoney(t.askPrice) : maskMoney(t.askPrice) }}</span>
            </div>
          </button>
          <EmptyState v-if="!transfers.transfers.length" title="暂无转会记录" />
        </div>
      </BaseCard>

      <div class="space-y-5 lg:col-span-3">
        <BaseCard title="转会地理分布" icon="🌍" accent="steel" padded>
          <LeafletMap :markers="markers" :height="240" />
        </BaseCard>

        <BaseCard v-if="selected" :title="`${selected.player?.handle} · 转会流程`" icon="📝" accent="acid">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <Badge :tone="STATUS_TONE[selected.status]" :label="STATUS_LABELS[selected.status]" dot />
              <Badge tone="steel" :label="TYPE_LABELS[selected.type]" />
              <span class="text-sm text-muted">挂牌价 <b class="font-mono text-acid">{{ canSeeSensitive ? formatMoney(selected.askPrice) : maskMoney(selected.askPrice) }}</b></span>
              <div v-if="canEdit" class="ml-auto flex gap-1.5">
                <button v-if="selected.status === 'open'" class="btn-steel !py-1.5 text-xs" @click="transfers.setStatus(selected.id, 'trialing')">安排试训</button>
                <button v-if="selected.status === 'trialing'" class="btn-acid !py-1.5 text-xs" @click="transfers.setStatus(selected.id, 'done')">完成转会</button>
                <button v-if="selected.status !== 'done' && selected.status !== 'failed'" class="btn-ember !py-1.5 text-xs" @click="transfers.setStatus(selected.id, 'failed')">终止</button>
              </div>
            </div>

            <div>
              <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><MessageSquare :size="12" /> 谈判记录</p>
              <div class="space-y-2">
                <div v-for="l in transfers.logsOf(selected.id)" :key="l.id" class="rounded-md border-l-2 border-steel bg-ink-800/40 p-2.5">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-fg">{{ l.event }}</span>
                    <span v-if="l.amount" class="font-mono text-xs text-acid">{{ formatMoney(l.amount) }}</span>
                    <span class="ml-auto font-mono text-[10px] text-muted">{{ formatDate(l.createdAt, true) }}</span>
                  </div>
                  <p v-if="l.note" class="mt-1 text-xs text-muted">{{ l.note }}</p>
                </div>
                <p v-if="!transfers.logsOf(selected.id).length" class="py-2 text-center text-xs text-muted">暂无谈判记录</p>
              </div>
            </div>

            <div v-if="canEdit" class="grid grid-cols-12 items-end gap-2 border-t border-edge pt-3">
              <div class="col-span-12 sm:col-span-4">
                <label class="label">事件</label>
                <input v-model="logEvent" class="input !py-1.5 text-xs" placeholder="如 报价沟通" />
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label class="label">金额</label>
                <input v-model.number="logAmount" type="number" class="input !py-1.5 text-xs" />
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label class="label">备注</label>
                <input v-model="logNote" class="input !py-1.5 text-xs" />
              </div>
              <button class="btn-acid col-span-12 sm:col-span-2 !py-1.5 text-xs" @click="addLog"><ArrowRight :size="13" /> 记录</button>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <Modal :open="modalOpen" title="新增转会挂牌" @close="modalOpen = false">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">选手</label>
          <select v-model="form.playerId" class="input">
            <option v-for="p in team.players" :key="p.id" :value="p.id">{{ p.handle }}</option>
          </select>
        </div>
        <div>
          <label class="label">类型</label>
          <select v-model="form.type" class="input">
            <option v-for="(v, k) in TYPE_LABELS" :key="k" :value="k">{{ v }}</option>
          </select>
        </div>
        <div><label class="label">挂牌价</label><input v-model.number="form.askPrice" type="number" class="input" /></div>
        <div><label class="label">城市</label><input v-model="form.city" class="input" /></div>
        <div><label class="label">纬度</label><input v-model.number="form.latitude" type="number" class="input" /></div>
        <div><label class="label">经度</label><input v-model.number="form.longitude" type="number" class="input" /></div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="modalOpen = false">取消</button>
        <button class="btn-acid" @click="save">挂牌</button>
      </template>
    </Modal>
  </div>
</template>
