<script setup lang="ts">
import type { ComplexityLevel } from '@/data/types'

defineProps<{
  level: ComplexityLevel
}>()

const toneMap: Record<ComplexityLevel, string> = {
  standard: 'bg-steel/10 text-steel border-steel/30',
  urgent: 'bg-ember/15 text-ember border-ember/40',
  complex: 'bg-violetx/15 text-violetx border-violetx/40',
}
const labelMap: Record<ComplexityLevel, string> = {
  standard: '标准',
  urgent: '急迫',
  complex: '复杂',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
    :class="toneMap[level]"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="toneMap[level].includes('violetx') ? 'bg-violetx' : toneMap[level].includes('ember') ? 'bg-ember' : 'bg-steel'"></span>
    {{ labelMap[level] }}
  </span>
</template>
