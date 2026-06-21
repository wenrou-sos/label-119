<script setup lang="ts">
import { computed } from 'vue'
import Chart from '@/components/Chart.vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useTeamStore } from '@/stores/team'
import { chartColors, baseGrid } from '@/lib/chart'
import type { EChartsOption } from 'echarts'

const analytics = useAnalyticsStore()
const team = useTeamStore()

const heroes = computed(() => team.heroes)
const players = computed(() => team.players)

const data = computed(() => {
  const max = analytics.maxCell
  const min = analytics.minCell
  return analytics.matrix.map((c) => {
    const xi = heroes.value.findIndex((h) => h.id === c.heroId)
    const yi = players.value.findIndex((p) => p.id === c.playerId)
    const isMax = max.playerId === c.playerId && max.heroId === c.heroId
    const isMin = min.playerId === c.playerId && min.heroId === c.heroId
    return {
      value: [xi, yi, c.winrate],
      games: c.games,
      player: players.value[yi]?.handle ?? '',
      hero: heroes.value[xi]?.name ?? '',
      itemStyle: {
        borderColor: isMax ? chartColors.acid : isMin ? chartColors.ember : 'transparent',
        borderWidth: isMax || isMin ? 2.5 : 0,
      },
    }
  })
})

const option = computed(() => ({
  ...baseGrid,
  grid: { left: 80, right: 24, top: 16, bottom: 90, containLabel: false },
  tooltip: {
    ...{
      backgroundColor: 'rgba(10,13,20,0.95)',
      borderColor: 'rgba(56,189,248,0.3)',
      textStyle: { color: '#e2e8f0', fontFamily: 'JetBrains Mono' },
    },
    formatter: (p: any) =>
      `${p.data.player} · ${p.data.hero}<br/>胜率 <b style="color:${chartColors.acid}">${p.value[2]}%</b> · ${p.data.games} 场`,
  },
  xAxis: {
    type: 'category',
    data: heroes.value.map((h) => h.icon + ' ' + h.name),
    splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'] } },
    axisLabel: { color: chartColors.text, fontSize: 10, rotate: 45, interval: 0 },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
  },
  yAxis: {
    type: 'category',
    data: players.value.map((p) => p.handle),
    splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'] } },
    axisLabel: { color: chartColors.text, fontSize: 11, fontFamily: 'Chakra Petch' },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: 8,
    itemWidth: 14,
    itemHeight: 120,
    textStyle: { color: chartColors.text, fontSize: 10 },
    inRange: { color: ['rgba(255,107,53,0.85)', 'rgba(244,197,68,0.9)', chartColors.acid] },
  },
  series: [
    {
      type: 'heatmap',
      data: data.value,
      label: { show: true, color: '#0a0d14', fontSize: 10, fontWeight: 'bold' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(182,255,58,0.5)' } },
    },
  ],
}) as EChartsOption)
</script>

<template>
  <Chart :option="option" :height="420" />
</template>
