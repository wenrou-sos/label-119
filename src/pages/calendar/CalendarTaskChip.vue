<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { TASK_TYPE_LABELS } from '@/data/types'
import type { CalendarTask, TaskType } from '@/data/types'

const TYPE_HEX: Record<TaskType, string> = {
  scrim: '#38bdf8',
  rank: '#b6ff3a',
  fitness: '#ff6b35',
  psych: '#a78bfa',
  media: '#f4c544',
}

const props = defineProps<{ task: CalendarTask; compact?: boolean }>()
const cal = useCalendarStore()

const color = computed(() => TYPE_HEX[props.task.type])
const time = computed(() => props.task.startAt.slice(11, 16))
const progress = computed(() => {
  if (!props.task.targetValue) return null
  const cur = props.task.currentValue ?? 0
  return Math.min(100, Math.round((cur / props.task.targetValue) * 100))
})
</script>

<template>
  <div
    class="group rounded border-l-2 bg-ink-800/50 px-2 py-1 transition hover:bg-ink-700/50"
    :style="{ borderLeftColor: color }"
  >
    <div class="flex items-center gap-1.5">
      <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: color }" />
      <span v-if="!compact" class="font-mono text-[10px] text-muted">{{ time }}</span>
      <span class="truncate text-xs font-medium text-fg" :class="{ 'line-through opacity-50': task.status === 'done' }">
        {{ task.title }}
      </span>
    </div>
    <div v-if="progress !== null" class="mt-1 flex items-center gap-1.5">
      <div class="h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
        <div class="h-full rounded-full transition-all" :style="{ width: progress + '%', background: color }" />
      </div>
      <span class="font-mono text-[9px] text-muted">{{ task.currentValue ?? 0 }}/{{ task.targetValue }}</span>
    </div>
  </div>
</template>
