<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Trash2, Star } from 'lucide-vue-next'
import BaseCard from '@/components/BaseCard.vue'
import Badge from '@/components/Badge.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import Modal from '@/components/Modal.vue'
import HeroPoolChart from './HeroPoolChart.vue'
import { useTeamStore } from '@/stores/team'
import { usePermission } from '@/composables/usePermission'

const props = defineProps<{ playerId: string }>()
const team = useTeamStore()
const { canEdit } = usePermission()

const heroes = computed(() => team.heroesOfPlayer(props.playerId))
const versionHeroIds = computed(
  () => new Set(team.currentVersionHeroes.map((v) => v.heroId)),
)
const available = computed(
  () => team.heroes.filter((h) => !heroes.value.some((ph) => ph.heroId === h.id)),
)

const modalOpen = ref(false)
const newHeroId = ref('')
const newMastery = ref(60)

function openAdd() {
  newHeroId.value = available.value[0]?.id ?? ''
  newMastery.value = 60
  modalOpen.value = true
}
async function addHero() {
  if (!newHeroId.value) return
  await team.savePlayerHero({
    id: `ph_${Date.now()}`,
    playerId: props.playerId,
    heroId: newHeroId.value,
    mastery: newMastery.value,
  })
  modalOpen.value = false
}
async function setMastery(phId: string, v: number) {
  const ph = heroes.value.find((h) => h.id === phId)
  if (ph) await team.savePlayerHero({ ...ph, mastery: v })
}
async function removeHero(phId: string) {
  await team.removePlayerHero(phId)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
    <BaseCard title="英雄熟练度雷达" icon="🎯" accent="acid">
      <HeroPoolChart :heroes="heroes" />
    </BaseCard>

    <BaseCard title="英雄池明细" icon="♟️" accent="steel">
      <template #actions>
        <button v-if="canEdit" class="btn-acid !py-1.5 text-xs" @click="openAdd">
          <Plus :size="13" /> 添加英雄
        </button>
      </template>
      <div class="space-y-3">
        <div v-for="ph in heroes" :key="ph.id" class="rounded-md border border-edge bg-ink-800/40 p-3">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ ph.hero?.icon }}</span>
              <span class="font-semibold text-fg">{{ ph.hero?.name }}</span>
              <Badge v-if="versionHeroIds.has(ph.heroId)" tone="acid" label="版本强势" />
            </div>
            <div class="flex items-center gap-1">
              <span class="font-mono text-sm text-acid">{{ ph.mastery }}</span>
              <button v-if="canEdit" class="btn-ghost !p-1" @click="removeHero(ph.id)">
                <Trash2 :size="12" />
              </button>
            </div>
          </div>
          <input
            v-if="canEdit"
            type="range" min="0" max="100" :value="ph.mastery"
            class="w-full accent-[#b6ff3a]"
            @input="setMastery(ph.id, Number(($event.target as HTMLInputElement).value))"
          />
          <ProgressBar v-else :value="ph.mastery" :show-value="false" />
        </div>
        <p v-if="!heroes.length" class="py-6 text-center text-xs text-muted">暂无英雄池数据</p>
      </div>
    </BaseCard>

    <BaseCard title="掌握度概览" icon="📊" accent="ember" class="lg:col-span-2">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <p class="text-xs uppercase tracking-wider text-muted">英雄池深度</p>
          <p class="mt-1 font-display text-2xl font-bold text-acid">{{ heroes.length }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-muted">版本强势覆盖</p>
          <p class="mt-1 font-display text-2xl font-bold text-steel">
            {{ heroes.filter((h) => versionHeroIds.has(h.heroId)).length }}/{{ team.currentVersionHeroes.length }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-muted">平均熟练度</p>
          <p class="mt-1 font-display text-2xl font-bold text-fg">
            {{ heroes.length ? Math.round(heroes.reduce((s, h) => s + h.mastery, 0) / heroes.length) : 0 }}
          </p>
        </div>
      </div>
    </BaseCard>

    <Modal :open="modalOpen" title="添加英雄到英雄池" @close="modalOpen = false">
      <div class="space-y-4">
        <div>
          <label class="label">选择英雄</label>
          <select v-model="newHeroId" class="input">
            <option v-for="h in available" :key="h.id" :value="h.id">{{ h.icon }} {{ h.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">初始熟练度: {{ newMastery }}</label>
          <input v-model.number="newMastery" type="range" min="0" max="100" class="w-full accent-[#b6ff3a]" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="modalOpen = false">取消</button>
        <button class="btn-acid" @click="addHero"><Star :size="14" /> 确认添加</button>
      </template>
    </Modal>
  </div>
</template>
