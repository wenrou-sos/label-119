<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type Tone = 'acid' | 'ember' | 'steel' | 'violetx' | 'muted' | 'gold'

const props = withDefaults(
  defineProps<{ tone?: Tone; dot?: boolean; label: string }>(),
  { tone: 'muted', dot: false },
)

const tones: Record<Tone, string> = {
  acid: 'border-acid/30 bg-acid/10 text-acid',
  ember: 'border-ember/30 bg-ember/10 text-ember',
  steel: 'border-steel/30 bg-steel/10 text-steel',
  violetx: 'border-violetx/30 bg-violetx/10 text-violetx',
  muted: 'border-edge bg-ink-700/60 text-muted',
  gold: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400',
}
const dotColor: Record<Tone, string> = {
  acid: 'bg-acid',
  ember: 'bg-ember',
  steel: 'bg-steel',
  violetx: 'bg-violetx',
  muted: 'bg-muted',
  gold: 'bg-yellow-400',
}
const cls = computed(() => tones[props.tone])
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold',
        cls,
      )
    "
  >
    <span
      v-if="dot"
      :class="cn('h-1.5 w-1.5 rounded-full animate-pulse-dot', dotColor[tone])"
    />
    {{ label }}
  </span>
</template>
