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

const pad = (n: number) => String(n).padStart(2, '0')
const d = (dt: Date) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
const dt = (dt: Date) =>
  `${d(dt)}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`
const dayOffset = (n: number) => {
  const t = new Date()
  t.setHours(12, 0, 0, 0)
  t.setDate(t.getDate() + n)
  return t
}

export const version: Version = {
  id: 'v1',
  code: '14.10',
  releaseDate: '2026-05-20',
  isCurrent: true,
}

export const heroes: Hero[] = [
  { id: 'h1', name: 'Aatrox', role: 'top', icon: '⚔️' },
  { id: 'h2', name: 'Gnar', role: 'top', icon: '🦔' },
  { id: 'h3', name: 'Camille', role: 'top', icon: '🤖' },
  { id: 'h4', name: 'Lee Sin', role: 'jng', icon: '🥋' },
  { id: 'h5', name: 'Viego', role: 'jng', icon: '👑' },
  { id: 'h6', name: 'Sejuani', role: 'jng', icon: '🐗' },
  { id: 'h7', name: 'Azir', role: 'mid', icon: '🌅' },
  { id: 'h8', name: 'Akali', role: 'mid', icon: '🍥' },
  { id: 'h9', name: 'Sylas', role: 'mid', icon: '⛓️' },
  { id: 'h10', name: 'Jinx', role: 'adc', icon: '🔫' },
  { id: 'h11', name: 'Aphelios', role: 'adc', icon: '🌙' },
  { id: 'h12', name: "Kai'Sa", role: 'adc', icon: '🛸' },
  { id: 'h13', name: 'Thresh', role: 'sup', icon: '⛓️' },
  { id: 'h14', name: 'Nautilus', role: 'sup', icon: '⚓' },
  { id: 'h15', name: 'Leona', role: 'sup', icon: '☀️' },
]

export const versionHeroes: VersionHero[] = [
  { id: 'vh1', versionId: 'v1', heroId: 'h1', tier: 'S' },
  { id: 'vh2', versionId: 'v1', heroId: 'h4', tier: 'S' },
  { id: 'vh3', versionId: 'v1', heroId: 'h7', tier: 'S' },
  { id: 'vh4', versionId: 'v1', heroId: 'h10', tier: 'S' },
  { id: 'vh5', versionId: 'v1', heroId: 'h13', tier: 'S' },
  { id: 'vh6', versionId: 'v1', heroId: 'h5', tier: 'A' },
  { id: 'vh7', versionId: 'v1', heroId: 'h8', tier: 'A' },
  { id: 'vh8', versionId: 'v1', heroId: 'h11', tier: 'A' },
  { id: 'vh9', versionId: 'v1', heroId: 'h9', tier: 'B' },
  { id: 'vh10', versionId: 'v1', heroId: 'h15', tier: 'B' },
]

export const players: Player[] = [
  {
    id: 'p1',
    handle: 'Kaiser',
    realName: 'Lukas Brandt',
    age: 22,
    nationality: '德国',
    countryCode: 'DE',
    latitude: 52.52,
    longitude: 13.405,
    position: 'top',
    joinDate: '2024-11-01',
    status: 'active',
    avatar: 'K',
  },
  {
    id: 'p2',
    handle: 'Vortex',
    realName: '陈昊',
    age: 21,
    nationality: '中国',
    countryCode: 'CN',
    latitude: 31.23,
    longitude: 121.47,
    position: 'jng',
    joinDate: '2023-06-15',
    status: 'active',
    avatar: 'V',
  },
  {
    id: 'p3',
    handle: 'Lumen',
    realName: 'Park Ji-hoon',
    age: 23,
    nationality: '韩国',
    countryCode: 'KR',
    latitude: 37.55,
    longitude: 126.97,
    position: 'mid',
    joinDate: '2022-01-10',
    status: 'active',
    avatar: 'L',
  },
  {
    id: 'p4',
    handle: 'Echo',
    realName: 'Marcus Lee',
    age: 20,
    nationality: '美国',
    countryCode: 'US',
    latitude: 34.05,
    longitude: -118.24,
    position: 'adc',
    joinDate: '2024-03-01',
    status: 'active',
    avatar: 'E',
  },
  {
    id: 'p5',
    handle: 'Sage',
    realName: '林俊宏',
    age: 24,
    nationality: '中国台湾',
    countryCode: 'TW',
    latitude: 25.03,
    longitude: 121.56,
    position: 'sup',
    joinDate: '2023-09-01',
    status: 'active',
    avatar: 'S',
  },
  {
    id: 'p6',
    handle: 'Phantom',
    realName: '周洋',
    age: 19,
    nationality: '中国',
    countryCode: 'CN',
    latitude: 30.67,
    longitude: 104.06,
    position: 'mid',
    joinDate: '2025-02-01',
    status: 'training',
    avatar: 'P',
  },
]

export const playerHeroes: PlayerHero[] = [
  { id: 'ph1', playerId: 'p1', heroId: 'h1', mastery: 92 },
  { id: 'ph2', playerId: 'p1', heroId: 'h2', mastery: 78 },
  { id: 'ph3', playerId: 'p1', heroId: 'h3', mastery: 65 },
  { id: 'ph4', playerId: 'p2', heroId: 'h4', mastery: 88 },
  { id: 'ph5', playerId: 'p2', heroId: 'h5', mastery: 81 },
  { id: 'ph6', playerId: 'p2', heroId: 'h6', mastery: 70 },
  { id: 'ph7', playerId: 'p3', heroId: 'h7', mastery: 95 },
  { id: 'ph8', playerId: 'p3', heroId: 'h8', mastery: 74 },
  { id: 'ph9', playerId: 'p3', heroId: 'h9', mastery: 68 },
  { id: 'ph10', playerId: 'p4', heroId: 'h10', mastery: 90 },
  { id: 'ph11', playerId: 'p4', heroId: 'h11', mastery: 72 },
  { id: 'ph12', playerId: 'p4', heroId: 'h12', mastery: 83 },
  { id: 'ph13', playerId: 'p5', heroId: 'h13', mastery: 87 },
  { id: 'ph14', playerId: 'p5', heroId: 'h14', mastery: 79 },
  { id: 'ph15', playerId: 'p5', heroId: 'h15', mastery: 63 },
  { id: 'ph16', playerId: 'p6', heroId: 'h7', mastery: 58 },
  { id: 'ph17', playerId: 'p6', heroId: 'h8', mastery: 64 },
  { id: 'ph18', playerId: 'p6', heroId: 'h9', mastery: 49 },
]

export const contracts: Contract[] = [
  {
    id: 'c1',
    playerId: 'p1',
    startDate: '2024-11-01',
    endDate: '2026-11-01',
    salaryMonthly: 42000,
    bonus: 8000,
    years: 2,
    transferClause: '可于窗口期挂牌，需提前30天通知',
    buyout: 1200000,
    status: 'active',
  },
  {
    id: 'c2',
    playerId: 'p2',
    startDate: '2023-06-15',
    endDate: '2026-07-10',
    salaryMonthly: 38000,
    bonus: 7000,
    years: 3,
    transferClause: '违约金条款触发即可解约',
    buyout: 980000,
    status: 'expiring',
  },
  {
    id: 'c3',
    playerId: 'p3',
    startDate: '2022-01-10',
    endDate: '2027-01-10',
    salaryMonthly: 55000,
    bonus: 12000,
    years: 5,
    transferClause: '核心选手保护，转会需董事会批准',
    buyout: 2500000,
    status: 'active',
  },
  {
    id: 'c4',
    playerId: 'p4',
    startDate: '2024-03-01',
    endDate: '2026-09-15',
    salaryMonthly: 30000,
    bonus: 5000,
    years: 2,
    transferClause: '次级联赛可外租',
    buyout: 600000,
    status: 'expiring',
  },
  {
    id: 'c5',
    playerId: 'p5',
    startDate: '2023-09-01',
    endDate: '2026-08-30',
    salaryMonthly: 33000,
    bonus: 6000,
    years: 3,
    transferClause: '辅助位可互换',
    buyout: 720000,
    status: 'expiring',
  },
  {
    id: 'c6',
    playerId: 'p6',
    startDate: '2025-02-01',
    endDate: '2028-02-01',
    salaryMonthly: 18000,
    bonus: 3000,
    years: 3,
    transferClause: '青训提拔，试用期6个月',
    buyout: 250000,
    status: 'active',
  },
]

function genTrainingLogs(): TrainingLog[] {
  const logs: TrainingLog[] = []
  let id = 1
  for (const p of players) {
    for (let i = 13; i >= 0; i--) {
      const date = d(dayOffset(-i))
      const base = p.status === 'training' ? 0.7 : 1
      logs.push({
        id: `t${id++}`,
        playerId: p.id,
        logDate: date,
        rankPoints: Math.round((40 + Math.random() * 60) * base),
        rankGames: Math.round((6 + Math.random() * 10) * base),
        scrimGames: Math.round(Math.random() * 6),
      })
    }
  }
  return logs
}
export const trainingLogs: TrainingLog[] = genTrainingLogs()

export const opponents: Opponent[] = [
  {
    id: 'o1',
    name: 'DragonX',
    region: 'LCK',
    city: '首尔',
    latitude: 37.55,
    longitude: 126.97,
    contact: 'coach@dragonx.kr',
  },
  {
    id: 'o2',
    name: 'Titan Esports',
    region: 'LPL',
    city: '上海',
    latitude: 31.23,
    longitude: 121.47,
    contact: 'mgmt@titan.cn',
  },
  {
    id: 'o3',
    name: 'Nordic Wolves',
    region: 'LEC',
    city: '柏林',
    latitude: 52.52,
    longitude: 13.405,
    contact: 'ops@nordicw.de',
  },
  {
    id: 'o4',
    name: 'Solaris',
    region: 'LCS',
    city: '洛杉矶',
    latitude: 34.05,
    longitude: -118.24,
    contact: 'admin@solaris.gg',
  },
  {
    id: 'o5',
    name: 'Rising Sun',
    region: 'LJL',
    city: '东京',
    latitude: 35.68,
    longitude: 139.69,
    contact: 'team@risingsun.jp',
  },
  {
    id: 'o6',
    name: 'Crimson Hawk',
    region: 'VCS',
    city: '河内',
    latitude: 21.03,
    longitude: 105.85,
    contact: 'hc@crimsonhawk.vn',
  },
]

export const scrims: Scrim[] = [
  {
    id: 's1',
    opponentId: 'o1',
    scheduledAt: dt(dayOffset(-2)),
    status: 'done',
    bo: 3,
  },
  {
    id: 's2',
    opponentId: 'o3',
    scheduledAt: dt(dayOffset(-5)),
    status: 'done',
    bo: 5,
  },
  {
    id: 's3',
    opponentId: 'o2',
    scheduledAt: dt(dayOffset(2)),
    status: 'confirmed',
    bo: 3,
  },
  {
    id: 's4',
    opponentId: 'o4',
    scheduledAt: dt(dayOffset(5)),
    status: 'pending',
    bo: 5,
  },
  {
    id: 's5',
    opponentId: 'o5',
    scheduledAt: dt(dayOffset(-9)),
    status: 'done',
    bo: 3,
  },
]

export const scrimRecords: ScrimRecord[] = [
  {
    id: 'sr1',
    scrimId: 's1',
    ourScore: 2,
    oppScore: 1,
    result: 'WIN',
    notes: '中野联动出色，下路后期接管比赛。',
    players: [
      { id: 'srp1', playerId: 'p1', heroId: 'h1', kda: '3/1/8', performance: 86 },
      { id: 'srp2', playerId: 'p2', heroId: 'h4', kda: '5/2/12', performance: 91 },
      { id: 'srp3', playerId: 'p3', heroId: 'h7', kda: '4/1/10', performance: 88 },
      { id: 'srp4', playerId: 'p4', heroId: 'h10', kda: '8/3/6', performance: 84 },
      { id: 'srp5', playerId: 'p5', heroId: 'h13', kda: '1/2/15', performance: 80 },
    ],
  },
  {
    id: 'sr2',
    scrimId: 's2',
    ourScore: 2,
    oppScore: 3,
    result: 'LOSS',
    notes: '前三局节奏落后，BP 需调整；后期翻盘未果。',
    players: [
      { id: 'srp6', playerId: 'p1', heroId: 'h2', kda: '2/4/5', performance: 68 },
      { id: 'srp7', playerId: 'p2', heroId: 'h5', kda: '3/5/8', performance: 64 },
      { id: 'srp8', playerId: 'p3', heroId: 'h8', kda: '6/4/4', performance: 75 },
      { id: 'srp9', playerId: 'p4', heroId: 'h11', kda: '4/5/3', performance: 60 },
      { id: 'srp10', playerId: 'p5', heroId: 'h14', kda: '0/6/9', performance: 58 },
    ],
  },
  {
    id: 'sr3',
    scrimId: 's5',
    ourScore: 2,
    oppScore: 0,
    result: 'WIN',
    notes: '前期滚雪球，节奏完美压制。',
    players: [
      { id: 'srp11', playerId: 'p1', heroId: 'h3', kda: '4/0/7', performance: 90 },
      { id: 'srp12', playerId: 'p2', heroId: 'h6', kda: '3/1/11', performance: 85 },
      { id: 'srp13', playerId: 'p3', heroId: 'h9', kda: '7/1/6', performance: 92 },
      { id: 'srp14', playerId: 'p4', heroId: 'h12', kda: '6/2/5', performance: 81 },
      { id: 'srp15', playerId: 'p5', heroId: 'h15', kda: '1/1/14', performance: 78 },
    ],
  },
]

export const reviews: Review[] = [
  {
    id: 'r1',
    scrimRecordId: 'sr1',
    coach: 'Coach Ray',
    notes:
      '团队执行到位，中野节奏建立快。建议加强小龙团战视野布置；下路团战走位可再前压。',
    createdAt: dt(dayOffset(-2)),
  },
  {
    id: 'r2',
    scrimRecordId: 'sr2',
    coach: 'Coach Ray',
    notes:
      'BP 被针对导致前期劣势，需扩充英雄池。辅助视野覆盖率偏低，需复盘插眼路线。',
    createdAt: dt(dayOffset(-5)),
  },
  {
    id: 'r3',
    scrimRecordId: 'sr3',
    coach: 'Coach Ray',
    notes: '节奏完美，保持状态。注意 20 分钟后大龙区视野冗余。',
    createdAt: dt(dayOffset(-9)),
  },
]

export const scoringCriteria: ScoringCriterion[] = [
  { id: 'sc1', name: '对线能力', weight: 20 },
  { id: 'sc2', name: '团战发挥', weight: 25 },
  { id: 'sc3', name: '地图意识', weight: 20 },
  { id: 'sc4', name: '英雄池深度', weight: 15 },
  { id: 'sc5', name: '沟通配合', weight: 20 },
]

export const playerScores: PlayerScore[] = [
  { id: 'ps1', reviewId: 'r1', playerId: 'p1', score: 8.5, criterion: '对线能力' },
  { id: 'ps2', reviewId: 'r1', playerId: 'p2', score: 9.2, criterion: '团战发挥' },
  { id: 'ps3', reviewId: 'r1', playerId: 'p3', score: 8.8, criterion: '地图意识' },
  { id: 'ps4', reviewId: 'r1', playerId: 'p4', score: 8.4, criterion: '团战发挥' },
  { id: 'ps5', reviewId: 'r1', playerId: 'p5', score: 8.0, criterion: '沟通配合' },
  { id: 'ps6', reviewId: 'r2', playerId: 'p3', score: 7.5, criterion: '英雄池深度' },
  { id: 'ps7', reviewId: 'r2', playerId: 'p5', score: 5.8, criterion: '地图意识' },
  { id: 'ps8', reviewId: 'r2', playerId: 'p4', score: 6.0, criterion: '团战发挥' },
  { id: 'ps9', reviewId: 'r3', playerId: 'p3', score: 9.2, criterion: '英雄池深度' },
  { id: 'ps10', reviewId: 'r3', playerId: 'p1', score: 9.0, criterion: '对线能力' },
]

function genWinrates(): HeroWinrate[] {
  const wr: HeroWinrate[] = []
  let id = 1
  for (const ph of playerHeroes) {
    for (const opp of opponents.slice(0, 4)) {
      const games = 4 + Math.floor(Math.random() * 8)
      const wins = Math.floor(Math.random() * (games + 1))
      wr.push({
        id: `wr${id++}`,
        playerId: ph.playerId,
        heroId: ph.heroId,
        opponentId: opp.id,
        wins,
        games,
      })
    }
  }
  return wr
}
export const heroWinrates: HeroWinrate[] = genWinrates()

function genCalendarTasks(): CalendarTask[] {
  const tasks: CalendarTask[] = []
  let id = 1
  const mk = (
    playerId: string,
    title: string,
    type: CalendarTask['type'],
    off: number,
    hour = 14,
    dur = 2,
    extra: Partial<CalendarTask> = {},
  ): CalendarTask => {
    const start = dayOffset(off)
    start.setHours(hour, 0, 0, 0)
    const end = dayOffset(off)
    end.setHours(hour + dur, 0, 0, 0)
    return {
      id: `ct${id++}`,
      playerId,
      title,
      type,
      startAt: dt(start),
      endAt: dt(end),
      reminder: false,
      status: 'todo',
      ...extra,
    }
  }
  // 训练赛（全队）
  tasks.push(mk('p3', 'vs DragonX 训练赛', 'scrim', 2, 19, 3, { status: 'todo', reminder: true }))
  tasks.push(mk('p3', 'vs Solaris 训练赛', 'scrim', 5, 19, 3, { status: 'todo' }))
  // 个人 Rank 任务（带进度）
  tasks.push(
    mk('p2', '本月王者目标 1000 分', 'rank', 0, 0, 0, {
      targetValue: 1000,
      currentValue: 640,
      status: 'doing',
      reminder: true,
      startAt: dt(dayOffset(-8)),
      endAt: dt(dayOffset(22)),
    }),
  )
  tasks.push(
    mk('p4', '本月冲分 800 分', 'rank', 0, 0, 0, {
      targetValue: 800,
      currentValue: 720,
      status: 'doing',
      startAt: dt(dayOffset(-8)),
      endAt: dt(dayOffset(22)),
    }),
  )
  tasks.push(mk('p2', '每日 Rank 训练', 'rank', 1, 20, 3, { status: 'todo' }))
  // 体能
  tasks.push(mk('p1', '体能训练 - 力量', 'fitness', 1, 10, 1, { status: 'todo' }))
  tasks.push(mk('p4', '体能训练 - 反应力', 'fitness', 3, 10, 1, { status: 'todo' }))
  // 心理
  tasks.push(mk('p5', '心理辅导 session', 'psych', 4, 16, 1, { status: 'todo', reminder: true }))
  // 媒体
  tasks.push(mk('p3', '直播通告 - 19:00', 'media', 6, 19, 2, { status: 'todo', reminder: true }))
  tasks.push(mk('p1', '媒体采访', 'media', -2, 15, 1, { status: 'done' }))
  // 今天
  tasks.push(mk('p2', '复盘会议', 'scrim', 0, 16, 1, { status: 'todo', reminder: true }))
  tasks.push(mk('p3', '每日 Rank 训练', 'rank', 0, 21, 3, { status: 'todo' }))
  return tasks
}
export const calendarTasks: CalendarTask[] = genCalendarTasks()

export const transfers: Transfer[] = [
  {
    id: 'tf1',
    playerId: 'p6',
    type: 'list',
    status: 'open',
    askPrice: 250000,
    city: '成都',
    latitude: 30.67,
    longitude: 104.06,
  },
  {
    id: 'tf2',
    playerId: 'p4',
    type: 'trial',
    status: 'trialing',
    askPrice: 600000,
    city: '上海',
    latitude: 31.23,
    longitude: 121.47,
  },
  {
    id: 'tf3',
    playerId: 'p2',
    type: 'negotiate',
    status: 'open',
    askPrice: 980000,
    city: '首尔',
    latitude: 37.55,
    longitude: 126.97,
  },
]

export const transferLogs: TransferLog[] = [
  {
    id: 'tl1',
    transferId: 'tf1',
    event: '挂牌',
    amount: 250000,
    note: '青训选手挂牌，寻找租借机会',
    createdAt: dt(dayOffset(-3)),
  },
  {
    id: 'tl2',
    transferId: 'tf2',
    event: '试训安排',
    note: '安排 3 天试训，考察适配性',
    createdAt: dt(dayOffset(-1)),
  },
  {
    id: 'tl3',
    transferId: 'tf3',
    event: '报价',
    amount: 800000,
    note: '对方初步报价 80 万，低于违约金',
    createdAt: dt(dayOffset(-4)),
  },
  {
    id: 'tl4',
    transferId: 'tf3',
    event: '还价',
    amount: 980000,
    note: '我方坚持违约金金额',
    createdAt: dt(dayOffset(-1)),
  },
]
