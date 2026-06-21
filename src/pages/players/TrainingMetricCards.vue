<script setup lang="ts">
import { computed } from 'vue'
import { Activity, ArrowDownRight, ArrowUpRight, Brain, Flame, Scale, Target, TrendingDown, TrendingUp } from 'lucide-vue-next'
import type { TrainingLog } from '@/data/types'
import { buildLoadMap, dailyLoad, formatDateKey, addDays } from '@/lib/training'

const props = defineProps<{ logs: TrainingLog[] }>()
const emit = defineEmits<{
  (e: 'jump', target: 'fatigue' | 'trend' | 'balance' | 'streak'): void
}>()

const sortedLogs = computed(() => [...props.logs].sort((a, b) => a.logDate.localeCompare(b.logDate)))

const today = computed(() => {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
})

const lastNDays = (n: number) => {
  const map = buildLoadMap(sortedLogs.value)
  const list: TrainingLog[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(today.value, -i)
    const l = map.get(formatDateKey(d))
    if (l) list.push(l)
  }
  return list
}

const fatigue = computed(() => {
  const last7 = lastNDays(7)
  const all = sortedLogs.value
  const avg7 = last7.length ? last7.reduce((s, l) => s + dailyLoad(l), 0) / 7 : 0
  const avgAll = all.length ? all.reduce((s, l) => s + dailyLoad(l), 0) / all.length : 1
  const ratio = avgAll > 0 ? Math.round((avg7 / avgAll) * 100) : 100
  let tone: 'acid' | 'steel' | 'ember' = 'steel'
  let hint = '正常训练节奏'
  if (ratio >= 120) { tone = 'ember'; hint = '⚠ 近一周训练量偏高，建议休息' }
  else if (ratio >= 90) { tone = 'acid'; hint = '保持稳定节奏' }
  else if (ratio < 60) { tone = 'steel'; hint = '训练量偏低，注意出勤' }
  return { ratio, tone, hint, avg7: avg7.toFixed(1), totalAll: all.reduce((s, l) => s + dailyLoad(l), 0).toFixed(1) }
})

const trend = computed(() => {
  const last7 = lastNDays(7).sort((a, b) => a.logDate.localeCompare(b.logDate))
  const start = last7.slice(0, 3).reduce((s, l) => s + l.rankPoints, 0) / Math.max(last7.slice(0, 3).length, 1)
  const end = last7.slice(-3).reduce((s, l) => s + l.rankPoints, 0) / Math.max(last7.slice(-3).length, 1)
  const diff = Math.round(end - start)
  const direction = diff >= 5 ? 'up' : diff <= -5 ? 'down' : 'flat'
  let tone: 'acid' | 'steel' | 'ember' = 'steel'
  let hint = '状态稳定'
  if (direction === 'up') { tone = 'acid'; hint = `近 7 天上升 ${diff} 分，手感火热` }
  if (direction === 'down') { tone = 'ember'; hint = `近 7 天下滑 ${diff} 分，关注状态` }
  return { diff, direction, tone, hint }
})

const balance = computed(() => {
  const last14 = lastNDays(14)
  const r = last14.reduce((s, l) => s + l.rankGames, 0)
  const s = last14.reduce((s, l) => s + l.scrimGames, 0)
  const total = r + s
  const rankPct = total > 0 ? Math.round((r / total) * 100) : 0
  const ratio = s > 0 ? (r / s).toFixed(2) : '∞'
  let tone: 'acid' | 'steel' | 'ember' = 'steel'
  let hint = `Rank 占比 ${rankPct}%，场次比 ${ratio}`
  if (rankPct < 35) { tone = 'ember'; hint = '⚠ Rank 场次不足，加强个人训练' }
  else if (rankPct >= 60 && s > 0) { tone = 'acid'; hint = 'Rank 与训练赛搭配良好' }
  else if (s === 0 && r > 0) { tone = 'steel'; hint = '近期无训练赛安排' }
  return { rankPct, ratio, tone, hint, rankGames: r, scrimGames: s }
})

const streak = computed(() => {
  const map = buildLoadMap(sortedLogs.value)
  let count = 0
  for (let i = 0; i < 180; i++) {
    const d = addDays(today.value, -i)
    const l = map.get(formatDateKey(d))
    const has = l && dailyLoad(l) > 0
    if (has) count++
    else if (i === 0) continue
    else break
  }
  let tone: 'acid' | 'steel' | 'ember' = 'steel'
  let hint = `${count} 天连勤，继续保持`
  if (count >= 21) { tone = 'acid'; hint = `🔥 连续 ${count} 天，铁人体质` }
  else if (count >= 7) { tone = 'acid'; hint = `连续 ${count} 天出勤，状态在线` }
  else if (count === 0) { tone = 'ember'; hint = '今日暂无训练，立即启动' }
  return { count, tone, hint }
})

type Tone = 'acid' | 'steel' | 'ember' | 'violetx'

const toneBorder: Record<Tone, string> = {
  acid: 'border-acid/40 hover:border-acid/80 bg-acid/[0.04]',
  steel: 'border-steel/40 hover:border-steel/80 bg-steel/[0.04]',
  ember: 'border-ember/40 hover:border-ember/80 bg-ember/[0.04]',
  violetx: 'border-violetx/40 hover:border-violetx/80 bg-violetx/[0.04]',
}
const toneText: Record<Tone, string> = {
  acid: 'text-acid',
  steel: 'text-steel',
  ember: 'text-ember',
  violetx: 'text-violetx',
}
const toneDot: Record<Tone, string> = {
  acid: 'bg-acid',
  steel: 'bg-steel',
  ember: 'bg-ember',
  violetx: 'bg-violetx',
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <button
      class="group flex flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      :class="toneBorder[fatigue.tone as Tone]"
      @click="emit('jump', 'fatigue')"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <Flame :size="14" :class="toneText[fatigue.tone as Tone]" />
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">疲劳指数</span>
        </div>
        <div class="h-1.5 w-1.5 rounded-full" :class="toneDot[fatigue.tone as Tone]" />
      </div>
      <div class="flex items-end gap-1.5">
        <span class="font-display text-2xl font-bold" :class="toneText[fatigue.tone as Tone]">{{ fatigue.ratio }}%</span>
        <span class="pb-1 text-[10px] text-muted">vs 均值</span>
      </div>
      <p class="text-xs leading-relaxed text-muted">{{ fatigue.hint }}</p>
      <p class="text-[10px] text-muted/70 group-hover:text-fg transition-colors">点击查看近 7 天明细 →</p>
    </button>

    <button
      class="group flex flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      :class="toneBorder[trend.tone as Tone]"
      @click="emit('jump', 'trend')"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <TrendingUp v-if="trend.direction === 'up'" :size="14" :class="toneText[trend.tone as Tone]" />
          <TrendingDown v-else-if="trend.direction === 'down'" :size="14" :class="toneText[trend.tone as Tone]" />
          <Activity v-else :size="14" :class="toneText[trend.tone as Tone]" />
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">状态走势</span>
        </div>
        <ArrowUpRight v-if="trend.direction === 'up'" :size="13" class="text-acid" />
        <ArrowDownRight v-else-if="trend.direction === 'down'" :size="13" class="text-ember" />
        <Target v-else :size="13" class="text-steel" />
      </div>
      <div class="flex items-end gap-1.5">
        <span
          class="font-display text-2xl font-bold"
          :class="toneText[trend.tone as Tone]"
        >{{ trend.diff > 0 ? '+' : '' }}{{ trend.diff }}</span>
        <span class="pb-1 text-[10px] text-muted">Rank 分 · 7 日 Δ</span>
      </div>
      <p class="text-xs leading-relaxed text-muted">{{ trend.hint }}</p>
      <p class="text-[10px] text-muted/70 group-hover:text-fg transition-colors">点击查看 Rank 曲线 →</p>
    </button>

    <button
      class="group flex flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      :class="toneBorder[balance.tone as Tone]"
      @click="emit('jump', 'balance')"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <Scale :size="14" :class="toneText[balance.tone as Tone]" />
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">负荷均衡</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[10px] text-acid">{{ balance.rankGames }}R</span>
          <span class="text-[10px] text-ember">{{ balance.scrimGames }}S</span>
        </div>
      </div>
      <div class="flex items-end gap-1.5">
        <span class="font-display text-2xl font-bold" :class="toneText[balance.tone as Tone]">{{ balance.rankPct }}%</span>
        <span class="pb-1 text-[10px] text-muted">Rank 占比</span>
      </div>
      <p class="text-xs leading-relaxed text-muted">{{ balance.hint }}</p>
      <p class="text-[10px] text-muted/70 group-hover:text-fg transition-colors">点击查看场次分布 →</p>
    </button>

    <button
      class="group flex flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      :class="toneBorder[streak.tone as Tone]"
      @click="emit('jump', 'streak')"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <Brain :size="14" :class="toneText[streak.tone as Tone]" />
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">连续出勤</span>
        </div>
        <div
          v-if="streak.count >= 7"
          class="rounded-full border px-1.5 py-0.5 text-[9px] font-bold"
          :class="toneText[streak.tone as Tone]"
          style="border-color: currentColor"
        >x{{ streak.count }}</div>
      </div>
      <div class="flex items-end gap-1.5">
        <span class="font-display text-2xl font-bold" :class="toneText[streak.tone as Tone]">{{ streak.count }}</span>
        <span class="pb-1 text-[10px] text-muted">天连续训练</span>
      </div>
      <p class="text-xs leading-relaxed text-muted">{{ streak.hint }}</p>
      <p class="text-[10px] text-muted/70 group-hover:text-fg transition-colors">点击查看出勤详情 →</p>
    </button>
  </div>
</template>
