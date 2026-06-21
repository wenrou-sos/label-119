<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, FileSignature, Trophy, CalendarClock, ArrowUpRight, AlertTriangle } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Avatar from '@/components/Avatar.vue'
import LeafletMap from '@/components/LeafletMap.vue'
import type { MapMarker } from '@/components/LeafletMap.vue'
import DashboardTrendChart from './DashboardTrendChart.vue'
import { useTeamStore } from '@/stores/team'
import { useScrimsStore } from '@/stores/scrims'
import { useCalendarStore } from '@/stores/calendar'
import { POSITION_LABELS, TASK_TYPE_LABELS, type Contract } from '@/data/types'
import { daysUntil, formatDate } from '@/lib/format'

const team = useTeamStore()
const scrims = useScrimsStore()
const calendar = useCalendarStore()
const router = useRouter()

const activeContracts = computed(
  () => team.contracts.filter((c) => c.status !== 'expired').length,
)
const winRate7d = computed(() => {
  const cutoff = Date.now() - 7 * 86400000
  const recents = scrims.recentRecords.filter(
    (r) => r.scrim && new Date(r.scrim.scheduledAt).getTime() >= cutoff,
  )
  const total = recents.length
  const wins = recents.filter((r) => r.record.result === 'WIN').length
  return total ? Math.round((wins / total) * 100) : 0
})
const pendingTasks = computed(
  () => calendar.tasks.filter((t) => t.status !== 'done').length,
)

const contractAlerts = computed(() =>
  [...team.contracts]
    .map((c) => ({ c, days: daysUntil(c.endDate) }))
    .filter((x) => x.days <= 120)
    .sort((a, b) => a.days - b.days)
    .slice(0, 4),
)
function alertTone(days: number): 'ember' | 'gold' | 'muted' {
  return days < 30 ? 'ember' : days < 90 ? 'gold' : 'muted'
}

const playerMarkers = computed<MapMarker[]>(
  () =>
    team.players.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
      title: p.handle,
      label: `${p.nationality} · ${POSITION_LABELS[p.position]}`,
      tone: p.status === 'active' ? 'acid' : 'ember',
    })),
)

const recent = computed(() => scrims.recentRecords.slice(0, 4))
const upcoming = computed(() => calendar.upcoming.slice(0, 5))

function go(id: string) {
  router.push(`/players/${id}`)
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader
      icon="◎"
      title="指挥中心"
      subtitle="NEXUS 战队作战态势 · 实时数据驾驶舱"
    >
      <template #actions>
        <div class="chip font-mono">
          <span class="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-acid" />
          {{ formatDate(new Date().toISOString(), true) }}
        </div>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="在册选手" :value="team.players.length" delta="全队 5+1" trend="up" tone="acid" :icon="Users" />
      <StatCard label="在岗合同" :value="activeContracts" delta="含 3 份即将到期" trend="flat" tone="steel" :icon="FileSignature" />
      <StatCard label="近7日胜率" :value="winRate7d + '%'" delta="训练赛" trend="up" tone="ember" :icon="Trophy" />
      <StatCard label="待办日程" :value="pendingTasks" delta="本训练周期" trend="flat" tone="violetx" :icon="CalendarClock" />
    </div>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <BaseCard title="全队训练趋势" icon="📈" accent="acid" class="xl:col-span-2">
        <template #actions>
          <span class="chip font-mono text-[10px]">近 14 日</span>
        </template>
        <DashboardTrendChart />
      </BaseCard>

      <BaseCard title="合同到期预警" icon="⏳" accent="ember">
        <div class="space-y-2.5">
          <div
            v-for="a in contractAlerts"
            :key="a.c.id"
            class="flex cursor-pointer items-center gap-3 rounded-md border border-edge bg-ink-800/40 p-2.5 transition hover:border-ink-300"
            @click="go(a.c.playerId)"
          >
            <Avatar :text="team.playerById(a.c.playerId)?.avatar ?? '?'" size="sm" :tone="a.days < 30 ? 'ember' : 'steel'" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-fg">
                {{ team.playerById(a.c.playerId)?.handle }}
              </p>
              <p class="font-mono text-[11px] text-muted">到期 {{ formatDate(a.c.endDate) }}</p>
            </div>
            <Badge :tone="alertTone(a.days)" dot :label="a.days < 0 ? '已过期' : `${a.days}天`" />
          </div>
          <p v-if="!contractAlerts.length" class="py-6 text-center text-xs text-muted">暂无预警</p>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <BaseCard title="最近训练赛" icon="⚔️" accent="steel" class="xl:col-span-2">
        <div class="space-y-2">
          <div
            v-for="r in recent"
            :key="r.record.id"
            class="flex items-center gap-3 rounded-md border border-edge bg-ink-800/40 p-3"
          >
            <Badge
              :tone="r.record.result === 'WIN' ? 'acid' : r.record.result === 'LOSS' ? 'ember' : 'muted'"
              :label="r.record.result"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-fg">vs {{ r.opponent?.name }}</p>
              <p class="font-mono text-[11px] text-muted">{{ formatDate(r.scrim?.scheduledAt ?? '', true) }} · BO{{ r.scrim?.bo }}</p>
            </div>
            <span class="font-display text-lg font-bold" :class="r.record.result === 'WIN' ? 'text-acid' : 'text-ember'">
              {{ r.record.ourScore }}:{{ r.record.oppScore }}
            </span>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="即将到来" icon="🗓️" accent="acid">
        <div class="space-y-2">
          <div
            v-for="t in upcoming"
            :key="t.id"
            class="flex items-center gap-2.5 rounded-md border border-edge bg-ink-800/40 p-2.5"
          >
            <div class="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded border border-edge bg-panel-2">
              <span class="font-display text-sm font-bold text-acid">{{ formatDate(t.startAt).slice(8, 10) }}</span>
              <span class="text-[9px] uppercase text-muted">{{ formatDate(t.startAt).slice(5, 7) }}月</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-fg">{{ t.title }}</p>
              <p class="text-[11px] text-muted">{{ TASK_TYPE_LABELS[t.type] }} · {{ formatDate(t.startAt, true).slice(11) }}</p>
            </div>
            <Badge v-if="t.reminder" tone="ember" label="提醒" />
          </div>
          <button class="btn-ghost w-full justify-center" @click="router.push('/calendar')">
            查看全部日程 <ArrowUpRight :size="14" />
          </button>
        </div>
      </BaseCard>
    </div>

    <BaseCard title="队员国籍与驻地分布" icon="🌍" accent="steel" padded>
      <template #actions>
        <span class="chip text-[10px]"><AlertTriangle :size="11" /> 暗色地图 · {{ team.players.length }} 名选手</span>
      </template>
      <LeafletMap :markers="playerMarkers" :height="360" />
    </BaseCard>
  </div>
</template>
