<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, MapPin, Send, Check, X, Trophy } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import LeafletMap from '@/components/LeafletMap.vue'
import type { MapMarker } from '@/components/LeafletMap.vue'
import { useScrimsStore } from '@/stores/scrims'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/lib/format'
import type { Opponent } from '@/data/types'

const scrims = useScrimsStore()
const { canEdit } = usePermission()

const markers = computed<MapMarker[]>(
  () =>
    scrims.opponents.map((o) => ({
      lat: o.latitude,
      lng: o.longitude,
      title: o.name,
      label: `${o.region} · ${o.city}`,
      tone: 'steel',
    })),
)

const pendingScrims = computed(() =>
  scrims.scrims
    .filter((s) => s.status === 'pending' || s.status === 'confirmed')
    .map((s) => ({ s, opp: scrims.opponentById(s.opponentId) }))
    .sort((a, b) => a.s.scheduledAt.localeCompare(b.s.scheduledAt)),
)

const oppModal = ref(false)
const reqModal = ref(false)
const editing = ref<Opponent | null>(null)
const reqOpponentId = ref('')

const oppForm = ref<Opponent>(blank())
function blank(): Opponent {
  return {
    id: '', name: '', region: '', city: '', latitude: 0, longitude: 0, contact: '',
  }
}
function openNew() {
  editing.value = null
  oppForm.value = blank()
  oppModal.value = true
}
function openEdit(o: Opponent) {
  editing.value = { ...o }
  oppForm.value = { ...o }
  oppModal.value = true
}
async function saveOpp() {
  if (!oppForm.value.name) return
  await scrims.saveOpponent({ ...oppForm.value })
  oppModal.value = false
}
async function removeOpp(id: string) {
  if (confirm('确认删除该对手战队？')) await scrims.removeOpponent(id)
}

const reqDate = ref(new Date().toISOString().slice(0, 10))
const reqTime = ref('19:00')
const reqBo = ref(3)
function openReq(oppId: string) {
  reqOpponentId.value = oppId
  reqModal.value = true
}
async function sendReq() {
  await scrims.requestScrim(
    reqOpponentId.value,
    `${reqDate.value}T${reqTime.value}:00`,
    reqBo.value,
  )
  reqModal.value = false
}
async function confirmScrim(id: string) {
  await scrims.setScrimStatus(id, 'confirmed')
}
async function cancelScrim(id: string) {
  await scrims.setScrimStatus(id, 'canceled')
}
</script>

<template>
  <div class="space-y-5">
    <BaseCard v-if="pendingScrims.length" title="约战申请" icon="📨" accent="ember">
      <div class="space-y-2">
        <div
          v-for="x in pendingScrims"
          :key="x.s.id"
          class="flex flex-wrap items-center gap-3 rounded-md border border-edge bg-ink-800/40 p-3"
        >
          <Badge :tone="x.s.status === 'confirmed' ? 'acid' : 'gold'" :label="x.s.status === 'confirmed' ? '已确认' : '待确认'" dot />
          <span class="font-semibold text-fg">vs {{ x.opp?.name }}</span>
          <span class="font-mono text-xs text-muted">{{ formatDate(x.s.scheduledAt, true) }} · BO{{ x.s.bo }}</span>
          <div class="ml-auto flex gap-1.5">
            <button v-if="canEdit && x.s.status === 'pending'" class="btn-acid !py-1.5 text-xs" @click="confirmScrim(x.s.id)">
              <Check :size="13" /> 确认
            </button>
            <button v-if="canEdit" class="btn-ember !py-1.5 text-xs" @click="cancelScrim(x.s.id)">
              <X :size="13" /> 取消
            </button>
          </div>
        </div>
      </div>
    </BaseCard>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <BaseCard title="对手战队" icon="🛡️" accent="steel" class="xl:col-span-2">
        <template #actions>
          <button v-if="canEdit" class="btn-acid !py-1.5 text-xs" @click="openNew">
            <Plus :size="13" /> 新增对手
          </button>
        </template>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="o in scrims.opponents"
            :key="o.id"
            class="group rounded-md border border-edge bg-ink-800/40 p-3 transition hover:border-ink-300"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-display text-base font-bold text-fg">{{ o.name }}</p>
                <p class="flex items-center gap-1 text-xs text-muted">
                  <MapPin :size="11" /> {{ o.region }} · {{ o.city }}
                </p>
                <p class="mt-1 font-mono text-[10px] text-muted">{{ o.contact }}</p>
              </div>
              <div class="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button v-if="canEdit" class="btn-ghost !p-1.5" @click="openEdit(o)"><Pencil :size="12" /></button>
                <button v-if="canEdit" class="btn-ember !p-1.5" @click="removeOpp(o.id)"><Trash2 :size="12" /></button>
              </div>
            </div>
            <button v-if="canEdit" class="btn-steel mt-3 w-full justify-center !py-1.5 text-xs" @click="openReq(o.id)">
              <Send :size="12" /> 约战
            </button>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="对手地理分布" icon="🌍" accent="steel" padded>
        <LeafletMap :markers="markers" :height="360" />
      </BaseCard>
    </div>

    <Modal :open="oppModal" :title="editing ? '编辑对手' : '新增对手'" @close="oppModal = false">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2"><label class="label">战队名称</label><input v-model="oppForm.name" class="input" /></div>
        <div><label class="label">赛区</label><input v-model="oppForm.region" class="input" /></div>
        <div><label class="label">城市</label><input v-model="oppForm.city" class="input" /></div>
        <div><label class="label">纬度</label><input v-model.number="oppForm.latitude" type="number" class="input" /></div>
        <div><label class="label">经度</label><input v-model.number="oppForm.longitude" type="number" class="input" /></div>
        <div class="col-span-2"><label class="label">联系方式</label><input v-model="oppForm.contact" class="input" /></div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="oppModal = false">取消</button>
        <button class="btn-acid" @click="saveOpp">保存</button>
      </template>
    </Modal>

    <Modal :open="reqModal" title="发起约战申请" @close="reqModal = false">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">日期</label><input v-model="reqDate" type="date" class="input" /></div>
          <div><label class="label">时间</label><input v-model="reqTime" type="time" class="input" /></div>
        </div>
        <div>
          <label class="label">赛制 (BO)</label>
          <div class="flex gap-2">
            <button v-for="b in [1, 3, 5]" :key="b" class="flex-1 rounded-md border py-2 text-sm font-semibold transition" :class="reqBo === b ? 'border-acid/40 bg-acid/10 text-acid' : 'border-edge text-muted'" @click="reqBo = b">BO{{ b }}</button>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="reqModal = false">取消</button>
        <button class="btn-acid" @click="sendReq"><Trophy :size="14" /> 发起约战</button>
      </template>
    </Modal>
  </div>
</template>
