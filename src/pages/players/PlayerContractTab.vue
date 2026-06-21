<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Pencil, AlertTriangle, ShieldCheck } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { daysUntil, formatDate, formatMoney } from '@/lib/format'
import type { Contract } from '@/data/types'

const props = defineProps<{ playerId: string }>()
const team = useTeamStore()
const { canSeeSensitive, maskMoney, maskText, canEdit } = usePermission()

const contract = computed(() => team.contractByPlayer(props.playerId))
const days = computed(() => (contract.value ? daysUntil(contract.value.endDate) : 0))
const tone = computed(() =>
  days.value < 0 ? 'ember' : days.value < 30 ? 'ember' : days.value < 90 ? 'gold' : 'muted',
)
const label = computed(() =>
  days.value < 0 ? '已过期' : days.value < 30 ? '紧急到期' : days.value < 90 ? '即将到期' : '有效',
)

const modalOpen = ref(false)
const form = ref<Contract | null>(null)
watch(contract, (c) => (form.value = c ? { ...c } : null), { immediate: true })

function openEdit() {
  if (contract.value) form.value = { ...contract.value }
  modalOpen.value = true
}
async function save() {
  if (form.value) await team.saveContract({ ...form.value })
  modalOpen.value = false
}
</script>

<template>
  <div v-if="contract" class="space-y-5">
    <BaseCard title="合同档案" icon="📄" accent="ember">
      <template #actions>
        <Badge :tone="tone" :label="label" dot />
        <button v-if="canEdit" class="btn-ghost !py-1.5 text-xs" @click="openEdit">
          <Pencil :size="13" /> 编辑
        </button>
      </template>
      <div
        v-if="days < 90"
        class="mb-4 flex items-center gap-2 rounded-md border border-ember/30 bg-ember/10 px-3 py-2 text-sm text-ember"
      >
        <AlertTriangle :size="15" />
        合同将于 {{ formatDate(contract.endDate) }} 到期，剩余
        <span class="font-mono font-bold">{{ days }}</span> 天
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-md border border-edge bg-ink-800/40 p-3">
          <p class="text-xs uppercase tracking-wider text-muted">签约时间</p>
          <p class="mt-1 font-display font-bold text-fg">{{ formatDate(contract.startDate) }}</p>
        </div>
        <div class="rounded-md border border-edge bg-ink-800/40 p-3">
          <p class="text-xs uppercase tracking-wider text-muted">到期时间</p>
          <p class="mt-1 font-display font-bold" :class="days < 90 ? 'text-ember' : 'text-fg'">
            {{ formatDate(contract.endDate) }}
          </p>
        </div>
        <div class="rounded-md border border-edge bg-ink-800/40 p-3">
          <p class="text-xs uppercase tracking-wider text-muted">合同年限</p>
          <p class="mt-1 font-display text-lg font-bold text-fg">{{ contract.years }} 年</p>
        </div>
        <div class="rounded-md border border-edge bg-ink-800/40 p-3">
          <p class="text-xs uppercase tracking-wider text-muted">奖金结构</p>
          <p class="mt-1 font-mono text-fg">{{ maskMoney(contract.bonus) }} /月</p>
        </div>
        <div class="rounded-md border border-steel/20 bg-steel/5 p-3 sm:col-span-2">
          <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-muted">
            <ShieldCheck :size="12" /> 月薪 (敏感)
          </p>
          <p class="mt-1 font-display text-2xl font-bold text-steel">
            {{ canSeeSensitive ? formatMoney(contract.salaryMonthly) : '¥ ••••••' }}
          </p>
        </div>
        <div class="rounded-md border border-edge bg-ink-800/40 p-3 sm:col-span-2">
          <p class="text-xs uppercase tracking-wider text-muted">违约金</p>
          <p class="mt-1 font-mono text-lg font-bold text-ember">{{ maskMoney(contract.buyout) }}</p>
        </div>
        <div class="rounded-md border border-edge bg-ink-800/40 p-3 sm:col-span-2">
          <p class="text-xs uppercase tracking-wider text-muted">转会条款</p>
          <p class="mt-1 text-sm text-fg">{{ maskText(contract.transferClause) }}</p>
        </div>
      </div>
    </BaseCard>

    <Modal :open="modalOpen" title="编辑合同" width="max-w-xl" @close="modalOpen = false">
      <div v-if="form" class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">签约日期</label>
          <input v-model="form.startDate" type="date" class="input" />
        </div>
        <div>
          <label class="label">到期日期</label>
          <input v-model="form.endDate" type="date" class="input" />
        </div>
        <div>
          <label class="label">月薪</label>
          <input v-model.number="form.salaryMonthly" type="number" class="input" />
        </div>
        <div>
          <label class="label">奖金/月</label>
          <input v-model.number="form.bonus" type="number" class="input" />
        </div>
        <div>
          <label class="label">年限</label>
          <input v-model.number="form.years" type="number" class="input" />
        </div>
        <div>
          <label class="label">违约金</label>
          <input v-model.number="form.buyout" type="number" class="input" />
        </div>
        <div class="col-span-2">
          <label class="label">转会条款</label>
          <textarea v-model="form.transferClause" class="input" rows="2" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="modalOpen = false">取消</button>
        <button class="btn-acid" @click="save">保存</button>
      </template>
    </Modal>
  </div>
  <div v-else class="panel py-16 text-center text-muted">该选手暂无合同档案</div>
</template>
