<script setup lang="ts">
import { computed } from 'vue'
import Chart from '@/components/Chart.vue'
import { chartColors, baseGrid, axisStyle, baseTooltip, legendStyle } from '@/lib/chart'
import type { EChartsOption } from 'echarts'
import type { TrainingLog } from '@/data/types'

const props = defineProps<{ logs: TrainingLog[] }>()

const data = computed(() =>
  [...props.logs].sort((a, b) => a.logDate.localeCompare(b.logDate)).slice(-14),
)

const option = computed<EChartsOption>(() => ({
  grid: baseGrid,
  tooltip: { ...baseTooltip },
  legend: { ...legendStyle, data: ['Rank 分', 'Rank 场次', '训练赛场次'], top: 0, right: 0 },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    data: data.value.map((l) => l.logDate.slice(5)),
    ...axisStyle,
    axisLabel: { ...axisStyle.axisLabel, hideOverlap: true },
  },
  yAxis: { type: 'value', ...axisStyle },
  series: [
    {
      name: 'Rank 分',
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(182,255,58,0.9)' },
            { offset: 1, color: 'rgba(182,255,58,0.2)' },
          ],
        },
        borderRadius: [3, 3, 0, 0],
      },
      data: data.value.map((l) => l.rankPoints),
    },
    {
      name: 'Rank 场次',
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: chartColors.steel },
      itemStyle: { color: chartColors.steel },
      data: data.value.map((l) => l.rankGames),
    },
    {
      name: '训练赛场次',
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: chartColors.ember },
      itemStyle: { color: chartColors.ember },
      data: data.value.map((l) => l.scrimGames),
    },
  ],
}) as EChartsOption)
</script>

<template>
  <Chart :option="option" :height="280" />
</template>
