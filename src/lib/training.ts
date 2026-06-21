import type { TrainingLog } from '@/data/types'

export const RANK_WEIGHT = 1
export const SCRIM_WEIGHT = 2.5

export function dailyLoad(l: TrainingLog) {
  return l.rankGames * RANK_WEIGHT + l.scrimGames * SCRIM_WEIGHT
}

export function formatDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function daysBetween(a: string, b: string) {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return Math.round((d2.getTime() - d1.getTime()) / 86400000)
}

export function buildLoadMap(logs: TrainingLog[]) {
  const map = new Map<string, TrainingLog>()
  for (const l of logs) map.set(l.logDate, l)
  return map
}

export function loadBuckets(maxLoad: number) {
  if (maxLoad <= 0) return [0, 1, 2, 3, 4]
  return [0, Math.round(maxLoad * 0.2), Math.round(maxLoad * 0.45), Math.round(maxLoad * 0.7), maxLoad + 1]
}

export function bucketIndex(load: number, buckets: number[]) {
  for (let i = 1; i < buckets.length; i++) {
    if (load < buckets[i]) return i - 1
  }
  return buckets.length - 2
}

export const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']
