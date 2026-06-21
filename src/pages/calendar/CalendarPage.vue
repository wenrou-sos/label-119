<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Plus, Bell, CalendarDays } from 'lucide-vue-next'
import {
  addMonths, addWeeks, addDays, format, startOfWeek, endOfWeek,
} from 'date-fns'
import PageHeader from '@/components/PageHeader.vue'
import Segmented from '@/components/Segmented.vue'
import BaseCard from '@/components/BaseCard.vue'
import Modal from '@/components/Modal.vue'
import MonthView from './MonthView.vue'
import WeekView from './WeekView.vue'
import DayView from './DayView.vue'
import { useCalendarStore } from '@/stores/calendar'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { TASK_TYPE_LABELS } from '@/data/types'
import type { CalendarTask, TaskType, TaskStatus } from '@/data/types'

const cal = useCalendarStore()
const team = useTeamStore()
const { canEdit } = usePermission()

const view = ref<'month' | 'week' | 'day'>('month')
const cursor = ref(new Date())
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))

const title = computed(() => {
  if (view.value === 'month') return format(cursor.value, 'yyyy 年 M 月')
  if (view.value === 'week') {
    const s = startOfWeek(cursor.value, { weekStartsOn: 1 })
    const e = endOfWeek(cursor.value, { weekStartsOn: 1 })
    return `${format(s, 'M月d日')} - ${format(e, 'M月d日')}`
  }
  return format(cursor.value, 'yyyy 年 M 月 d 日 EEEE')
})
function nav(dir: number) {
  const f =
    view.value === 'month' ? addMonths : view.value === 'week' ? addWeeks : addDays
  cursor.value = f(cursor.value, dir)
  if (view.value === 'day') selectedDate.value = format(cursor.value, 'yyyy-MM-dd')
}
function today() {
  cursor.value = new Date()
  selectedDate.value = format(new Date(), 'yyyy-MM-dd')
}
function onSel(d: string) {
  selectedDate.value = d
  cursor.value = new Date(d + 'T00:00:00')
}

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref(blank())
function blank(): CalendarTask {
  return {
    id: '', playerId: '', title: '', type: 'scrim',
    startAt: `${selectedDate.value}T10:00:00`, endAt: `${selectedDate.value}T12:00:00`,
    targetValue: undefined, currentValue: undefined, reminder: false,
    remindAt: undefined, status: 'todo',
  }
}
function openNew() {
  editingId.value = null
  form.value = blank()
  modalOpen.value = true
}
function openEdit(id: string) {
  const t = cal.tasks.find((x) => x.id === id)
  if (!t) return
  editingId.value = id
  form.value = { ...t, targetValue: t.targetValue, currentValue: t.currentValue }
  modalOpen.value = true
}
const fDate = computed({
  get: () => form.value.startAt.slice(0, 10),
  set: (v: string) => {
    form.value.startAt = `${v}T${fStart.value}:00`
    form.value.endAt = `${v}T${fEnd.value}:00`
  },
})
const fStart = computed({ get: () => form.value.startAt.slice(11, 16), set: (v: string) => (form.value.startAt = `${fDate.value}T${v}:00`) })
const fEnd = computed({ get: () => (form.value.endAt || '').slice(11, 16), set: (v: string) => (form.value.endAt = `${fDate.value}T${v}:00`) })

async function save() {
  await cal.save({ ...form.value })
  modalOpen.value = false
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader icon="📅" title="赛训日历" subtitle="训练赛 · 个人Rank · 体能 · 心理 · 媒体通告" />

    <BaseCard icon="🔔" title="日程提醒" accent="ember" padded v-if="cal.reminders.length">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="r in cal.reminders"
          :key="r.id"
          class="flex items-center gap-2 rounded-full border border-edge bg-ink-800/50 px-3 py-1.5 text-xs"
        >
          <Bell :size="12" class="text-ember" />
          <span class="font-semibold text-fg">{{ r.title }}</span>
          <span class="font-mono text-muted">{{ format(new Date(r.startAt), 'MM-dd HH:mm') }}</span>
        </div>
      </div>
    </BaseCard>

    <BaseCard icon="🗓️" :title="title" accent="steel">
      <template #actions>
        <div class="flex items-center gap-1.5">
          <button class="btn-ghost !p-1.5" @click="nav(-1)"><ChevronLeft :size="15" /></button>
          <button class="btn-ghost !py-1.5 text-xs" @click="today">今日</button>
          <button class="btn-ghost !p-1.5" @click="nav(1)"><ChevronRight :size="15" /></button>
        </div>
        <Segmented v-model="view" :options="[{value:'month',label:'月'},{value:'week',label:'周'},{value:'day',label:'日'}]" />
        <button v-if="canEdit" class="btn-acid !py-1.5 text-xs" @click="openNew"><Plus :size="13" /> 新建</button>
      </template>
      <MonthView v-if="view === 'month'" :cursor="cursor" @select-date="onSel" />
      <WeekView v-else-if="view === 'week'" :cursor="cursor" @select-date="onSel" />
      <DayView v-else :date="selectedDate" @edit="openEdit" />
    </BaseCard>

    <Modal :open="modalOpen" :title="editingId ? '编辑任务' : '新建任务'" @close="modalOpen = false">
      <div class="space-y-4">
        <div><label class="label">任务标题</label><input v-model="form.title" class="input" placeholder="如 本月王者1000分" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">类型</label>
            <select v-model="form.type" class="input">
              <option v-for="(v, k) in TASK_TYPE_LABELS" :key="k" :value="k">{{ v }}</option>
            </select>
          </div>
          <div>
            <label class="label">关联选手</label>
            <select v-model="form.playerId" class="input">
              <option value="">全队</option>
              <option v-for="p in team.players" :key="p.id" :value="p.id">{{ p.handle }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div><label class="label">日期</label><input v-model="fDate" type="date" class="input" /></div>
          <div><label class="label">开始</label><input v-model="fStart" type="time" class="input" /></div>
          <div><label class="label">结束</label><input v-model="fEnd" type="time" class="input" /></div>
        </div>
        <div v-if="form.type === 'rank'" class="grid grid-cols-2 gap-4">
          <div><label class="label">目标值</label><input v-model.number="form.targetValue" type="number" class="input" placeholder="如 1000" /></div>
          <div><label class="label">当前进度</label><input v-model.number="form.currentValue" type="number" class="input" /></div>
        </div>
        <label class="flex items-center gap-2 text-sm text-fg">
          <input v-model="form.reminder" type="checkbox" class="accent-acid" />
          <Bell :size="14" /> 开启日程提醒
        </label>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="modalOpen = false">取消</button>
        <button class="btn-acid" @click="save">保存</button>
      </template>
    </Modal>
  </div>
</template>
