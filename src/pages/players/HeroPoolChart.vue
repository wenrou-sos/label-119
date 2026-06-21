<script setup lang="ts">
import { computed } from 'vue'
import Chart from '@/components/Chart.vue'
import { chartColors, baseTooltip } from '@/lib/chart'
import type { EChartsOption } from 'echarts'
import type { Hero, PlayerHero } from '@/data/types'

const props = defineProps<{
  heroes: (PlayerHero & { hero: Hero | null })[]
}>()

const indicators = computed(() =>
  props.heroes.map((h) => ({
    name: h.hero?.name ?? '—',
    max: 100,
  })),
)

const option = computed<EChartsOption>(() => ({
  tooltip: { ...baseTooltip, trigger: 'item' },
  radar: {
    indicator: indicators.value.length ? indicators.value : [{ name: '—', max: 100 }],
    radius: '62%',
    center: ['50%', '54%'],
    axisName: { color: chartColors.text, fontSize: 11, fontFamily: 'JetBrains Mono' },
    splitLine: { lineStyle: { color: 'rgba(35,39,51,0.7)' } },
    splitArea: { areaStyle: { color: ['rgba(182,255,58,0.02)', 'rgba(182,255,58,0.05)'] } },
    axisLine: { lineStyle: { color: 'rgba(35,39,51,0.8)' } },
  },
  series: [
    {
      type: 'radar',
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { width: 2, color: chartColors.acid },
      itemStyle: { color: chartColors.acid },
      areaStyle: { color: 'rgba(182,255,58,0.18)' },
      data: [
        {
          value: props.heroes.map((h) => h.mastery),
          name: '熟练度',
        },
      ],
    },
  ],
}))
</script>

<template>
  <Chart :option="option" :height="260" />
</template>
