import { motion } from 'motion/react'
import type { PnlPoint } from '../types'

interface Props {
  series: PnlPoint[]
  color: string
  width?: number
  height?: number
  delay?: number // when the line starts drawing
  duration?: number // how long the draw takes
}

/** Minimalist PnL sparkline with an animated line draw, fill and end marker. */
export function PnlChart({
  series,
  color,
  width = 952,
  height = 224,
  delay = 0,
  duration = 1.6,
}: Props) {
  if (series.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-sm text-white/25"
      >
        Недостаточно данных для графика
      </div>
    )
  }

  const padY = 22
  const ps = series.map((s) => s.p)
  const min = Math.min(...ps, 0)
  const max = Math.max(...ps, 0)
  const range = max - min || 1

  const x = (i: number) => (i / (series.length - 1)) * width
  const y = (p: number) =>
    height - padY - ((p - min) / range) * (height - padY * 2)

  const line = series
    .map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.p).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${width.toFixed(1)},${height} L0,${height} Z`

  const lastX = x(series.length - 1)
  const lastY = y(series[series.length - 1].p)
  const zeroY = y(0)
  const showZero = min < 0 && max > 0
  const markerDelay = delay + duration * 0.92

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showZero && (
        <motion.line
          x1="0"
          x2={width}
          y1={zeroY}
          y2={zeroY}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="4 6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.6 }}
        />
      )}

      <motion.path
        d={area}
        fill="url(#pnlFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + duration * 0.4, duration: 0.9 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration, ease: [0.45, 0, 0.25, 1] }}
      />

      <motion.circle
        cx={lastX}
        cy={lastY}
        r="13"
        fill={color}
        opacity="0.18"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: markerDelay, duration: 0.5 }}
        style={{ transformOrigin: `${lastX}px ${lastY}px` }}
      />
      <motion.circle
        cx={lastX}
        cy={lastY}
        r="6.5"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: markerDelay, duration: 0.45, ease: 'backOut' }}
        style={{ transformOrigin: `${lastX}px ${lastY}px` }}
      />
    </svg>
  )
}
