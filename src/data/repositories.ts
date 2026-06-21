import {
  calendarTasks,
  contracts,
  heroes,
  heroWinrates,
  opponents,
  playerHeroes,
  playerScores,
  players,
  reviews,
  scrimRecords,
  scrims,
  scoringCriteria,
  trainingLogs,
  transferLogs,
  transfers,
  version,
  versionHeroes,
} from './seed'
import type {
  CalendarTask,
  Contract,
  Hero,
  HeroWinrate,
  Opponent,
  Player,
  PlayerHero,
  PlayerScore,
  Review,
  ScoringCriterion,
  Scrim,
  ScrimRecord,
  TrainingLog,
  Transfer,
  TransferLog,
  Version,
  VersionHero,
} from './types'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`
const wait = (ms = 60) => new Promise<void>((r) => setTimeout(r, ms))

class MemoryRepository<T extends { id: string }> {
  protected items: T[]
  constructor(items: T[]) {
    this.items = clone(items)
  }
  async list(): Promise<T[]> {
    await wait()
    return clone(this.items)
  }
  async get(id: string): Promise<T | null> {
    await wait()
    return clone(this.items.find((i) => i.id === id) ?? null)
  }
  async create(data: Omit<T, 'id'> & Partial<Pick<T, 'id'>>): Promise<T> {
    await wait()
    const item = { ...(data as object), id: data.id ?? uid('x') } as T
    if (!item.id) item.id = uid('x')
    this.items.push(item)
    return clone(item)
  }
  async update(id: string, data: Partial<T>): Promise<T | null> {
    await wait()
    const idx = this.items.findIndex((i) => i.id === id)
    if (idx < 0) return null
    this.items[idx] = { ...this.items[idx], ...data, id }
    return clone(this.items[idx])
  }
  async remove(id: string): Promise<void> {
    await wait()
    const idx = this.items.findIndex((i) => i.id === id)
    if (idx >= 0) this.items.splice(idx, 1)
  }
}

export const playerRepo = new MemoryRepository<Player>(players)
export const playerHeroRepo = new MemoryRepository<PlayerHero>(playerHeroes)
export const contractRepo = new MemoryRepository<Contract>(contracts)
export const trainingLogRepo = new MemoryRepository<TrainingLog>(trainingLogs)
export const heroRepo = new MemoryRepository<Hero>(heroes)
export const versionHeroRepo = new MemoryRepository<VersionHero>(versionHeroes)
export const heroWinrateRepo = new MemoryRepository<HeroWinrate>(heroWinrates)
export const opponentRepo = new MemoryRepository<Opponent>(opponents)
export const scrimRepo = new MemoryRepository<Scrim>(scrims)
export const scrimRecordRepo = new MemoryRepository<ScrimRecord>(scrimRecords)
export const reviewRepo = new MemoryRepository<Review>(reviews)
export const playerScoreRepo = new MemoryRepository<PlayerScore>(playerScores)
export const calendarTaskRepo = new MemoryRepository<CalendarTask>(calendarTasks)
export const transferRepo = new MemoryRepository<Transfer>(transfers)
export const transferLogRepo = new MemoryRepository<TransferLog>(transferLogs)
export const scoringCriterionRepo =
  new MemoryRepository<ScoringCriterion>(scoringCriteria)

export const versionRepo = {
  async current(): Promise<Version> {
    await wait()
    return clone(version)
  },
}
