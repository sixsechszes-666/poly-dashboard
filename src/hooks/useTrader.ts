import { useQuery } from '@tanstack/react-query'
import { api } from '../api/polymarket'
import { buildTraderData, type TraderData } from '../lib/metrics'

async function fetchTrader(address: string): Promise<TraderData> {
  const [positions, closedPositions, activity, pnlSeries, valueRes, tradedRes] =
    await Promise.all([
      api.positions(address).catch(() => []),
      api.closedPositions(address).catch(() => []),
      api.activity(address).catch(() => []),
      api.pnl(address).catch(() => []),
      api
        .value(address)
        .catch(() => [] as { user: string; value: number }[]),
      api.traded(address).catch(() => ({ user: address, traded: 0 })),
    ])

  if (
    !positions.length &&
    !closedPositions.length &&
    !activity.length &&
    !pnlSeries.length
  ) {
    throw new Error('Нет данных по этому трейдеру')
  }

  // Best-effort: pull rank + all-time volume if the trader is on the board.
  const leaderboard = await api
    .leaderboard('window=all&limit=500&orderBy=pnl')
    .then(
      (rows) =>
        rows.find((r) => r.proxyWallet.toLowerCase() === address) ?? null,
    )
    .catch(() => null)

  return buildTraderData({
    address,
    positions,
    closedPositions,
    activity,
    pnlSeries,
    portfolioValue: valueRes[0]?.value ?? 0,
    marketsTraded: tradedRes.traded,
    leaderboard,
  })
}

export function useTrader(address: string | null) {
  return useQuery({
    queryKey: ['trader', address],
    queryFn: () => fetchTrader(address as string),
    enabled: !!address,
  })
}
