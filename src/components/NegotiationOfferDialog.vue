<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, TrendingUp, AlertTriangle } from 'lucide-vue-next'
import { formatMoney } from '@/lib/format'

const props = defineProps<{
  open: boolean
  askPrice: number
  counterPrice?: number
  playerHandle: string
  isLowball?: boolean
  suggestedMin?: number
  suggestedMax?: number
  lastProb?: number
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', amount: number): void
  (e: 'walk-out'): void
}>()

const amount = ref(props.askPrice * 0.8)

watch(
  () => props.open,
  (v) => {
    if (v) {
      amount.value = props.counterPrice
        ? Math.round((props.counterPrice + props.askPrice * 0.85) / 2 / 1000) * 1000
        : Math.round(props.askPrice * 0.8 / 1000) * 1000
    }
  },
  { immediate: true },
)

const belowAsk = computed(() => amount.value < props.askPrice * 0.55)

function quickSet(ratio: number) {
  amount.value = Math.round(props.askPrice * ratio / 1000) * 1000
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="emit('close')"
    >
      <div class="relative w-full max-w-md animate-fade-up overflow-hidden rounded-2xl border border-edge bg-panel shadow-panel">
        <div class="flex items-center justify-between border-b border-edge bg-panel-2 px-5 py-3">
          <div class="flex items-center gap-2">
            <TrendingUp class="text-acid" :size="18" />
            <span class="font-display text-lg font-bold uppercase tracking-wider text-fg">
              向 {{ playerHandle }} 团队报价
            </span>
          </div>
          <button
            class="rounded-md p-1 text-muted transition hover:bg-edge hover:text-fg"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="space-y-5 p-5">
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="rounded-lg border border-edge bg-panel-2 p-3">
              <div class="text-muted">挂牌要价</div>
              <div class="mt-1 font-mono text-lg text-fg">{{ formatMoney(askPrice) }}</div>
            </div>
            <div class="rounded-lg border border-edge bg-panel-2 p-3" v-if="counterPrice">
              <div class="text-muted">对方最近还价</div>
              <div class="mt-1 font-mono text-lg text-ember">{{ formatMoney(counterPrice) }}</div>
            </div>
            <div class="rounded-lg border border-edge bg-panel-2 p-3" v-else-if="lastProb !== undefined">
              <div class="text-muted">预估成交概率</div>
              <div class="mt-1 font-mono text-lg" :class="lastProb > 60 ? 'text-acid' : lastProb > 35 ? 'text-ember' : 'text-muted'">
                {{ lastProb }}%
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold uppercase tracking-wider text-muted">我方报价</label>
              <span class="font-mono text-sm text-muted">{{ formatMoney(amount) }}</span>
            </div>
            <input
              v-model.number="amount"
              type="range"
              :min="Math.round(askPrice * 0.3)"
              :max="Math.round(askPrice * 1.1)"
              :step="5000"
              class="w-full accent-acid"
            />
            <div class="flex items-center justify-between text-[10px] text-muted">
              <span>{{ formatMoney(Math.round(askPrice * 0.3)) }}</span>
              <span>{{ formatMoney(Math.round(askPrice * 1.1)) }}</span>
            </div>
            <input
              v-model.number="amount"
              type="number"
              :step="1000"
              class="w-full rounded-lg border border-edge bg-panel-2 px-3 py-2 font-mono text-sm text-fg outline-none transition focus:border-acid/60 focus:shadow-glow"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              class="flex-1 rounded-md border border-edge bg-panel-2 px-3 py-1.5 text-xs text-muted transition hover:border-steel/50 hover:text-fg"
              @click="quickSet(0.6)"
            >
              试探 60%
            </button>
            <button
              class="flex-1 rounded-md border border-edge bg-panel-2 px-3 py-1.5 text-xs text-muted transition hover:border-steel/50 hover:text-fg"
              @click="quickSet(0.8)"
            >
              合理 80%
            </button>
            <button
              class="flex-1 rounded-md border border-edge bg-panel-2 px-3 py-1.5 text-xs text-muted transition hover:border-steel/50 hover:text-fg"
              @click="quickSet(0.95)"
            >
              接近要价 95%
            </button>
          </div>

          <div
            v-if="isLowball"
            class="flex items-start gap-2 rounded-lg border border-ember/40 bg-ember/10 p-3 text-xs text-ember"
          >
            <AlertTriangle :size="16" class="mt-0.5 shrink-0" />
            <span>对方还价低于市场价，可考虑<strong>愤然离席</strong>或继续谈判。</span>
          </div>
          <div
            v-else-if="belowAsk"
            class="flex items-start gap-2 rounded-lg border border-ember/30 bg-ember/5 p-3 text-xs text-ember/90"
          >
            <AlertTriangle :size="16" class="mt-0.5 shrink-0" />
            <span>当前报价远低于挂牌价，成交概率较低。</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 border-t border-edge bg-panel-2 px-5 py-3">
          <button
            v-if="isLowball"
            class="rounded-md border border-ember/50 bg-ember/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ember transition hover:bg-ember/20"
            @click="emit('walk-out')"
          >
            愤然离席
          </button>
          <div v-else></div>
          <div class="flex gap-2">
            <button
              class="rounded-md border border-edge bg-panel px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted transition hover:text-fg"
              @click="emit('close')"
            >
              取消
            </button>
            <button
              class="rounded-md bg-acid px-4 py-2 text-xs font-bold uppercase tracking-wider text-obsidian transition hover:bg-acid-soft"
              @click="emit('submit', amount)"
            >
              提交报价
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
