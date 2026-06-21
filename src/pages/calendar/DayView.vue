<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { Check, Trash2, Pencil } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useCalendarStore } from '@/stores/calendar'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@/data/types'
import type { TaskType } from '@/data/types'

const TONE: Record<TaskType, 'acid' | 'ember' | 'steel' | 'violetx'> = {
  scrim: 'steel',
  rank: 'acid',
  fitness: 'ember',
  psych: 'violetx',
  media: 'acid',
}

const props = defineProps<{ date: string }>()
const emit = defineEmits<{ (e: 'edit', v: string): void }>()
const cal = useCalendarStore()
const team = useTeamStore()
const { canEdit } = usePermission()

const tasks = computed(() => cal.byDate(props.date))
const weekday = computed(() => format(new Date(props.date), 'EEEE · yyyy-MM-dd'))
</script>

<template>
  <BaseCard :title="weekday" icon="📅" accent="steel">
    <div v-if="tasks.length" class="space-y-2">
      <div
        v-for="t in tasks"
        :key="t.id"
        class="rounded-md border border-edge bg-ink-800/40 p-3"
        :class="{ 'opacity-50': t.status === 'done' }"
      >
        <div class="flex items-start gap-3">
          <span class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: TASK_TYPE_COLORS[t.type] }" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-display text-sm font-bold text-fg">{{ t.title }}</span>
              <span class="rounded bg-ink-700/60 px-1.5 py-0.5 text-[10px] text-muted">{{ TASK_TYPE_LABELS[t.type] }}</span>
              <span class="font-mono text-[11px] text-muted">{{ t.startAt.slice(11, 16) }}{{ t.endAt ? ' - ' + t.endAt.slice(11, 16) : '' }}</span>
              <span v-if="t.playerId && team.playerById(t.playerId)" class="text-xs text-steel">@{{ team.playerById(t.playerId)?.handle }}</span>
              <span v-if="t.reminder" class="text-[10px] text-ember">⏰ 提醒</span>
            </div>
            <div v-if="t.targetValue" class="mt-2">
              <ProgressBar :value="t.currentValue ?? 0" :max="t.targetValue" :tone="TONE[t.type]" :show-value="false" />
              <p class="mt-1 font-mono text-[11px] text-muted">进度 {{ t.currentValue ?? 0 }} / {{ t.targetValue }} · {{ Math.round(((t.currentValue ?? 0) / t.targetValue) * 100) }}%</p>
            </div>
          </div>
          <div v-if="canEdit" class="flex shrink-0 gap-1">
            <button class="btn-ghost !p-1.5" @click="emit('edit', t.id)"><Pencil :size="12" /></button>
            <button v-if="t.status !== 'done'" class="btn-acid !p-1.5" @click="cal.setStatus(t.id, 'done')"><Check :size="12" /></button>
            <button class="btn-ember !p-1.5" @click="cal.remove(t.id)"><Trash2 :size="12" /></button>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else title="今日无日程" desc="点击右上角新建任务" />
  </BaseCard>
</template>
