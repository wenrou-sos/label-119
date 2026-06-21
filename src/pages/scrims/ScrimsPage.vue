<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import Segmented from '@/components/Segmented.vue'
import OpponentsTab from './OpponentsTab.vue'
import ScrimRecordsTab from './ScrimRecordsTab.vue'
import ReviewTab from './ReviewTab.vue'

const tab = ref<'opponents' | 'records' | 'review'>('opponents')
const tabs = [
  { value: 'opponents', label: '约战对手' },
  { value: 'records', label: '训练赛记录' },
  { value: 'review', label: '复盘评分' },
]
</script>

<template>
  <div class="space-y-5">
    <PageHeader icon="⚔️" title="训练赛管理" subtitle="约战对手 · 赛事记录 · 复盘评分" />
    <Segmented v-model="tab" :options="tabs" />
    <OpponentsTab v-if="tab === 'opponents'" />
    <ScrimRecordsTab v-else-if="tab === 'records'" />
    <ReviewTab v-else />
  </div>
</template>
