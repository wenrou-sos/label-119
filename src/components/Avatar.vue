<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { PlayerStatus } from '@/data/types'

const props = withDefaults(
  defineProps<{
    text: string
    status?: PlayerStatus
    size?: 'sm' | 'md' | 'lg'
    tone?: 'acid' | 'steel' | 'ember' | 'violetx'
  }>(),
  { size: 'md', tone: 'steel' },
)

const statusColor: Record<PlayerStatus, string> = {
  active: 'bg-acid',
  benched: 'bg-muted',
  training: 'bg-ember',
}
const sizeCls = computed(
  () =>
    ({
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-lg',
    })[props.size],
)
const toneBg = computed(
  () =>
    ({
      acid: 'bg-acid/15 text-acid border-acid/30',
      steel: 'bg-steel/15 text-steel border-steel/30',
      ember: 'bg-ember/15 text-ember border-ember/30',
      violetx: 'bg-violetx/15 text-violetx border-violetx/30',
    })[props.tone],
)
</script>

<template>
  <div class="relative inline-block shrink-0">
    <div
      :class="
        cn(
          'flex items-center justify-center rounded-md border font-display font-bold',
          sizeCls,
          toneBg,
        )
      "
    >
      {{ text }}
    </div>
    <span
      v-if="status"
      :class="
        cn(
          'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-panel',
          statusColor[status],
          status === 'active' && 'animate-pulse-dot',
        )
      "
    />
  </div>
</template>
