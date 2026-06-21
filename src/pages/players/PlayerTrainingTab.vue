<script setup lang="ts">
import { computed } from 'vue'
import { Download, Flame, Gamepad2, TrendingUp } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import StatCard from '@/components/StatCard.vue'
import TrainingTrendChart from './TrainingTrendChart.vue'
import { useTeamStore } from '@/stores/team'
import { exportCsv, formatDate } from '@/lib/format'

const props = defineProps<{ playerId: string }>()
const team = useTeamStore()

const logs = computed(() => team.logsOfPlayer(props.playerId))
const player = computed(() => team.playerById(props.playerId))

const stats = computed(() => {
  const l = logs.value
  const totalGames = l.reduce((s, x) => s + x.rankGames, 0)
  const totalPoints = l.reduce((s, x) => s + x.rankPoints, 0)
  const avgPoints = l.length ? Math.round(totalPoints / l.length) : 0
  const totalScrims = l.reduce((s, x) => s + x.scrimGames, 0)
  return { totalGames, totalPoints, avgPoints, totalScrims }
})

function exportData() {
  exportCsv(`training_${player.value?.handle ?? 'player'}.csv`, [
    ...logs.value.map((l) => ({
      日期: l.logDate,
      Rank分: l.rankPoints,
      Rank场次: l.rankGames,
      训练赛场次: l.scrimGames,
    })),
  ])
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="累计 Rank 分" :value="stats.totalPoints" tone="acid" :icon="TrendingUp" trend="up" delta="14日" />
      <StatCard label="累计 Rank 场" :value="stats.totalGames" tone="steel" :icon="Gamepad2" trend="up" delta="14日" />
      <StatCard label="日均 Rank 分" :value="stats.avgPoints" tone="violetx" :icon="Flame" trend="flat" delta="均值" />
      <StatCard label="训练赛场次" :value="stats.totalScrims" tone="ember" :icon="Gamepad2" trend="up" delta="14日" />
    </div>

    <BaseCard title="训练数据趋势" icon="📉" accent="acid">
      <template #actions>
        <button class="btn-steel !py-1.5 text-xs" @click="exportData">
          <Download :size="13" /> 导出 CSV
        </button>
      </template>
      <TrainingTrendChart :logs="logs" />
    </BaseCard>

    <BaseCard title="训练明细记录" icon="📋" accent="steel">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-edge text-left text-xs uppercase tracking-wider text-muted">
              <th class="py-2 pr-4 font-semibold">日期</th>
              <th class="py-2 pr-4 font-semibold">Rank 分</th>
              <th class="py-2 pr-4 font-semibold">Rank 场</th>
              <th class="py-2 pr-4 font-semibold">训练赛</th>
            </tr>
          </thead>
          <tbody class="font-mono">
            <tr
              v-for="l in [...logs].reverse().slice(0, 10)"
              :key="l.id"
              class="border-b border-edge-soft/50 hover:bg-panel-2"
            >
              <td class="py-2 pr-4 text-fg">{{ formatDate(l.logDate) }}</td>
              <td class="py-2 pr-4 text-acid">{{ l.rankPoints }}</td>
              <td class="py-2 pr-4 text-steel">{{ l.rankGames }}</td>
              <td class="py-2 pr-4 text-ember">{{ l.scrimGames }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>
