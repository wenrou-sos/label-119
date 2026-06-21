<script setup lang="ts">
import { computed } from 'vue'
import Chart from '@/components/Chart.vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useTeamStore } from '@/stores/team'
import { chartColors, axisStyle, baseTooltip, legendStyle } from '@/lib/chart'
import type { EChartsOption } from 'echarts'

const analytics = useAnalyticsStore()
const team = useTeamStore()

const PLAYER_COLORS = [chartColors.acid, chartColors.steel, chartColors.ember, chartColors.violet, chartColors.gold]

const heroes = computed(() =>
  analytics.versionMastery.map((row) => team.heroById(row.versionHero.heroId)?.name ?? ''),
)

const series = computed(() =>
  team.players.map((p, pi) => ({
    name: p.handle,
    type: 'bar',
    barGap: 0,
    data: analytics.versionMastery.map((row) => {
      const cell = row.players.find((x) => x.player.id === p.id)
      return cell?.mastery ?? 0
    }),
    itemStyle: {
      color: PLAYER_COLORS[pi % PLAYER_COLORS.length],
      borderRadius: [3, 3, 0, 0],
    },
  })),
)

const option = computed(() => ({
  grid: { left: 48, right: 16, top: 36, bottom: 28 },
  tooltip: { ...baseTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { ...legendStyle, top: 4, data: team.players.map((p) => p.handle) },
  xAxis: {
    type: 'category',
    data: heroes.value,
    ...axisStyle,
    axisLabel: { ...axisStyle.axisLabel, interval: 0, fontSize: 10 },
  },
  yAxis: { type: 'value', max: 100, ...axisStyle, name: '掌握度', nameTextStyle: { color: chartColors.text, fontSize: 10 } },
  series: series.value,
}) as EChartsOption)
</script>

<template>
  <Chart :option="option" :height="300" />
</template>
