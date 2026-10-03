// Shapes returned by the Polymarket public APIs (verified against live responses).

export interface LeaderboardEntry {
  rank: string
  proxyWallet: string
  userName: string
  xUsername: string
  verifiedBadge: boolean
  vol: number
  pnl: number
  profileImage: string
}

export interface Position {
  proxyWallet: string
  asset: string
  conditionId: string
  size: number
  avgPrice: number
  initialValue: number
  currentValue: number
  cashPnl: number
  percentPnl: number
  totalBought: number
  realizedPnl: number
  percentRealizedPnl: number
  curPrice: number
  redeemable: boolean
  mergeable: boolean
  title: string
  slug: string
  icon: string
  eventId: string
  eventSlug: string
  outcome: string
  outcomeIndex: number
  endDate: string
  negativeRisk: boolean
}

export interface Activity {
  proxyWallet: string
  timestamp: number
  conditionId: string
  type: string
  size: number
  usdcSize: number
  transactionHash: string
  price: number
  asset: string
  side: 'BUY' | 'SELL'
  outcomeIndex: number
  title: string
  slug: string
  icon: string
  eventSlug: string
  outcome: string
  name: string
  pseudonym: string
  profileImage: string
}

export interface ClosedPosition {
  proxyWallet: string
  asset: string
  conditionId: string
  avgPrice: number
  totalBought: number
  realizedPnl: number
  curPrice: number
  title: string
  slug: string
  icon: string
  eventSlug: string
  outcome: string
  outcomeIndex: number
  endDate: string
  timestamp: number
}

export interface PnlPoint {
  t: number // unix seconds
  p: number // mark-to-market pnl at that time
}

export interface ProfileSearchResult {
  name: string
  pseudonym: string
  displayUsernamePublic: boolean
  proxyWallet: string
}
