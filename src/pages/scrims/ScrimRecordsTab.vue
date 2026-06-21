<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, ChevronDown, Users } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import Avatar from '@/components/Avatar.vue'
import Modal from '@/components/Modal.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useScrimsStore } from '@/stores/scrims'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/lib/format'
import type { ScrimRecord, ScrimRecordPlayer, MatchResult } from '@/data/types'

const scrims = useScrimsStore()
const team = useTeamStore()
const { canEdit } = usePermission()

const expanded = ref<Set<string>>(new Set())
function toggle(id: string) {
  expanded.value.has(id) ? expanded.value.delete(id) : expanded.value.add(id)
  expanded.value = new Set(expanded.value)
}

const records = computed(() => scrims.recentRecords)

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref<ScrimRecord>(blankRecord())

function blankRecord(): ScrimRecord {
  return {
    id: '', scrimId: '', ourScore: 0, oppScore: 0, result: 'WIN', notes: '', players: [],
  }
}
const availableScrims = computed(
  () => scrims.scrims.filter((s) => s.status === 'confirmed' || s.status === 'done'),
)
function openNew() {
  editingId.value = null
  form.value = blankRecord()
  form.value.scrimId = availableScrims.value[0]?.id ?? ''
  syncPlayers()
  modalOpen.value = true
}
function openEdit(r: ScrimRecord) {
  editingId.value = r.id
  form.value = JSON.parse(JSON.stringify(r))
  modalOpen.value = true
}
function syncPlayers() {
  const starters = team.players.filter((p) => p.status === 'active').slice(0, 5)
  form.value.players = starters.map((p) => {
    const exist = form.value.players.find((pp) => pp.playerId === p.id)
    return (
      exist ?? {
        id: `srp_${Date.now()}_${p.id}`,
        playerId: p.id,
        heroId: team.heroes[0]?.id ?? '',
        kda: '0/0/0',
        performance: 70,
      }
    )
  })
}
function resultOf(): MatchResult {
  if (form.value.ourScore > form.value.oppScore) return 'WIN'
  if (form.value.ourScore < form.value.oppScore) return 'LOSS'
  return 'DRAW'
}
async function save() {
  form.value.result = resultOf()
  await scrims.saveScrimRecord({ ...form.value })
  if (form.value.scrimId) await scrims.setScrimStatus(form.value.scrimId, 'done')
  modalOpen.value = false
}
</script>

<template>
  <BaseCard title="训练赛记录" icon="📊" accent="steel">
    <template #actions>
      <button v-if="canEdit" class="btn-acid !py-1.5 text-xs" @click="openNew">
        <Plus :size="13" /> 录入结果
      </button>
    </template>
    <div v-if="records.length" class="space-y-2">
      <div v-for="r in records" :key="r.record.id" class="rounded-md border border-edge bg-ink-800/40">
        <button class="flex w-full items-center gap-3 p-3 text-left" @click="toggle(r.record.id)">
          <Badge :tone="r.record.result === 'WIN' ? 'acid' : r.record.result === 'LOSS' ? 'ember' : 'muted'" :label="r.record.result" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-fg">vs {{ r.opponent?.name }}</p>
            <p class="font-mono text-[11px] text-muted">{{ formatDate(r.scrim?.scheduledAt ?? '', true) }} · BO{{ r.scrim?.bo }}</p>
          </div>
          <span class="font-display text-xl font-bold" :class="r.record.result === 'WIN' ? 'text-acid' : 'text-ember'">
            {{ r.record.ourScore }}:{{ r.record.oppScore }}
          </span>
          <ChevronDown :size="16" class="text-muted transition" :class="expanded.has(r.record.id) ? 'rotate-180' : ''" />
        </button>
        <div v-if="expanded.has(r.record.id)" class="border-t border-edge p-3">
          <p v-if="r.record.notes" class="mb-3 rounded-md bg-ink-800/60 p-2 text-sm text-muted">📝 {{ r.record.notes }}</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs uppercase tracking-wider text-muted">
                  <th class="pb-2 pr-3 font-semibold">选手</th>
                  <th class="pb-2 pr-3 font-semibold">英雄</th>
                  <th class="pb-2 pr-3 font-semibold">KDA</th>
                  <th class="pb-2 pr-3 font-semibold">表现</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pp in r.record.players" :key="pp.id" class="border-t border-edge-soft/50">
                  <td class="py-2 pr-3">
                    <div class="flex items-center gap-2">
                      <Avatar :text="team.playerById(pp.playerId)?.avatar ?? '?'" size="sm" tone="steel" />
                      <span class="text-fg">{{ team.playerById(pp.playerId)?.handle }}</span>
                    </div>
                  </td>
                  <td class="py-2 pr-3 text-muted">{{ team.heroById(pp.heroId)?.name }}</td>
                  <td class="py-2 pr-3 font-mono text-muted">{{ pp.kda }}</td>
                  <td class="py-2 pr-3 font-mono" :class="pp.performance >= 80 ? 'text-acid' : pp.performance >= 60 ? 'text-steel' : 'text-ember'">{{ pp.performance }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else title="暂无训练赛记录" desc="录入第一场训练赛结果" />
  </BaseCard>

  <Modal :open="modalOpen" :title="editingId ? '编辑训练赛记录' : '录入训练赛结果'" width="max-w-2xl" @close="modalOpen = false">
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-3 sm:col-span-1">
          <label class="label">训练赛</label>
          <select v-model="form.scrimId" class="input" @change="syncPlayers">
            <option v-for="s in availableScrims" :key="s.id" :value="s.id">
              vs {{ scrims.opponentById(s.opponentId)?.name }}
            </option>
          </select>
        </div>
        <div><label class="label">我方比分</label><input v-model.number="form.ourScore" type="number" class="input" /></div>
        <div><label class="label">对手比分</label><input v-model.number="form.oppScore" type="number" class="input" /></div>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="text-muted">结果判定：</span>
        <Badge :tone="resultOf() === 'WIN' ? 'acid' : resultOf() === 'LOSS' ? 'ember' : 'muted'" :label="resultOf()" />
      </div>
      <div>
        <label class="label">选手表现 <Users :size="12" class="inline" /></label>
        <div class="space-y-2">
          <div v-for="(pp, idx) in form.players" :key="pp.id" class="grid grid-cols-12 items-center gap-2">
            <span class="col-span-3 truncate text-sm text-fg">{{ team.playerById(pp.playerId)?.handle }}</span>
            <select v-model="form.players[idx].heroId" class="input col-span-4 !py-1.5 text-xs">
              <option v-for="h in team.heroes" :key="h.id" :value="h.id">{{ h.icon }} {{ h.name }}</option>
            </select>
            <input v-model="form.players[idx].kda" class="input col-span-3 !py-1.5 font-mono text-xs" placeholder="0/0/0" />
            <input v-model.number="form.players[idx].performance" type="number" min="0" max="100" class="input col-span-2 !py-1.5 text-xs" />
          </div>
        </div>
      </div>
      <div><label class="label">复盘备注</label><textarea v-model="form.notes" class="input" rows="2" /></div>
    </div>
    <template #footer>
      <button class="btn-ghost" @click="modalOpen = false">取消</button>
      <button class="btn-acid" @click="save">保存记录</button>
    </template>
  </Modal>
</template>
