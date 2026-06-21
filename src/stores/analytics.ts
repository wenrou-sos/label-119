import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { heroWinrateRepo } from '@/data/repositories'
import { useTeamStore } from './team'
import type { HeroWinrate } from '@/data/types'

export const useAnalyticsStore = defineStore('analytics', () => {
  const winrates = ref<HeroWinrate[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    winrates.value = await heroWinrateRepo.list()
    loaded.value = true
    loading.value = false
  }

  const team = useTeamStore()

  // 矩阵: 选手 × 英雄，对指定对手(默认全部)的胜率
  const matrix = computed(() => {
    const players = team.players
    const heroes = team.heroes
    const cells: {
      playerId: string
      heroId: string
      winrate: number
      games: number
    }[] = []
    for (const p of players) {
      for (const h of heroes) {
        const rel = winrates.value.filter(
          (w) => w.playerId === p.id && w.heroId === h.id,
        )
        const games = rel.reduce((s, w) => s + w.games, 0)
        const wins = rel.reduce((s, w) => s + w.wins, 0)
        const wr = games > 0 ? Math.round((wins / games) * 100) : 0
        cells.push({ playerId: p.id, heroId: h.id, winrate: wr, games })
      }
    }
    return cells
  })

  const maxCell = computed(() =>
    matrix.value.reduce((m, c) => (c.games > 0 && c.winrate > m.winrate ? c : m), {
      playerId: '',
      heroId: '',
      winrate: -1,
      games: 0,
    }),
  )
  const minCell = computed(() =>
    matrix.value
      .filter((c) => c.games > 0)
      .reduce((m, c) => (c.winrate < m.winrate ? c : m), {
        playerId: '',
        heroId: '',
        winrate: 101,
        games: 0,
      }),
  )

  // 版本英雄掌握度: 每位选手对当前版本强势英雄的熟练度
  const versionMastery = computed(() => {
    const vh = team.currentVersionHeroes
    const rows = vh.map((v) => {
      const perPlayer = team.players.map((p) => {
        const ph = team.playerHeroes.find(
          (x) => x.playerId === p.id && x.heroId === v.heroId,
        )
        return {
          player: p,
          mastery: ph ? ph.mastery : 0,
        }
      })
      return { versionHero: v, players: perPlayer }
    })
    return rows
  })

  return {
    winrates,
    loaded,
    loading,
    load,
    matrix,
    maxCell,
    minCell,
    versionMastery,
  }
})
