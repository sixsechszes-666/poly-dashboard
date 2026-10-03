import type { TraderData } from './metrics'
import { compact, pct, usd } from './format'

export interface Insight {
  kind: 'pro' | 'con'
  title: string
  detail: string
  weight: number
}

export interface Insights {
  pros: Insight[]
  cons: Insight[]
}

const DAY = 86_400

/**
 * Derives pro/con bullet points from reliable signals only:
 * the PnL series, redeemed wins, traded volume and activity timing.
 */
export function buildInsights(data: TraderData): Insights {
  const { metrics: m } = data
  const out: Insight[] = []

  const nowSec = Date.now() / 1000
  const months = Math.max(1, Math.round(m.activeDays / 30))
  const pnlMag = Math.max(1, Math.abs(m.totalPnl))
  const lastTradeDays =
    m.lastTradeAt != null ? Math.floor((nowSec - m.lastTradeAt) / DAY) : null
  const topCat = m.tradeCategories[0]
  const totalCatVol = m.tradeCategories.reduce((s, c) => s + c.volume, 0)
  const topCatShare = topCat && totalCatVol > 0 ? topCat.volume / totalCatVol : 0

  // ===================== PROS =====================
  if (m.totalPnl > 0) {
    out.push(pro('В плюсе по PnL', usd(m.totalPnl, true), 3))
  }
  if (m.pnl30d > 0 && m.pnl30d > pnlMag * 0.04) {
    out.push(
      pro(
        'Растёт за 30 дней',
        usd(m.pnl30d, true),
        4 + clamp01(m.pnl30d / pnlMag) * 4,
      ),
    )
  }
  if (m.totalPnl > 0 && m.belowPeakPct < 8) {
    out.push(pro('PnL у исторического максимума', 'кривая на пике', 5))
  }
  if (m.biggestWin && m.biggestWin.realizedPnl > 0) {
    out.push(
      pro(
        'Крупный выигрыш',
        `${usd(m.biggestWin.realizedPnl, true)} · ${m.biggestWin.title}`,
        4.5 + clamp01(m.biggestWin.realizedPnl / pnlMag) * 4,
      ),
    )
  }
  if (m.marketsTraded >= 100 && m.activeDays >= 90) {
    out.push(
      pro('Опытный трейдер', `${compact(m.marketsTraded)} рынков за ${months} мес.`, 3.5),
    )
  }
  if (lastTradeDays != null && lastTradeDays <= 3) {
    out.push(
      pro(
        'Активно торгует',
        lastTradeDays === 0
          ? 'последняя сделка сегодня'
          : `последняя сделка ${lastTradeDays} дн. назад`,
        3,
      ),
    )
  }
  if (topCat && topCatShare >= 0.5 && topCat.category !== 'Другое') {
    out.push(
      pro(
        `Специализация: ${topCat.category}`,
        `${pct(topCatShare * 100)} объёма сделок`,
        4,
      ),
    )
  }
  if (m.volume >= 1_000_000) {
    out.push(pro('Большой объём торгов', `$${compact(m.volume)}`, 3))
  }

  // ===================== CONS =====================
  if (m.totalPnl < 0) {
    out.push(con('В минусе по PnL', usd(m.totalPnl, true), 6))
  }
  if (m.pnl30d < 0 && -m.pnl30d > pnlMag * 0.04) {
    out.push(
      con(
        'Спад за 30 дней',
        usd(m.pnl30d, true),
        4 + clamp01(-m.pnl30d / pnlMag) * 4,
      ),
    )
  }
  if (m.belowPeakPct >= 25) {
    out.push(
      con(
        'Откат от пика',
        `на ${pct(m.belowPeakPct)} ниже максимума`,
        3 + clamp01(m.belowPeakPct / 100) * 4,
      ),
    )
  }
  if (m.seriesMax > 0 && m.maxDrawdown > m.seriesMax * 0.3) {
    out.push(
      con(
        'Глубокая просадка',
        `${usd(-m.maxDrawdown)} от пика до дна`,
        4 + clamp01(m.maxDrawdown / m.seriesMax) * 3,
      ),
    )
  }
  if (m.seriesMin < 0) {
    out.push(
      con('Уходил в минус', `в моменте до ${usd(m.seriesMin)}`, 3.5),
    )
  }
  if (lastTradeDays != null && lastTradeDays >= 21) {
    out.push(
      con('Давно неактивен', `последняя сделка ${lastTradeDays} дн. назад`, 3.5),
    )
  }
  if (m.totalPnl > 0 && m.volume > pnlMag * 6) {
    out.push(
      con(
        'Низкая эффективность',
        `PnL лишь ${pct((m.totalPnl / m.volume) * 100)} от объёма`,
        3.5,
      ),
    )
  }

  const pick = (kind: 'pro' | 'con') =>
    out
      .filter((i) => i.kind === kind)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)

  return { pros: pick('pro'), cons: pick('con') }
}

function pro(title: string, detail: string, weight: number): Insight {
  return { kind: 'pro', title, detail, weight }
}
function con(title: string, detail: string, weight: number): Insight {
  return { kind: 'con', title, detail, weight }
}
function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}
