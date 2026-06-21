<script setup lang="ts">
import { cn } from '@/lib/utils'

export interface SegOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: SegOption[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function select(v: string) {
  if (v !== props.modelValue) emit('update:modelValue', v)
}
</script>

<template>
  <div class="inline-flex rounded-md border border-edge bg-ink-800/70 p-0.5">
    <button
      v-for="opt in options"
      :key="opt.value"
      :class="
        cn(
          'rounded px-3 py-1.5 text-xs font-semibold transition-all',
          modelValue === opt.value
            ? 'bg-acid/15 text-acid shadow-glow'
            : 'text-muted hover:text-fg',
        )
      "
      @click="select(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
