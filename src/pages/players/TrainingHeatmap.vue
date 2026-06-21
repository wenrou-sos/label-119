<script setup lang="ts">
import { computed } from 'vue'
import type { TrainingLog } from '@/data/types'
import {
  buildLoadMap,
  bucketIndex,
  dailyLoad,
  formatDateKey,
  addDays,
  loadBuckets,
  MONTH_LABELS,
  WEEKDAY_LABELS,
  RANK_WEIGHT,
  SCRIM_WEIGHT,
} from '@/lib/training'

const props = defineProps<{ logs: TrainingLog[] }>()

const CELL = 11
const GAP = 3
const TOTAL_DAYS = 90
const WEEKS = 14
const LEFT = 28
const TOP = 26
const HEAT_COLORS = [
  'rgba(50,54,60,0.6)',
  'rgba(182,255,58,0.18)',
  'rgba(182,255,58,0.45)',
  'rgba(182,255,58,0.75)',
  'rgba(182,255,58,1)',
]

const today = computed(() => {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
})

const firstSunday = computed(() => {
  const t = today.value
  const start = addDays(t, -(TOTAL_DAYS - 1))
  const dow = start.getDay()
  return addDays(start, -dow)
})

const cells = computed(() => {
  const logMap = buildLoadMap(props.logs)
  const list: { date: Date; key: string; load: number; log?: TrainingLog; col: number; row: number }[] = []
  let max = 0
  for (let w = 0; w < WEEKS; w++) {
    for (let dow = 0; dow < 7; dow++) {
      const d = addDays(firstSunday.value, w * 7 + dow)
      const key = formatDateKey(d)
      const log = logMap.get(key)
      const load = log ? dailyLoad(log) : 0
      if (load > max) max = load
      list.push({ date: d, key, load, log, col: w, row: dow })
    }
  }
  return { list, max }
})

const buckets = computed(() => loadBuckets(cells.value.max))

const monthLabels = computed(() => {
  const labels: { x: number; text: string }[] = []
  let lastMonth = -1
  for (let w = 0; w < WEEKS; w++) {
    const d = addDays(firstSunday.value, w * 7)
    if (d.getMonth() !== lastMonth) {
      labels.push({ x: LEFT + w * (CELL + GAP), text: MONTH_LABELS[d.getMonth()] })
      lastMonth = d.getMonth()
    }
  }
  return labels
})

const width = LEFT + WEEKS * (CELL + GAP) + 8
const height = TOP + 7 * (CELL + GAP) + 10
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between text-xs text-muted">
      <div class="flex items-center gap-3">
        <span>训练量 = Rank场次 × {{ RANK_WEIGHT }} + 训练赛 × {{ SCRIM_WEIGHT }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span>少</span>
        <div v-for="(c, i) in HEAT_COLORS" :key="i" class="h-2.5 w-2.5 rounded-[2px]" :style="{ background: c }" />
        <span>多</span>
      </div>
    </div>
    <div class="overflow-x-auto">
      <svg :width="width" :height="height" class="min-w-full">
        <text
          v-for="(m, i) in monthLabels"
          :key="'m' + i"
          :x="m.x"
          :y="14"
          fill="currentColor"
          class="fill-muted"
          font-size="10"
        >{{ m.text }}</text>
        <text
          v-for="(l, i) in WEEKDAY_LABELS"
          :key="'w' + i"
          :x="4"
          :y="TOP + (i + 1) * (CELL + GAP) - 3"
          fill="currentColor"
          class="fill-muted"
          font-size="9"
          text-anchor="start"
        >{{ i % 2 === 1 ? l : '' }}</text>
        <g>
          <rect
            v-for="c in cells.list"
            :key="c.key"
            :x="LEFT + c.col * (CELL + GAP)"
            :y="TOP + c.row * (CELL + GAP)"
            :width="CELL"
            :height="CELL"
            :rx="2"
            :fill="HEAT_COLORS[bucketIndex(c.load, buckets)]"
            class="cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-acid/80"
          >
            <title>
              {{ c.key }}
              <template v-if="c.log">
                训练量 {{ c.load.toFixed(1) }} · Rank {{ c.log.rankGames }} 场 / {{ c.log.rankPoints }} 分 · 训练赛 {{ c.log.scrimGames }} 场
              </template>
              <template v-else>当日无训练记录</template>
            </title>
          </rect>
        </g>
      </svg>
    </div>
  </div>
</template>
