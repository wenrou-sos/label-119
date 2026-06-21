<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import ContractExpiryTimeline from './ContractExpiryTimeline.vue'
import TransferMarket from './TransferMarket.vue'
</script>

<template>
  <div class="space-y-5">
    <PageHeader icon="🔄" title="转会管理" subtitle="合同到期预警 · 转会市场 · 试训谈判" />
    <ContractExpiryTimeline />
    <TransferMarket />
  </div>
</template>
