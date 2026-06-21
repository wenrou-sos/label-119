<script setup lang="ts">
import type { NegotiationStep } from '@/data/types'
import { stepIndex } from '@/lib/negotiation'
import { Check, X, Clock, TrendingUp, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  step: NegotiationStep | undefined
  hoursLeft?: number
  maxRounds?: number
  roundCount?: number
}>()

const stages = [
  { key: 'idle', label: '待命', icon: Clock },
  { key: 'offer_sent', label: '我方报价', icon: TrendingUp },
  { key: 'counter_received', label: '对方还价', icon: Sparkles },
  { key: 'offer_2_sent', label: '二次报价', icon: TrendingUp },
  { key: 'counter_2_received', label: '二次还价', icon: Sparkles },
  { key: 'final_offer', label: '最终决策', icon: Sparkles },
  { key: 'deal', label: '成交', icon: Check },
  { key: 'collapse', label: '破裂', icon: X },
] as const

function tone(s: string) {
  const cur = stepIndex(props.step)
  const i = stages.findIndex((x) => x.key === s)
  if (i < cur) return 'done'
  if (i === cur) return 'active'
  return 'pending'
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between text-[11px] text-muted">
      <span>谈判流程</span>
      <span v-if="typeof hoursLeft === 'number' && hoursLeft > 0" class="font-mono text-ember">
        ⏱ 剩余 {{ hoursLeft }}h
      </span>
      <span v-else-if="step === 'deal'" class="font-mono text-acid">✓ 已成交</span>
      <span v-else-if="step === 'collapse'" class="font-mono text-ember">✗ 已破裂</span>
      <span v-else class="font-mono text-muted">—</span>
    </div>

    <div class="relative">
      <div class="absolute left-3 right-3 top-3 h-0.5 bg-edge" />
      <div
        class="absolute left-3 top-3 h-0.5 bg-gradient-to-r from-acid via-acid/70 to-transparent transition-all"
        :style="{ width: `calc(((${Math.min(stepIndex(step), stages.length - 2)} / ${stages.length - 2}) * 100%) - 0px)` }"
      />
      <div class="relative grid" :style="{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }">
        <div v-for="s in stages" :key="s.key" class="flex flex-col items-center gap-1.5">
          <div
            class="relative flex h-6 w-6 items-center justify-center rounded-full border transition-all"
            :class="{
              'border-acid bg-acid text-obsidian': tone(s.key) === 'done',
              'border-acid bg-obsidian text-acid shadow-[0_0_0_3px_rgba(182,255,58,0.15)]':
                tone(s.key) === 'active',
              'border-edge bg-panel-2 text-muted': tone(s.key) === 'pending',
            }"
          >
            <component :is="s.icon" :size="12" :stroke-width="2.2" />
          </div>
          <span
            class="text-[10px] font-semibold uppercase tracking-wide"
            :class="{
              'text-acid': tone(s.key) !== 'pending',
              'text-muted': tone(s.key) === 'pending',
            }"
          >
            {{ s.label }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="maxRounds && roundCount !== undefined" class="flex items-center gap-2 text-[10px] text-muted">
      <span>回合进度</span>
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-edge">
        <div
          class="h-full rounded-full bg-gradient-to-r from-steel to-acid transition-all"
          :style="{ width: `${Math.min(100, (roundCount / maxRounds) * 100)}%` }"
        />
      </div>
      <span class="font-mono text-fg">{{ roundCount }} / {{ maxRounds }}</span>
    </div>
  </div>
</template>
