import type {
  Activity,
  ClosedPosition,
  LeaderboardEntry,
  PnlPoint,
  Position,
} from '../types'
import { categorize } from './categories'

/*
 * Polymarket data caveats this module works around:
 *  - `/positions` mixes live and long-resolved holdings; summing its cashPnl
 *    is meaningless. We only use it for live open exposure.
 *  - `/closed-positions` returns only the trader's redeemed *winning* bets,
 *    so it cannot give a win rate — only "biggest win" highlights.
 *  - The reliable PnL signal is the `user-pnl` time series.
 */

export interface CategoryStat {
  category: string
  count: number
  volume: number
}

export interface TraderProfile {
  address: string
  name: string
  pseudonym: string
  profileImage: string
  rank: number | null
}

export interface TraderMetrics {
  totalPnl: number
  pnl30d: number
  seriesMax: number
  seriesMin: number
  belowPeakPct: number // how far current PnL sits below the all-time peak
  maxDrawdown: number // largest peak-to-trough drop, in $
  portfolioValue: number
  volume: number
  marketsTraded: number
  tradesCount: number
  biggestWin: ClosedPosition | null
  lastTradeAt: number | null
  firstActivity: number | null
  activeDays: number
  tradeCategories: CategoryStat[] // what the trader bets on, by volume
}

export interface RawTraderData {
  address: string
  positions: Position[]
  closedPositions: ClosedPosition[]
  activity: Activity[]
  pnlSeries: PnlPoint[]
  portfolioValue: number
  marketsTraded: number
  leaderboard: LeaderboardEntry | null
}

export interface TraderData {
  profile: TraderProfile
  metrics: TraderMetrics
  pnlSeries: PnlPoint[]
  positions: Position[]
  closedPositions: ClosedPosition[]
  activity: Activity[]
}

export function buildTraderData(raw: RawTraderData): TraderData {
  const { positions, closedPositions, activity, pnlSeries, leaderboard } = raw

  // ---- profile ----
  const sample = activity[0]
  const profile: TraderProfile = {
    address: raw.address,
    name: leaderboard?.userName || sample?.name || shortAddr(raw.address),
    pseudonym: sample?.pseudonym || '',
    profileImage: leaderboard?.profileImage || sample?.profileImage || '',
    rank: leaderboard ? Number(leaderboard.rank) : null,
  }

  // ---- pnl series (the reliable profit signal) ----
  const ps = pnlSeries.map((p) => p.p)
  const totalPnl = ps.length ? ps[ps.length - 1] : 0
  const seriesMax = ps.length ? Math.max(...ps) : 0
  const seriesMin = ps.length ? Math.min(...ps) : 0
  const back30 = ps.length ? ps[Math.max(0, ps.length - 31)] : 0
  const pnl30d = ps.length ? totalPnl - back30 : 0
  const belowPeakPct =
    seriesMax > 0 ? Math.max(0, ((seriesMax - totalPnl) / seriesMax) * 100) : 0
  const maxDrawdown = computeMaxDrawdown(ps)

  // ---- volume ----
  const activityVolume = activity.reduce((s, a) => s + (a.usdcSize || 0), 0)
  const volume = leaderboard?.vol ?? activityVolume

  // ---- biggest redeemed win ----
  const biggestWin = closedPositions.reduce<ClosedPosition | null>(
    (best, p) => (!best || p.realizedPnl > best.realizedPnl ? p : best),
    null,
  )

  // ---- activity timing ----
  const lastTradeAt = activity.length
    ? Math.max(...activity.map((a) => a.timestamp))
    : null
  const firstActivity = pnlSeries.length ? pnlSeries[0].t : null
  const activeDays = firstActivity
    ? Math.max(1, Math.round((Date.now() / 1000 - firstActivity) / 86_400))
    : 0

  // ---- what they bet on, by traded volume ----
  const tradeCategories = buildCategories(activity)

  const metrics: TraderMetrics = {
    totalPnl,
    pnl30d,
    seriesMax,
    seriesMin,
    belowPeakPct,
    maxDrawdown,
    portfolioValue: raw.portfolioValue,
    volume,
    marketsTraded: raw.marketsTraded,
    tradesCount: activity.length,
    biggestWin,
    lastTradeAt,
    firstActivity,
    activeDays,
    tradeCategories,
  }

  return {
    profile,
    metrics,
    pnlSeries,
    positions,
    closedPositions,
    activity,
  }
}

function buildCategories(activity: Activity[]): CategoryStat[] {
  const map = new Map<string, CategoryStat>()
  for (const a of activity) {
    const cat = categorize(a.slug, a.title)
    const cur = map.get(cat) ?? { category: cat, count: 0, volume: 0 }
    cur.count += 1
    cur.volume += a.usdcSize || 0
    map.set(cat, cur)
  }
  return [...map.values()].sort((a, b) => b.volume - a.volume)
}

/** Largest peak-to-trough drop of the series, in absolute $. */
function computeMaxDrawdown(series: number[]): number {
  let peak = -Infinity
  let maxDd = 0
  for (const v of series) {
    if (v > peak) peak = v
    const dd = peak - v
    if (dd > maxDd) maxDd = dd
  }
  return Number.isFinite(maxDd) ? maxDd : 0
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
