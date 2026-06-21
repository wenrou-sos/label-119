import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  contractRepo,
  heroRepo,
  playerHeroRepo,
  playerRepo,
  scoringCriterionRepo,
  trainingLogRepo,
  versionRepo,
  versionHeroRepo,
} from '@/data/repositories'
import type {
  Contract,
  Hero,
  Player,
  PlayerHero,
  ScoringCriterion,
  TrainingLog,
  Version,
  VersionHero,
} from '@/data/types'

export const useTeamStore = defineStore('team', () => {
  const players = ref<Player[]>([])
  const heroes = ref<Hero[]>([])
  const playerHeroes = ref<PlayerHero[]>([])
  const contracts = ref<Contract[]>([])
  const trainingLogs = ref<TrainingLog[]>([])
  const version = ref<Version | null>(null)
  const versionHeroes = ref<VersionHero[]>([])
  const scoringCriteria = ref<ScoringCriterion[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    const [p, h, ph, c, t, v, vh, sc] = await Promise.all([
      playerRepo.list(),
      heroRepo.list(),
      playerHeroRepo.list(),
      contractRepo.list(),
      trainingLogRepo.list(),
      versionRepo.current(),
      versionHeroRepo.list(),
      scoringCriterionRepo.list(),
    ])
    players.value = p
    heroes.value = h
    playerHeroes.value = ph
    contracts.value = c
    trainingLogs.value = t
    version.value = v
    versionHeroes.value = vh
    scoringCriteria.value = sc
    loaded.value = true
    loading.value = false
  }

  const heroById = computed(
    () => (id: string) => heroes.value.find((h) => h.id === id) ?? null,
  )
  const playerById = computed(
    () => (id: string) => players.value.find((p) => p.id === id) ?? null,
  )
  const contractByPlayer = computed(
    () => (playerId: string) =>
      contracts.value.find((c) => c.playerId === playerId) ?? null,
  )
  const heroesOfPlayer = computed(
    () => (playerId: string) =>
      playerHeroes.value
        .filter((ph) => ph.playerId === playerId)
        .map((ph) => ({
          ...ph,
          hero: heroById.value(ph.heroId),
        })),
  )
  const logsOfPlayer = computed(
    () => (playerId: string) =>
      trainingLogs.value
        .filter((l) => l.playerId === playerId)
        .sort((a, b) => a.logDate.localeCompare(b.logDate)),
  )
  const currentVersionHeroes = computed(() => {
    if (!version.value) return []
    return versionHeroes.value
      .filter((vh) => vh.versionId === version.value!.id)
      .map((vh) => ({
        ...vh,
        hero: heroById.value(vh.heroId),
      }))
  })

  async function savePlayer(p: Player) {
    const exists = players.value.some((x) => x.id === p.id)
    if (exists) {
      const updated = await playerRepo.update(p.id, p)
      if (updated) {
        const i = players.value.findIndex((x) => x.id === p.id)
        players.value[i] = updated
      }
    } else {
      const created = await playerRepo.create(p)
      players.value.push(created)
    }
  }
  async function removePlayer(id: string) {
    await playerRepo.remove(id)
    players.value = players.value.filter((p) => p.id !== id)
    contracts.value = contracts.value.filter((c) => c.playerId !== id)
    playerHeroes.value = playerHeroes.value.filter((ph) => ph.playerId !== id)
  }
  async function savePlayerHero(ph: PlayerHero) {
    const exists = playerHeroes.value.some((x) => x.id === ph.id)
    if (exists) {
      const updated = await playerHeroRepo.update(ph.id, ph)
      if (updated) {
        const i = playerHeroes.value.findIndex((x) => x.id === ph.id)
        playerHeroes.value[i] = updated
      }
    } else {
      const created = await playerHeroRepo.create(ph)
      playerHeroes.value.push(created)
    }
  }
  async function removePlayerHero(id: string) {
    await playerHeroRepo.remove(id)
    playerHeroes.value = playerHeroes.value.filter((ph) => ph.id !== id)
  }
  async function addCriterion(name: string, weight: number) {
    const created = await scoringCriterionRepo.create({ name, weight })
    scoringCriteria.value.push(created)
    return created
  }
  async function saveContract(c: Contract) {
    const exists = contracts.value.some((x) => x.id === c.id)
    if (exists) {
      const updated = await contractRepo.update(c.id, c)
      if (updated) {
        const i = contracts.value.findIndex((x) => x.id === c.id)
        contracts.value[i] = updated
      }
    } else {
      const created = await contractRepo.create(c)
      contracts.value.push(created)
    }
  }

  return {
    players,
    heroes,
    playerHeroes,
    contracts,
    trainingLogs,
    version,
    versionHeroes,
    scoringCriteria,
    loaded,
    loading,
    load,
    heroById,
    playerById,
    contractByPlayer,
    heroesOfPlayer,
    logsOfPlayer,
    currentVersionHeroes,
    savePlayer,
    removePlayer,
    savePlayerHero,
    removePlayerHero,
    addCriterion,
    saveContract,
  }
})
