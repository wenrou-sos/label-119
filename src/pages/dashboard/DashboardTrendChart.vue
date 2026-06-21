<script setup lang="ts">
import { computed } from 'vue'
import Chart from '@/components/Chart.vue'
import { useTeamStore } from '@/stores/team'
import { chartColors, baseGrid, axisStyle, baseTooltip, legendStyle } from '@/lib/chart'
import type { EChartsOption } from 'echarts'

const team = useTeamStore()

const trend = computed(() => {
  const byDate = new Map<string, { rank: number; scrim: number }>()
  for (const log of team.trainingLogs) {
    const e = byDate.get(log.logDate) ?? { rank: 0, scrim: 0 }
    e.rank += log.rankPoints
    e.scrim += log.scrimGames
    byDate.set(log.logDate, e)
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
})

const option = computed<EChartsOption>(() => ({
  grid: baseGrid,
  tooltip: { ...baseTooltip },
  legend: { ...legendStyle, data: ['每日 Rank 分', '训练赛场次'], top: 0, right: 0 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trend.value.map(([d]) => d.slice(5)),
    ...axisStyle,
    axisLabel: { ...axisStyle.axisLabel, hideOverlap: true },
  },
  yAxis: [
    { type: 'value', name: 'Rank', ...axisStyle, nameTextStyle: { color: chartColors.text, fontSize: 10 } },
    { type: 'value', name: '场次', ...axisStyle, nameTextStyle: { color: chartColors.text, fontSize: 10 } },
  ],
  series: [
    {
      name: '每日 Rank 分',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      lineStyle: { width: 2.5, color: chartColors.acid },
      itemStyle: { color: chartColors.acid },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(182,255,58,0.28)' },
            { offset: 1, color: 'rgba(182,255,58,0)' },
          ],
        },
      },
      data: trend.value.map(([, v]) => v.rank),
    },
    {
      name: '训练赛场次',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: chartColors.steel, type: [5, 4] as unknown as string },
      itemStyle: { color: chartColors.steel },
      data: trend.value.map(([, v]) => v.scrim),
    },
  ],
}) as EChartsOption)
</script>

<template>
  <Chart :option="option" :height="260" :loading="team.loading" />
</template>
