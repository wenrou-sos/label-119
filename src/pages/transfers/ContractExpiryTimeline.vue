<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Clock, ShieldCheck } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Avatar from '@/components/Avatar.vue'
import PositionBadge from '@/components/PositionBadge.vue'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { daysUntil, formatDate, formatMoney } from '@/lib/format'

const team = useTeamStore()
const { canSeeSensitive, maskMoney } = usePermission()

const rows = computed(() =>
  team.players
    .map((p) => {
      const c = team.contractByPlayer(p.id)
      if (!c) return null
      const days = daysUntil(c.endDate)
      return { player: p, contract: c, days }
    })
    .filter(Boolean)
    .sort((a, b) => (a!.days - b!.days)) as {
    player: (typeof team.players)[number]
    contract: (typeof team.contracts)[number]
    days: number
  }[],
)

function tone(d: number) {
  if (d < 0) return 'ember'
  if (d < 90) return 'ember'
  if (d < 180) return 'steel'
  return 'acid'
}
function label(d: number) {
  if (d < 0) return '已过期'
  if (d === 0) return '今日到期'
  return `剩 ${d} 天`
}
</script>

<template>
  <BaseCard title="合同到期时间表" icon="📋" accent="ember">
    <div class="space-y-2">
      <div
        v-for="r in rows"
        :key="r.player.id"
        class="flex items-center gap-3 rounded-md border border-edge bg-ink-800/40 p-3"
      >
        <Avatar :text="r.player.avatar" :tone="tone(r.days)" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="font-display text-sm font-bold text-fg">{{ r.player.handle }}</span>
            <PositionBadge :position="r.player.position" />
          </div>
          <p class="font-mono text-[11px] text-muted">{{ formatDate(r.contract.startDate) }} → {{ formatDate(r.contract.endDate) }} · {{ r.contract.years }}年</p>
        </div>
        <div class="hidden text-right sm:block">
          <p class="text-[10px] uppercase text-muted">年薪</p>
          <p class="font-mono text-sm text-acid">{{ canSeeSensitive ? formatMoney(r.contract.salaryMonthly) : maskMoney(r.contract.salaryMonthly) }}</p>
        </div>
        <Badge :tone="tone(r.days)" :label="label(r.days)" dot />
      </div>
    </div>
  </BaseCard>
</template>
