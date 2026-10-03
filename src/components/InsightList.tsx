import { motion } from 'motion/react'
import type { Insight } from '../lib/insights'

const EASE = [0.22, 1, 0.36, 1] as const

export function InsightList({
  title,
  items,
  kind,
  delay = 0,
}: {
  title: string
  items: Insight[]
  kind: 'pro' | 'con'
  delay?: number
}) {
  const color = kind === 'pro' ? '#30D158' : '#FF453A'
  const fromX = kind === 'pro' ? -16 : 16

  return (
    <div className="flex flex-1 flex-col">
      <motion.div
        className="mb-3.5 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.4 }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
          {title}
        </span>
      </motion.div>

      <div className="flex flex-col gap-3">
        {items.map((it, i) => (
          <motion.div
            key={i}
            className="flex gap-2.5"
            initial={{ opacity: 0, x: fromX }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: delay + 0.15 + i * 0.12,
              duration: 0.5,
              ease: EASE,
            }}
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <div className="min-w-0">
              <div className="text-[16px] font-medium leading-snug text-white/95">
                {it.title}
              </div>
              <div className="truncate text-[13px] leading-snug text-white/40">
                {it.detail}
              </div>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div className="text-[14px] text-white/25">
            {kind === 'pro'
              ? 'Сильных сторон не выявлено'
              : 'Слабых сторон не выявлено'}
          </div>
        )}
      </div>
    </div>
  )
}
