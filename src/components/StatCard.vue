<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    delta?: string
    trend?: 'up' | 'down' | 'flat'
    tone?: 'acid' | 'ember' | 'steel' | 'violetx'
    icon?: Component | string
  }>(),
  { tone: 'acid', trend: 'flat' },
)
const toneCls = computed(
  () =>
    ({
      acid: 'text-acid',
      ember: 'text-ember',
      steel: 'text-steel',
      violetx: 'text-violetx',
    })[props.tone],
)
const trendCls = computed(
  () =>
    ({
      up: 'text-acid',
      down: 'text-ember',
      flat: 'text-muted',
    })[props.trend ?? 'flat'],
)
</script>

<template>
  <div class="panel group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-300">
    <div class="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-xl" :class="toneCls.replace('text-', 'bg-')" />
    <div class="flex items-start justify-between">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wider text-muted">{{ label }}</p>
        <p class="mt-1 font-display text-3xl font-bold tracking-tight text-fg">
          {{ value }}
        </p>
      </div>
      <div v-if="icon" :class="cn('shrink-0 opacity-80', toneCls)" :aria-hidden="true">
        <span v-if="typeof icon === 'string'" class="text-2xl leading-none">{{ icon }}</span>
        <component v-else :is="icon" :size="22" :stroke-width="2" />
      </div>
    </div>
    <div v-if="delta" class="mt-2 flex items-center gap-1 text-xs font-mono">
      <span :class="trendCls">{{ trend === 'up' ? '▲' : trend === 'down' ? '▼' : '◆' }}</span>
      <span :class="trendCls">{{ delta }}</span>
    </div>
  </div>
</template>
