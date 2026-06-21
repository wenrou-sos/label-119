<script setup lang="ts">
import { cn } from '@/lib/utils'

withDefaults(
  defineProps<{
    title?: string
    icon?: string
    accent?: 'acid' | 'ember' | 'steel' | 'none'
    padded?: boolean
  }>(),
  { accent: 'none', padded: true },
)
</script>

<template>
  <section
    :class="
      cn(
        'panel relative overflow-hidden',
        accent === 'acid' && 'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-acid/60 before:to-transparent',
        accent === 'ember' && 'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-ember/60 before:to-transparent',
        accent === 'steel' && 'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-steel/60 before:to-transparent',
      )
    "
  >
    <header
      v-if="title || $slots.actions || $slots.header"
      class="flex items-center justify-between gap-3 border-b border-edge px-4 py-3"
    >
      <div class="flex items-center gap-2">
        <span v-if="icon" class="text-base leading-none">{{ icon }}</span>
        <h3 v-if="title" class="section-title">{{ title }}</h3>
      </div>
      <slot name="actions" />
    </header>
    <div :class="padded ? 'p-4' : ''">
      <slot />
    </div>
    <slot v-if="$slots.footer" name="footer" />
  </section>
</template>
