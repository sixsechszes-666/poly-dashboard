// Number formatting helpers shared by the card and the insights engine.

const MINUS = '−' // typographic minus

export function compact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e9) return trim((n / 1e9).toFixed(2)) + 'B'
  if (abs >= 1e6) return trim((n / 1e6).toFixed(2)) + 'M'
  if (abs >= 1e3) return trim((n / 1e3).toFixed(1)) + 'K'
  return Math.round(n).toString()
}

/** "$1.2M", "+$340K", "−$5.4K" */
export function usd(n: number, signed = false): string {
  const sign = n < 0 ? MINUS : signed && n > 0 ? '+' : ''
  return `${sign}$${compact(Math.abs(n))}`
}

export function pct(n: number, digits = 0): string {
  const sign = n < 0 ? MINUS : ''
  return `${sign}${Math.abs(n).toFixed(digits)}%`
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function trim(s: string): string {
  return s.replace(/\.?0+$/, '')
}
