import { motion } from 'motion/react'
import type { TraderData } from '../lib/metrics'
import { buildInsights } from '../lib/insights'
import { compact, shortAddr, usd } from '../lib/format'
import { Avatar } from './Avatar'
import { PnlChart } from './PnlChart'
import { StatTile } from './StatTile'
import { InsightList } from './InsightList'
import { CountUp } from './CountUp'

export const CARD_SIZE = 1080

const GREEN = '#30D158'
const RED = '#FF453A'
const EASE = [0.22, 1, 0.36, 1] as const

// --- animation timeline (seconds) ---
const T = {
  header: 0.15,
  heroLabel: 0.5,
  heroNum: 0.62,
  heroNumDur: 1.35,
  heroSub: 1.5,
  chart: 1.35,
  chartDur: 1.6,
  tiles: 2.45,
  insights: 3.15,
}

/** Entrance transition: fade + rise. */
function rise(delay: number) {
  return {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6, ease: EASE },
  }
}

export function TraderCard({ data }: { data: TraderData }) {
  const { profile, metrics: m, pnlSeries } = data
  const insights = buildInsights(data)
  const up = m.totalPnl >= 0
  const accent = up ? GREEN : RED

  const tiles = [
    {
      label: 'PnL · 30 дней',
      value: usd(m.pnl30d, true),
      accent: m.pnl30d >= 0 ? GREEN : RED,
    },
    { label: 'Объём', value: `$${compact(m.volume)}` },
    {
      label: 'Рынков',
      value: compact(m.marketsTraded),
      sub: m.activeDays
        ? `за ${Math.round(m.activeDays / 30)} мес.`
        : undefined,
    },
    {
      label: 'Лучший трейд',
      value: m.biggestWin ? usd(m.biggestWin.realizedPnl, true) : '—',
      accent: GREEN,
    },
  ]

  return (
    <motion.div
      className="trader-card relative flex flex-col justify-between overflow-hidden rounded-[44px] ring-1 ring-white/[0.07]"
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        padding: 64,
        background:
          'radial-gradient(125% 85% at 50% 0%, #18181B 0%, #0B0B0D 56%, #050506 100%)',
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* ---------- header ---------- */}
      <motion.header
        className="flex items-center justify-between"
        {...rise(T.header)}
      >
        <div className="flex items-center gap-5">
          <Avatar src={profile.profileImage} name={profile.name} size={88} />
          <div>
            <div className="text-[30px] font-bold leading-tight tracking-tight">
              {profile.name}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[15px] text-white/40">
              {profile.pseudonym && <span>{profile.pseudonym}</span>}
              <span className="font-mono text-white/30">
                {shortAddr(profile.address)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/25">
            Polymarket
          </span>
          {profile.rank != null && (
            <span className="rounded-full bg-white/[0.07] px-3 py-1 text-[13px] font-medium text-white/70 ring-1 ring-white/10">
              #{profile.rank} в рейтинге
            </span>
          )}
        </div>
      </motion.header>

      {/* ---------- hero pnl ---------- */}
      <section>
        <motion.div
          className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: T.heroLabel, duration: 0.5 }}
        >
          Общий PnL
        </motion.div>
        <div className="mt-1 flex items-end gap-5">
          <span
            className="text-[112px] font-extrabold leading-[0.95] tracking-tight tabular-nums"
            style={{ color: accent }}
          >
            <CountUp
              value={m.totalPnl}
              format={(n) => usd(n, true)}
              delay={T.heroNum}
              duration={T.heroNumDur}
            />
          </span>
          <motion.span
            className="mb-3 text-[16px] text-white/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T.heroSub, duration: 0.6 }}
          >
            портфель ${compact(m.portfolioValue)}
          </motion.span>
        </div>
      </section>

      {/* ---------- pnl chart ---------- */}
      <section>
        <PnlChart
          series={pnlSeries}
          color={accent}
          width={952}
          height={224}
          delay={T.chart}
          duration={T.chartDur}
        />
      </section>

      {/* ---------- stat tiles ---------- */}
      <section className="flex gap-4">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            className="flex flex-1"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: T.tiles + i * 0.1, duration: 0.55, ease: EASE }}
          >
            <StatTile
              label={tile.label}
              value={tile.value}
              sub={tile.sub}
              accent={tile.accent}
            />
          </motion.div>
        ))}
      </section>

      {/* ---------- insights ---------- */}
      <section className="flex gap-10">
        <InsightList
          title="Сильные стороны"
          items={insights.pros}
          kind="pro"
          delay={T.insights}
        />
        <div className="w-px self-stretch bg-white/[0.07]" />
        <InsightList
          title="Слабые стороны"
          items={insights.cons}
          kind="con"
          delay={T.insights}
        />
      </section>
    </motion.div>
  )
}
