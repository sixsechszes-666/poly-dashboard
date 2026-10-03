import type {
  Activity,
  ClosedPosition,
  LeaderboardEntry,
  PnlPoint,
  Position,
  ProfileSearchResult,
} from '../types'

// Публичные API Polymarket отдают CORS-заголовок *, поэтому зовём напрямую:
// так приложение работает и локально, и со статичного хостинга.
const DATA = 'https://data-api.polymarket.com'
const GAMMA = 'https://gamma-api.polymarket.com'
const PNL = 'https://user-pnl-api.polymarket.com'

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${url}`)
  }
  return (await res.json()) as T
}

export const api = {
  leaderboard: (params = 'window=all&limit=20&orderBy=pnl') =>
    get<LeaderboardEntry[]>(`${DATA}/v1/leaderboard?${params}`),

  positions: (addr: string) =>
    get<Position[]>(
      `${DATA}/positions?user=${addr}&limit=500&sortBy=CURRENT&sortDirection=DESC`,
    ),

  closedPositions: (addr: string) =>
    get<ClosedPosition[]>(`${DATA}/closed-positions?user=${addr}&limit=500`),

  activity: (addr: string, limit = 500) =>
    get<Activity[]>(`${DATA}/activity?user=${addr}&limit=${limit}&type=TRADE`),

  value: (addr: string) =>
    get<{ user: string; value: number }[]>(`${DATA}/value?user=${addr}`),

  traded: (addr: string) =>
    get<{ user: string; traded: number }>(`${DATA}/traded?user=${addr}`),

  pnl: (addr: string, interval = 'all', fidelity = '1d') =>
    get<PnlPoint[]>(
      `${PNL}/user-pnl?user_address=${addr}&interval=${interval}&fidelity=${fidelity}`,
    ),

  searchProfiles: (q: string) =>
    get<{ profiles: ProfileSearchResult[] }>(
      `${GAMMA}/public-search?q=${encodeURIComponent(q)}&search_profiles=true&limit_per_type=8`,
    ),
}
