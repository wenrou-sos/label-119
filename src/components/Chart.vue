<script setup lang="ts">
import { onBeforeUnmount, shallowRef, watch, ref } from 'vue'
import * as echarts from 'echarts/core'
import { setupECharts } from '@/lib/echarts'
import type { EChartsOption } from 'echarts'

setupECharts()

const props = withDefaults(
  defineProps<{ option: EChartsOption; height?: number; loading?: boolean }>(),
  { height: 280, loading: false },
)

const el = shallowRef<HTMLDivElement | null>(null)
const chart = shallowRef<echarts.ECharts | null>(null)
const ready = ref(false)

function render() {
  if (!el.value) return
  if (!chart.value) {
    chart.value = echarts.init(el.value, undefined, { renderer: 'canvas' })
    ready.value = true
  }
  chart.value.setOption(props.option, true)
}

watch(() => props.option, render, { deep: true })
watch(el, (v) => {
  if (v) render()
})

function onResize() {
  chart.value?.resize()
}
window.addEventListener('resize', onResize)
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart.value?.dispose()
})

defineExpose({ chart })
</script>

<template>
  <div class="relative w-full">
    <div ref="el" :style="{ height: height + 'px' }" class="w-full" />
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center text-xs text-muted"
    >
      <span class="animate-pulse-dot">●</span> 加载中…
    </div>
  </div>
</template>
