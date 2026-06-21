<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; icon?: string }>()
</script>

<template>
  <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div class="flex items-center gap-3">
      <div
        v-if="icon"
        class="flex h-10 w-10 items-center justify-center rounded-md border border-edge bg-panel-2 text-lg"
      >
        {{ icon }}
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-fg">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-0.5 text-sm text-muted">{{ subtitle }}</p>
      </div>
    </div>
    <slot name="actions" />
  </div>
</template>
