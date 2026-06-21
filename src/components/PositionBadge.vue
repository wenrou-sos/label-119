<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { POSITION_LABELS, type Position } from '@/data/types'

const props = withDefaults(defineProps<{ position?: Position; size?: 'sm' | 'md' }>(), {
  position: 'mid',
  size: 'sm',
})
const colors: Record<Position, string> = {
  top: 'border-ember/30 bg-ember/10 text-ember',
  jng: 'border-acid/30 bg-acid/10 text-acid',
  mid: 'border-steel/30 bg-steel/10 text-steel',
  adc: 'border-violetx/30 bg-violetx/10 text-violetx',
  sup: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400',
}
const cls = computed(() => colors[props.position])
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center justify-center rounded border font-display font-semibold uppercase tracking-wider',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        cls,
      )
    "
  >
    {{ POSITION_LABELS[position] }}
  </span>
</template>
