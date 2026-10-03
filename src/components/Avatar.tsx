import { useState } from 'react'

export function Avatar({
  src,
  name,
  size = 88,
}: {
  src?: string
  name: string
  size?: number
}) {
  const [broken, setBroken] = useState(false)
  const initials =
    name
      .replace(/[^a-zA-Zа-яА-Я0-9]/g, '')
      .slice(0, 2)
      .toUpperCase() || '?'

  return (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-white/25 to-white/[0.06] ring-1 ring-white/10"
    >
      {src && !broken ? (
        <img
          src={src}
          alt=""
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-semibold text-white/70"
          style={{ fontSize: size * 0.34 }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}
