export function StatTile({
  label,
  value,
  sub,
  accent = '#FFFFFF',
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl bg-white/[0.045] px-5 py-4 ring-1 ring-white/[0.06]">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
        {label}
      </span>
      <span
        className="mt-1.5 text-[26px] font-semibold tabular-nums leading-none"
        style={{ color: accent }}
      >
        {value}
      </span>
      {sub && (
        <span className="mt-1 text-[12px] text-white/35">{sub}</span>
      )}
    </div>
  )
}
