<script setup lang="ts">
import { computed } from 'vue'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
} from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import CalendarTaskChip from './CalendarTaskChip.vue'

const props = defineProps<{ cursor: Date }>()
const emit = defineEmits<{ (e: 'select-date', v: string): void }>()
const cal = useCalendarStore()

const weekDays = ['一', '二', '三', '四', '五', '六', '日']
const days = computed(() => {
  const start = startOfWeek(startOfMonth(props.cursor), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(props.cursor), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
})
const ds = (d: Date) => format(d, 'yyyy-MM-dd')
</script>

<template>
  <div>
    <div class="grid grid-cols-7 gap-1 border-b border-edge pb-1">
      <div v-for="w in weekDays" :key="w" class="py-1 text-center text-xs font-semibold uppercase tracking-wider text-muted">
        {{ w }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="d in days"
        :key="ds(d)"
        class="min-h-[92px] rounded-md border p-1.5 text-left transition hover:border-ink-300"
        :class="[
          isSameMonth(d, props.cursor) ? 'border-edge bg-ink-800/30' : 'border-transparent bg-ink-900/40 opacity-40',
          isToday(d) ? 'ring-1 ring-acid/50' : '',
        ]"
        @click="emit('select-date', ds(d))"
      >
        <div class="mb-1 flex items-center justify-between">
          <span
            class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
            :class="isToday(d) ? 'bg-acid text-obsidian' : 'text-muted'"
          >
            {{ format(d, 'd') }}
          </span>
        </div>
        <div class="space-y-0.5">
          <CalendarTaskChip
            v-for="t in cal.byDate(ds(d)).slice(0, 3)"
            :key="t.id"
            :task="t"
            compact
          />
          <p v-if="cal.byDate(ds(d)).length > 3" class="pl-1 text-[10px] text-muted">
            +{{ cal.byDate(ds(d)).length - 3 }} 更多
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
