import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  opponentRepo,
  playerScoreRepo,
  reviewRepo,
  scrimRecordRepo,
  scrimRepo,
} from '@/data/repositories'
import type {
  Opponent,
  PlayerScore,
  Review,
  Scrim,
  ScrimRecord,
  ScrimStatus,
} from '@/data/types'

export const useScrimsStore = defineStore('scrims', () => {
  const opponents = ref<Opponent[]>([])
  const scrims = ref<Scrim[]>([])
  const scrimRecords = ref<ScrimRecord[]>([])
  const reviews = ref<Review[]>([])
  const playerScores = ref<PlayerScore[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    const [o, s, sr, r, ps] = await Promise.all([
      opponentRepo.list(),
      scrimRepo.list(),
      scrimRecordRepo.list(),
      reviewRepo.list(),
      playerScoreRepo.list(),
    ])
    opponents.value = o
    scrims.value = s
    scrimRecords.value = sr
    reviews.value = r
    playerScores.value = ps
    loaded.value = true
    loading.value = false
  }

  const opponentById = computed(
    () => (id: string) => opponents.value.find((o) => o.id === id) ?? null,
  )
  const scrimById = computed(
    () => (id: string) => scrims.value.find((s) => s.id === id) ?? null,
  )
  const recordByScrim = computed(
    () => (scrimId: string) =>
      scrimRecords.value.find((r) => r.scrimId === scrimId) ?? null,
  )
  const reviewByRecord = computed(
    () => (recordId: string) =>
      reviews.value.find((r) => r.scrimRecordId === recordId) ?? null,
  )
  const scoresByReview = computed(
    () => (reviewId: string) =>
      playerScores.value.filter((s) => s.reviewId === reviewId),
  )

  const recentRecords = computed(() =>
    [...scrimRecords.value]
      .map((r) => ({
        record: r,
        scrim: scrimById.value(r.scrimId),
        opponent: r.scrimId
          ? opponentById.value(scrimById.value(r.scrimId)?.opponentId ?? '')
          : null,
      }))
      .filter((x) => x.scrim)
      .sort((a, b) =>
        (b.scrim?.scheduledAt ?? '').localeCompare(a.scrim?.scheduledAt ?? ''),
      ),
  )

  async function saveOpponent(o: Opponent) {
    const exists = o.id && opponents.value.some((x) => x.id === o.id)
    if (exists) {
      const updated = await opponentRepo.update(o.id, o)
      if (updated) {
        const i = opponents.value.findIndex((x) => x.id === o.id)
        opponents.value[i] = updated
      }
    } else {
      opponents.value.push(await opponentRepo.create(o))
    }
  }
  async function removeOpponent(id: string) {
    await opponentRepo.remove(id)
    opponents.value = opponents.value.filter((o) => o.id !== id)
  }
  async function requestScrim(opponentId: string, scheduledAt: string, bo: number) {
    const created = await scrimRepo.create({
      opponentId,
      scheduledAt,
      status: 'pending' as ScrimStatus,
      bo,
    } as Scrim)
    scrims.value.push(created)
    return created
  }
  async function setScrimStatus(id: string, status: ScrimStatus) {
    const updated = await scrimRepo.update(id, { status })
    if (updated) {
      const i = scrims.value.findIndex((s) => s.id === id)
      scrims.value[i] = updated
    }
  }
  async function saveScrimRecord(r: ScrimRecord) {
    const exists = r.id && scrimRecords.value.some((x) => x.id === r.id)
    if (exists) {
      const updated = await scrimRecordRepo.update(r.id, r)
      if (updated) {
        const i = scrimRecords.value.findIndex((x) => x.id === r.id)
        scrimRecords.value[i] = updated
      }
    } else {
      scrimRecords.value.push(await scrimRecordRepo.create(r))
    }
  }
  async function saveReview(review: Review, scores: PlayerScore[]) {
    const existing = reviewByRecord.value(review.scrimRecordId)
    if (existing) {
      const updated = await reviewRepo.update(existing.id, {
        notes: review.notes,
        coach: review.coach,
      })
      if (updated) {
        const i = reviews.value.findIndex((r) => r.id === existing.id)
        reviews.value[i] = updated
      }
      playerScores.value = playerScores.value.filter(
        (s) => s.reviewId !== existing.id,
      )
      for (const s of scores) {
        const created = await playerScoreRepo.create({ ...s, reviewId: existing.id })
        playerScores.value.push(created)
      }
    } else {
      const created = await reviewRepo.create(review)
      reviews.value.push(created)
      for (const s of scores) {
        const sc = await playerScoreRepo.create({ ...s, reviewId: created.id })
        playerScores.value.push(sc)
      }
    }
  }

  return {
    opponents,
    scrims,
    scrimRecords,
    reviews,
    playerScores,
    loaded,
    loading,
    load,
    opponentById,
    scrimById,
    recordByScrim,
    reviewByRecord,
    scoresByReview,
    recentRecords,
    saveOpponent,
    removeOpponent,
    requestScrim,
    setScrimStatus,
    saveScrimRecord,
    saveReview,
  }
})
