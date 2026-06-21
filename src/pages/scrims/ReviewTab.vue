<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Save, Plus, ClipboardList } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Avatar from '@/components/Avatar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useScrimsStore } from '@/stores/scrims'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/lib/format'
import type { PlayerScore } from '@/data/types'

const scrims = useScrimsStore()
const team = useTeamStore()
const { canEdit } = usePermission()

const records = computed(() => scrims.recentRecords)
const selectedId = ref(records.value[0]?.record.id ?? '')
watch(records, (rs) => {
  if (!rs.some((r) => r.record.id === selectedId.value))
    selectedId.value = rs[0]?.record.id ?? ''
})

const selected = computed(() =>
  records.value.find((r) => r.record.id === selectedId.value),
)
const existingReview = computed(() =>
  selectedId.value ? scrims.reviewByRecord(selectedId.value) : null,
)

const coach = ref('Coach Ray')
const notes = ref('')
const scoreMap = ref<Record<string, Record<string, number>>>({})

function loadReview() {
  const rec = selected.value
  if (!rec) return
  const ex = existingReview.value
  coach.value = ex?.coach ?? 'Coach Ray'
  notes.value = ex?.notes ?? ''
  const init: Record<string, Record<string, number>> = {}
  for (const pp of rec.record.players) {
    init[pp.playerId] = {}
    for (const c of team.scoringCriteria) {
      const found = ex
        ? scrims.scoresByReview(ex.id).find(
            (s) => s.playerId === pp.playerId && s.criterion === c.name,
          )
        : null
      init[pp.playerId][c.name] = found?.score ?? 0
    }
  }
  scoreMap.value = init
}
watch(selectedId, loadReview, { immediate: true })

function avg(playerId: string): number {
  const m = scoreMap.value[playerId]
  if (!m) return 0
  const vals = Object.values(m)
  return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : 0
}

const newCritName = ref('')
const newCritWeight = ref(10)
async function addCrit() {
  if (!newCritName.value) return
  await team.addCriterion(newCritName.value, newCritWeight.value)
  newCritName.value = ''
  loadReview()
}

async function saveReview() {
  const rec = selected.value
  if (!rec) return
  const scores: PlayerScore[] = []
  for (const pp of rec.record.players) {
    for (const c of team.scoringCriteria) {
      scores.push({
        id: `ps_${Date.now()}_${pp.playerId}_${c.name}`,
        reviewId: existingReview.value?.id ?? '',
        playerId: pp.playerId,
        score: scoreMap.value[pp.playerId]?.[c.name] ?? 0,
        criterion: c.name,
      })
    }
  }
  await scrims.saveReview(
    {
      id: existingReview.value?.id ?? '',
      scrimRecordId: rec.record.id,
      coach: coach.value,
      notes: notes.value,
      createdAt: existingReview.value?.createdAt ?? new Date().toISOString(),
    },
    scores,
  )
  loadReview()
}
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
    <BaseCard title="训练赛列表" icon="🗂️" accent="steel" padded class="lg:col-span-1">
      <div class="space-y-2">
        <button
          v-for="r in records"
          :key="r.record.id"
          class="w-full rounded-md border p-2.5 text-left transition"
          :class="selectedId === r.record.id ? 'border-acid/40 bg-acid/5' : 'border-edge bg-ink-800/40 hover:border-ink-300'"
          @click="selectedId = r.record.id"
        >
          <div class="flex items-center justify-between">
            <span class="truncate text-sm font-semibold text-fg">{{ r.opponent?.name }}</span>
            <Badge :tone="r.record.result === 'WIN' ? 'acid' : 'ember'" :label="r.record.ourScore + ':' + r.record.oppScore" />
          </div>
          <p class="font-mono text-[10px] text-muted">{{ formatDate(r.scrim?.scheduledAt ?? '', true) }}</p>
        </button>
      </div>
    </BaseCard>

    <div v-if="selected" class="space-y-5 lg:col-span-2">
      <BaseCard title="赛后复盘" icon="📝" accent="acid">
        <template #actions>
          <Badge :tone="selected.record.result === 'WIN' ? 'acid' : 'ember'" :label="selected.record.result" />
        </template>
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-sm text-muted">
            <ClipboardList :size="14" /> vs {{ selected.opponent?.name }} · {{ formatDate(selected.scrim?.scheduledAt ?? '', true) }}
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="label">复盘教练</label><input v-model="coach" class="input" :disabled="!canEdit" /></div>
          </div>
          <div><label class="label">复盘笔记</label><textarea v-model="notes" class="input" rows="3" :disabled="!canEdit" /></div>
        </div>
      </BaseCard>

      <BaseCard title="队员表现评分" icon="⭐" accent="ember">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wider text-muted">
                <th class="pb-2 pr-3 font-semibold">选手</th>
                <th v-for="c in team.scoringCriteria" :key="c.id" class="pb-2 px-2 font-semibold">
                  {{ c.name }}<span class="ml-1 text-[9px] text-muted">×{{ c.weight }}</span>
                </th>
                <th class="pb-2 pl-2 font-semibold">均分</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pp in selected.record.players" :key="pp.id" class="border-t border-edge-soft/50">
                <td class="py-2 pr-3">
                  <div class="flex items-center gap-2">
                    <Avatar :text="team.playerById(pp.playerId)?.avatar ?? '?'" size="sm" tone="steel" />
                    <span class="text-fg">{{ team.playerById(pp.playerId)?.handle }}</span>
                  </div>
                </td>
                <td v-for="c in team.scoringCriteria" :key="c.id" class="py-2 px-2">
                  <input
                    v-model.number="scoreMap[pp.playerId][c.name]"
                    type="number" min="0" max="10" step="0.1"
                    class="w-16 rounded border border-edge bg-ink-800/70 px-2 py-1 font-mono text-xs text-acid outline-none focus:border-acid/50 disabled:opacity-50"
                    :disabled="!canEdit"
                  />
                </td>
                <td class="py-2 pl-2 font-display font-bold" :class="avg(pp.playerId) >= 8 ? 'text-acid' : avg(pp.playerId) >= 6 ? 'text-steel' : 'text-ember'">
                  {{ avg(pp.playerId) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="canEdit" class="mt-4 flex flex-wrap items-end gap-2 border-t border-edge pt-4">
          <div>
            <label class="label">新增评分标准</label>
            <input v-model="newCritName" class="input !py-1.5 text-xs" placeholder="如 心态稳定性" />
          </div>
          <div>
            <label class="label">权重</label>
            <input v-model.number="newCritWeight" type="number" class="input !w-20 !py-1.5 text-xs" />
          </div>
          <button class="btn-ghost" @click="addCrit"><Plus :size="13" /> 添加</button>
        </div>
      </BaseCard>

      <div v-if="canEdit" class="flex justify-end">
        <button class="btn-acid" @click="saveReview"><Save :size="15" /> 保存复盘</button>
      </div>
    </div>
    <EmptyState v-else title="选择一场训练赛进行复盘" />
  </div>
</template>
