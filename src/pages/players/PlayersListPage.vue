<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Pencil, Trash2, Flag } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Avatar from '@/components/Avatar.vue'
import PositionBadge from '@/components/PositionBadge.vue'
import Modal from '@/components/Modal.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { POSITION_LABELS, type Player, type Position, type PlayerStatus } from '@/data/types'
import { daysUntil, formatDate } from '@/lib/format'

const team = useTeamStore()
const { canEdit } = usePermission()
const router = useRouter()

const q = ref('')
const posFilter = ref<Position | 'all'>('all')
const statusFilter = ref<PlayerStatus | 'all'>('all')
const modalOpen = ref(false)
const editing = ref<Player | null>(null)

const positions: (Position | 'all')[] = ['all', 'top', 'jng', 'mid', 'adc', 'sup']
const statuses: (PlayerStatus | 'all')[] = ['all', 'active', 'benched', 'training']

const filtered = computed(() =>
  team.players.filter((p) => {
    const m =
      !q.value ||
      p.handle.toLowerCase().includes(q.value.toLowerCase()) ||
      p.realName.toLowerCase().includes(q.value.toLowerCase()) ||
      p.nationality.includes(q.value)
    const pm = posFilter.value === 'all' || p.position === posFilter.value
    const sm = statusFilter.value === 'all' || p.status === statusFilter.value
    return m && pm && sm
  }),
)

const statusTone: Record<PlayerStatus, 'acid' | 'muted' | 'ember'> = {
  active: 'acid',
  benched: 'muted',
  training: 'ember',
}
const statusLabel: Record<PlayerStatus, string> = {
  active: '主力',
  benched: '替补',
  training: '青训',
}

function openNew() {
  editing.value = null
  modalOpen.value = true
}
function openEdit(p: Player) {
  editing.value = { ...p }
  modalOpen.value = true
}

const form = ref<Player>(blankForm())
function blankForm(): Player {
  return {
    id: '',
    handle: '',
    realName: '',
    age: 18,
    nationality: '中国',
    countryCode: 'CN',
    latitude: 31.23,
    longitude: 121.47,
    position: 'mid',
    joinDate: new Date().toISOString().slice(0, 10),
    status: 'training',
    avatar: '',
  }
}
function syncForm() {
  form.value = editing.value ? { ...editing.value } : blankForm()
}
watch(modalOpen, (v) => {
  if (v) syncForm()
})
function onAvatar() {
  form.value.avatar = (form.value.handle || '?').slice(0, 1).toUpperCase()
}
async function submit() {
  if (!form.value.handle) return
  if (!form.value.avatar) onAvatar()
  await team.savePlayer({ ...form.value })
  modalOpen.value = false
}
async function remove(p: Player) {
  if (confirm(`确认删除选手 ${p.handle}？`)) await team.removePlayer(p.id)
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader icon="👥" title="队员管理" subtitle="选手档案 · 英雄池 · 合同 · 训练数据">
      <template #actions>
        <button v-if="canEdit" class="btn-acid" @click="openNew">
          <Plus :size="16" /> 新增选手
        </button>
      </template>
    </PageHeader>

    <BaseCard padded>
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative min-w-[220px] flex-1">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input v-model="q" class="input pl-9" placeholder="搜索 选手ID / 真名 / 国籍" />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in positions"
            :key="p"
            class="rounded-md border px-2.5 py-1.5 text-xs font-semibold transition"
            :class="posFilter === p ? 'border-acid/40 bg-acid/10 text-acid' : 'border-edge text-muted hover:text-fg'"
            @click="posFilter = p"
          >
            {{ p === 'all' ? '全部位置' : POSITION_LABELS[p as Position] }}
          </button>
        </div>
        <select v-model="statusFilter" class="input !w-auto">
          <option v-for="s in statuses" :key="s" :value="s">
            {{ s === 'all' ? '全部状态' : statusLabel[s as PlayerStatus] }}
          </option>
        </select>
      </div>
    </BaseCard>

    <div v-if="filtered.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="p in filtered"
        :key="p.id"
        class="panel group relative overflow-hidden p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ink-300"
        @click="router.push(`/players/${p.id}`)"
      >
        <div class="flex items-start gap-3">
          <Avatar :text="p.avatar || '?'" :status="p.status" size="lg" :tone="p.position === 'mid' ? 'steel' : 'acid'" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-display text-lg font-bold text-fg">{{ p.handle }}</h3>
              <PositionBadge :position="p.position" />
            </div>
            <p class="truncate text-xs text-muted">{{ p.realName }} · {{ p.age }}岁</p>
            <p class="mt-1 flex items-center gap-1 text-xs text-muted">
              <Flag :size="11" /> {{ p.nationality }} · {{ p.countryCode }}
            </p>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-edge pt-3">
          <Badge :tone="statusTone[p.status]" :label="statusLabel[p.status]" dot />
          <span class="font-mono text-[11px]" :class="daysUntil(team.contractByPlayer(p.id)?.endDate ?? '') < 60 ? 'text-ember' : 'text-muted'">
            合同 {{ formatDate(team.contractByPlayer(p.id)?.endDate ?? '—') }}
          </span>
        </div>
        <div v-if="canEdit" class="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100" @click.stop>
          <button class="btn-ghost !p-1.5" @click="openEdit(p)"><Pencil :size="13" /></button>
          <button class="btn-ember !p-1.5" @click="remove(p)"><Trash2 :size="13" /></button>
        </div>
      </button>
    </div>
    <EmptyState v-else title="未找到匹配选手" desc="尝试调整搜索或筛选条件" />

    <Modal :open="modalOpen" :title="editing ? '编辑选手' : '新增选手'" width="max-w-xl" @close="modalOpen = false">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">选手 ID (handle)</label>
          <input v-model="form.handle" class="input" @input="onAvatar" />
        </div>
        <div>
          <label class="label">真实姓名</label>
          <input v-model="form.realName" class="input" />
        </div>
        <div>
          <label class="label">年龄</label>
          <input v-model.number="form.age" type="number" class="input" />
        </div>
        <div>
          <label class="label">游戏位置</label>
          <select v-model="form.position" class="input">
            <option v-for="(v, k) in POSITION_LABELS" :key="k" :value="k">{{ v }}</option>
          </select>
        </div>
        <div>
          <label class="label">国籍</label>
          <input v-model="form.nationality" class="input" />
        </div>
        <div>
          <label class="label">国家代码</label>
          <input v-model="form.countryCode" class="input" maxlength="3" />
        </div>
        <div>
          <label class="label">入队日期</label>
          <input v-model="form.joinDate" type="date" class="input" />
        </div>
        <div>
          <label class="label">状态</label>
          <select v-model="form.status" class="input">
            <option value="active">主力</option>
            <option value="benched">替补</option>
            <option value="training">青训</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="modalOpen = false">取消</button>
        <button class="btn-acid" @click="submit">保存</button>
      </template>
    </Modal>
  </div>
</template>
