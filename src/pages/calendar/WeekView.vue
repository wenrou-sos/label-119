<script setup lang="ts">
import { computed } from 'vue'
import {
  startOfWeek, addDays, format, isSameDay, isToday,
} from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import CalendarTaskChip from './CalendarTaskChip.vue'

const props = defineProps<{ cursor: Date }>()
const emit = defineEmits<{ (e: 'select-date', v: string): void }>()
const cal = useCalendarStore()

const days = computed(() => {
  const start = startOfWeek(props.cursor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
})
const ds = (d: Date) => format(d, 'yyyy-MM-dd')
</script>

<template>
  <div class="grid grid-cols-1 gap-2 sm:grid-cols-7">
    <div
      v-for="d in days"
      :key="ds(d)"
      class="min-h-[180px] rounded-md border border-edge bg-ink-800/30 p-2"
      :class="isToday(d) ? 'ring-1 ring-acid/40' : ''"
    >
      <button class="mb-2 flex w-full items-center gap-1.5" @click="emit('select-date', ds(d))">
        <span class="text-xs font-semibold uppercase text-muted">{{ format(d, 'EEE') }}</span>
        <span
          class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
          :class="isToday(d) ? 'bg-acid text-obsidian' : 'text-fg'"
        >
          {{ format(d, 'd') }}
        </span>
      </button>
      <div class="space-y-1">
        <CalendarTaskChip v-for="t in cal.byDate(ds(d))" :key="t.id" :task="t" />
        <p v-if="!cal.byDate(ds(d)).length" class="py-3 text-center text-[10px] text-muted">—</p>
      </div>
    </div>
  </div>
</template>
