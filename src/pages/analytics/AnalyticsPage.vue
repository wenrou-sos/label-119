<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Crown, Layers } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import WinrateHeatmap from './WinrateHeatmap.vue'
import VersionMasteryChart from './VersionMasteryChart.vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useTeamStore } from '@/stores/team'

const analytics = useAnalyticsStore()
const team = useTeamStore()

const maxText = computed(() => {
  const c = analytics.maxCell
  if (!c.playerId) return '—'
  return `${team.playerById(c.playerId)?.handle} · ${team.heroById(c.heroId)?.name}`
})
const minText = computed(() => {
  const c = analytics.minCell
  if (!c.playerId) return '—'
  return `${team.playerById(c.playerId)?.handle} · ${team.heroById(c.heroId)?.name}`
})

const avgMastery = computed(() => {
  let sum = 0
  let n = 0
  for (const row of analytics.versionMastery) {
    for (const p of row.players) {
      sum += p.mastery
      n++
    }
  }
  return n ? Math.round(sum / n) : 0
})

const versionHeroName = (hid: string) => team.heroById(hid)?.name ?? ''
const masteryRows = computed(() => analytics.versionMastery)
const playerColor = (idx: number) => (['acid', 'steel', 'ember', 'violetx'] as const)[idx % 4]
</script>

<template>
  <div class="space-y-5">
    <PageHeader icon="📈" title="数据分析" subtitle="英雄池胜率矩阵 · 版本英雄掌握进度" />

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="最高胜率组合" :value="maxText" tone="acid" icon="🏆" />
      <StatCard label="最低胜率组合" :value="minText" tone="ember" icon="⚠️" />
      <StatCard label="版本强势英雄" :value="String(team.currentVersionHeroes.length) + ' 位'" tone="steel" icon="🎯" />
      <StatCard label="平均掌握度" :value="avgMastery + '%'" tone="violetx" icon="📊" />
    </div>

    <BaseCard title="英雄池胜率矩阵" icon="🎯" accent="steel">
      <template #actions>
        <div class="flex items-center gap-3 text-[11px] text-muted">
          <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded border-2 border-acid" /> 最高</span>
          <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded border-2 border-ember" /> 最低</span>
        </div>
      </template>
      <WinrateHeatmap />
    </BaseCard>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <BaseCard title="版本英雄掌握进度" icon="📚" accent="acid">
        <VersionMasteryChart />
      </BaseCard>

      <BaseCard title="版本英雄学习明细" icon="🧩" accent="ember">
        <div class="space-y-3">
          <div
            v-for="(row, ri) in masteryRows"
            :key="ri"
            class="rounded-md border border-edge bg-ink-800/30 p-3"
          >
            <div class="mb-2 flex items-center gap-2">
              <Badge tone="gold" :label="'T' + (row.versionHero.tier ?? 'A')" />
              <span class="font-display text-sm font-bold text-fg">{{ versionHeroName(row.versionHero.heroId) }}</span>
            </div>
            <div class="space-y-1.5">
              <div v-for="(p, pi) in row.players" :key="p.player.id" class="flex items-center gap-2">
                <span class="w-16 shrink-0 truncate text-xs text-muted">{{ p.player.handle }}</span>
                <div class="flex-1">
                  <ProgressBar :value="p.mastery" :max="100" :tone="playerColor(pi)" :show-value="false" :height="6" />
                </div>
                <span class="w-9 shrink-0 text-right font-mono text-xs" :class="p.mastery >= 80 ? 'text-acid' : p.mastery >= 50 ? 'text-steel' : 'text-ember'">{{ p.mastery }}%</span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
