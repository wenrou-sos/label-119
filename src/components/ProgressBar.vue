<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { clamp } from '@/lib/format'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    tone?: 'acid' | 'ember' | 'steel' | 'violetx'
    showValue?: boolean
    unit?: string
    height?: number
  }>(),
  { max: 100, tone: 'acid', showValue: true, unit: '%', height: 8 },
)

const pct = computed(() => clamp(Math.round((props.value / props.max) * 100), 0, 100))
const barTone = computed(
  () =>
    ({
      acid: 'from-acid-soft to-acid',
      ember: 'from-ember-soft to-ember',
      steel: 'from-steel-soft to-steel',
      violetx: 'from-violet-400 to-violetx',
    })[props.tone],
)
const glow = computed(
  () =>
    ({
      acid: 'shadow-[0_0_12px_-2px_rgba(182,255,58,0.6)]',
      ember: 'shadow-[0_0_12px_-2px_rgba(255,107,53,0.6)]',
      steel: 'shadow-[0_0_12px_-2px_rgba(56,189,248,0.6)]',
      violetx: 'shadow-[0_0_12px_-2px_rgba(167,139,250,0.6)]',
    })[props.tone],
)
</script>

<template>
  <div class="w-full">
    <div v-if="showValue" class="mb-1 flex items-center justify-between text-xs">
      <span class="font-mono text-fg">{{ value.toLocaleString() }}<span v-if="unit" class="text-muted">/{{ max.toLocaleString() }}{{ unit === '%' ? '' : unit }}</span></span>
      <span class="font-mono text-muted">{{ pct }}%</span>
    </div>
    <div
      class="relative w-full overflow-hidden rounded-full bg-ink-800"
      :style="{ height: height + 'px' }"
    >
      <div
        :class="cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', barTone, glow)"
        :style="{ width: pct + '%' }"
      />
    </div>
  </div>
</template>
