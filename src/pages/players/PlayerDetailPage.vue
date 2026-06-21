<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, MapPin, Cake } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import PositionBadge from '@/components/PositionBadge.vue'
import Badge from '@/components/Badge.vue'
import Segmented from '@/components/Segmented.vue'
import { useTeamStore } from '@/stores/team'
import { POSITION_LABELS, type PlayerStatus } from '@/data/types'
import PlayerInfoTab from './PlayerInfoTab.vue'
import PlayerHeroPoolTab from './PlayerHeroPoolTab.vue'
import PlayerContractTab from './PlayerContractTab.vue'
import PlayerTrainingTab from './PlayerTrainingTab.vue'

const route = useRoute()
const router = useRouter()
const team = useTeamStore()

const id = computed(() => String(route.params.id))
const player = computed(() => team.playerById(id.value))

const tab = ref<'info' | 'heroes' | 'contract' | 'training'>('info')

const tabs = [
  { value: 'info', label: '基础信息' },
  { value: 'heroes', label: '英雄池' },
  { value: 'contract', label: '合同档案' },
  { value: 'training', label: '训练数据' },
]

const statusLabel: Record<PlayerStatus, string> = {
  active: '主力',
  benched: '替补',
  training: '青训',
}
const statusTone: Record<PlayerStatus, 'acid' | 'muted' | 'ember'> = {
  active: 'acid',
  benched: 'muted',
  training: 'ember',
}
</script>

<template>
  <div v-if="player" class="space-y-5">
    <button class="btn-ghost" @click="router.push('/players')">
      <ArrowLeft :size="15" /> 返回队员列表
    </button>

    <PageHeader :icon="player.avatar || '?'" :title="player.handle" :subtitle="`${player.realName} · ${POSITION_LABELS[player.position]}`">
      <template #actions>
        <div class="flex items-center gap-2">
          <PositionBadge :position="player.position" size="md" />
          <Badge :tone="statusTone[player.status]" :label="statusLabel[player.status]" dot />
        </div>
      </template>
    </PageHeader>

    <div class="panel grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
      <div>
        <p class="text-xs uppercase tracking-wider text-muted">年龄</p>
        <p class="mt-1 flex items-center gap-1.5 font-display text-lg font-bold text-fg">
          <Cake :size="15" class="text-acid" /> {{ player.age }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wider text-muted">国籍</p>
        <p class="mt-1 flex items-center gap-1.5 font-display text-lg font-bold text-fg">
          <MapPin :size="15" class="text-steel" /> {{ player.nationality }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wider text-muted">入队日期</p>
        <p class="mt-1 font-display text-lg font-bold text-fg">{{ player.joinDate }}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-wider text-muted">坐标</p>
        <p class="mt-1 font-mono text-sm text-muted">{{ player.latitude.toFixed(2) }}, {{ player.longitude.toFixed(2) }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <Segmented v-model="tab" :options="tabs" />
    </div>

    <PlayerInfoTab v-if="tab === 'info'" :player="player" />
    <PlayerHeroPoolTab v-else-if="tab === 'heroes'" :player-id="player.id" />
    <PlayerContractTab v-else-if="tab === 'contract'" :player-id="player.id" />
    <PlayerTrainingTab v-else :player-id="player.id" />
  </div>
  <div v-else class="py-20 text-center text-muted">选手不存在或加载中…</div>
</template>
