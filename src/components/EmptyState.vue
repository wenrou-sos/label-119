<script setup lang="ts">
withDefaults(defineProps<{ title?: string; desc?: string }>(), {
  title: '暂无数据',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <div class="grid-bg h-12 w-12 rounded-lg border border-edge opacity-40" />
    <p class="text-sm font-semibold text-muted">{{ title }}</p>
    <p v-if="desc" class="max-w-xs text-xs text-muted/70">{{ desc }}</p>
  </div>
</template>
