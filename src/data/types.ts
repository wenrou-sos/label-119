// 数据类型定义 —— 镜像 PostgreSQL schema（见 TechnicalArchitecture.md §6 DDL）

export type Role = 'coach' | 'manager' | 'analyst' | 'player'
export type Position = 'top' | 'jng' | 'mid' | 'adc' | 'sup'
export type PlayerStatus = 'active' | 'benched' | 'training'
export type ContractStatus = 'active' | 'expiring' | 'expired'
export type ScrimStatus = 'pending' | 'confirmed' | 'done' | 'canceled'
export type MatchResult = 'WIN' | 'LOSS' | 'DRAW'
export type TaskType = 'scrim' | 'rank' | 'fitness' | 'psych' | 'media'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type TransferType = 'list' | 'trial' | 'renew' | 'negotiate'
export type TransferStatus = 'open' | 'trialing' | 'done' | 'failed'
export type HeroTier = 'S' | 'A' | 'B'

export interface Version {
  id: string
  code: string
  releaseDate: string
  isCurrent: boolean
}

export interface Hero {
  id: string
  name: string
  role: Position
  icon: string
}

export interface VersionHero {
  id: string
  versionId: string
  heroId: string
  tier: HeroTier
}

export interface Player {
  id: string
  handle: string
  realName: string
  age: number
  nationality: string
  countryCode: string
  latitude: number
  longitude: number
  position: Position
  joinDate: string
  status: PlayerStatus
  avatar: string
}

export interface PlayerHero {
  id: string
  playerId: string
  heroId: string
  mastery: number
}

export interface Contract {
  id: string
  playerId: string
  startDate: string
  endDate: string
  salaryMonthly: number
  bonus: number
  years: number
  transferClause: string
  buyout: number
  status: ContractStatus
}

export interface TrainingLog {
  id: string
  playerId: string
  logDate: string
  rankPoints: number
  rankGames: number
  scrimGames: number
}

export interface HeroWinrate {
  id: string
  playerId: string
  heroId: string
  opponentId: string
  wins: number
  games: number
}

export interface Opponent {
  id: string
  name: string
  region: string
  city: string
  latitude: number
  longitude: number
  contact: string
}

export interface Scrim {
  id: string
  opponentId: string
  scheduledAt: string
  status: ScrimStatus
  bo: number
}

export interface ScrimRecordPlayer {
  id: string
  playerId: string
  heroId: string
  kda: string
  performance: number
}

export interface ScrimRecord {
  id: string
  scrimId: string
  ourScore: number
  oppScore: number
  result: MatchResult
  notes: string
  players: ScrimRecordPlayer[]
}

export interface Review {
  id: string
  scrimRecordId: string
  coach: string
  notes: string
  createdAt: string
}

export interface PlayerScore {
  id: string
  reviewId: string
  playerId: string
  score: number
  criterion: string
}

export interface CalendarTask {
  id: string
  playerId: string
  title: string
  type: TaskType
  startAt: string
  endAt: string
  targetValue?: number
  currentValue?: number
  reminder: boolean
  remindAt?: string
  status: TaskStatus
}

export interface Transfer {
  id: string
  playerId: string
  type: TransferType
  status: TransferStatus
  askPrice: number
  city: string
  latitude: number
  longitude: number
}

export interface TransferLog {
  id: string
  transferId: string
  event: string
  amount?: number
  note: string
  createdAt: string
}

export interface ScoringCriterion {
  id: string
  name: string
  weight: number
}

export const POSITION_LABELS: Record<Position, string> = {
  top: '上单',
  jng: '打野',
  mid: '中单',
  adc: '下路',
  sup: '辅助',
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  scrim: '训练赛',
  rank: '个人Rank',
  fitness: '体能训练',
  psych: '心理辅导',
  media: '媒体/直播',
}

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  scrim: 'steel',
  rank: 'acid',
  fitness: 'ember',
  psych: 'violetx',
  media: '#f4c544',
}

export const ROLE_LABELS: Record<Role, string> = {
  coach: '教练组',
  manager: '管理层',
  analyst: '数据分析师',
  player: '选手',
}
