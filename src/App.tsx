import { useEffect, useRef, useState, type RefObject } from 'react'
import { resolveTrader } from './lib/resolve'
import { FEATURED_TRADERS } from './lib/featured'
import type { ProfileSearchResult } from './types'
import { useTrader } from './hooks/useTrader'
import { TraderCard, CARD_SIZE } from './components/TraderCard'

export default function App() {
  const [input, setInput] = useState('')
  // Opens on a ready example, so nobody has to go hunting for a trader first.
  const [featured, setFeatured] = useState<number | null>(0)
  const [address, setAddress] = useState<string | null>(
    FEATURED_TRADERS[0].address,
  )
  const [resolveMsg, setResolveMsg] = useState('')
  const [choices, setChoices] = useState<ProfileSearchResult[]>([])
  const [resolving, setResolving] = useState(false)
  const [recording, setRecording] = useState(false)

  const { data, isLoading, isError, error } = useTrader(address)
  const headerRef = useRef<HTMLDivElement>(null)
  const scale = useFitScale(recording, headerRef)

  // Replay token — bumping it remounts the card and restarts the animation.
  const [playId, setPlayId] = useState(0)
  const replay = () => setPlayId((p) => p + 1)
  useEffect(() => {
    if (data) replay()
  }, [data])

  // Recording mode: Esc exits, Space / R replays the animation.
  useEffect(() => {
    if (!recording) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRecording(false)
      if (e.key === ' ' || e.key.toLowerCase() === 'r') {
        e.preventDefault()
        replay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [recording])

  async function handleSubmit() {
    if (!input.trim()) return
    setResolving(true)
    setResolveMsg('')
    setChoices([])
    setFeatured(null)
    setAddress(null)
    try {
      const r = await resolveTrader(input)
      if (r.kind === 'address') {
        setAddress(r.address)
      } else if (r.kind === 'choices') {
        setChoices(r.choices)
        setResolveMsg('Несколько трейдеров - выбери нужного:')
      } else {
        setResolveMsg(
          'Трейдер не найден. Вставь ссылку на профиль с адресом 0x…',
        )
      }
    } catch (e) {
      setResolveMsg('Ошибка резолва: ' + (e as Error).message)
    } finally {
      setResolving(false)
    }
  }

  function pickFeatured(i: number) {
    const t = FEATURED_TRADERS[i]
    setFeatured(i)
    setInput('')
    setChoices([])
    setResolveMsg('')
    if (t.address === address) replay()
    else setAddress(t.address)
  }

  const card = data && (
    <div style={{ width: CARD_SIZE * scale, height: CARD_SIZE * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <TraderCard key={playId} data={data} />
      </div>
    </div>
  )

  // ---------- recording mode: just the card on black ----------
  if (recording && data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {card}
        <RecordingHint />
      </div>
    )
  }

  // ---------- normal mode ----------
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div
        ref={headerRef}
        className="flex w-full max-w-2xl flex-col items-center gap-3 px-4 pt-7"
      >
        <div className="flex w-full gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ссылка на трейдера Polymarket или его имя"
            className="flex-1 rounded-xl bg-white/[0.07] px-4 py-2.5 text-[15px] outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:bg-white/10 focus:ring-white/20"
          />
          <button
            onClick={handleSubmit}
            disabled={resolving}
            className="rounded-xl bg-white px-5 py-2.5 text-[15px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
          >
            {resolving ? '…' : 'Показать'}
          </button>
          {data && (
            <>
              <button
                onClick={replay}
                title="Проиграть анимацию заново"
                className="rounded-xl bg-white/[0.07] px-4 py-2.5 text-[15px] font-medium ring-1 ring-white/10 transition hover:bg-white/10"
              >
                ↻ Заново
              </button>
              <button
                onClick={() => {
                  setRecording(true)
                  replay()
                }}
                title="Чистый экран для записи видео"
                className="rounded-xl bg-white/[0.07] px-4 py-2.5 text-[15px] font-medium ring-1 ring-white/10 transition hover:bg-white/10"
              >
                ⛶ Запись
              </button>
            </>
          )}
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <span className="text-[13px] text-white/30">Примеры:</span>
          {FEATURED_TRADERS.map((t, i) => (
            <button
              key={t.address}
              onClick={() => pickFeatured(i)}
              title={t.note}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ring-1 transition ${
                featured === i
                  ? 'bg-white/[0.14] text-white ring-white/25'
                  : 'bg-white/[0.05] text-white/55 ring-white/10 hover:bg-white/10 hover:text-white/85'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {featured !== null && (
          <p className="text-center text-[12px] text-white/30">
            {FEATURED_TRADERS[featured].note} · вставь свою ссылку, и карточка
            пересоберётся
          </p>
        )}

        {resolveMsg && <p className="text-[13px] text-white/50">{resolveMsg}</p>}

        {choices.length > 0 && (
          <div className="flex w-full flex-col gap-1">
            {choices.map((c) => (
              <button
                key={c.proxyWallet}
                onClick={() => {
                  setAddress(c.proxyWallet.toLowerCase())
                  setChoices([])
                  setResolveMsg('')
                }}
                className="flex items-center justify-between rounded-lg bg-white/[0.05] px-4 py-2 text-left transition hover:bg-white/10"
              >
                <span>
                  <span className="font-medium">{c.name}</span>{' '}
                  <span className="text-white/40">{c.pseudonym}</span>
                </span>
                <span className="font-mono text-[12px] text-white/30">
                  {c.proxyWallet.slice(0, 8)}…
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full flex-1 items-center justify-center p-6">
        {!address && !choices.length && (
          <Hint text="Вставь ссылку на трейдера - соберём анимированную карточку" />
        )}
        {address && isLoading && <Hint text="Загружаю данные трейдера…" />}
        {address && isError && (
          <Hint text={'Не удалось загрузить: ' + (error as Error).message} />
        )}
        {card}
      </div>
    </div>
  )
}

function Hint({ text }: { text: string }) {
  return (
    <div className="max-w-md text-center text-[15px] text-white/35">{text}</div>
  )
}

function RecordingHint() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div
      className="pointer-events-none fixed bottom-5 left-1/2 -translate-x-1/2 text-[13px] text-white/30 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      Esc - выход · Пробел - повтор анимации
    </div>
  )
}

/** Scale factor so the 1080×1080 card fits the viewport under the header. */
function useFitScale(
  recording: boolean,
  headerRef: RefObject<HTMLDivElement | null>,
) {
  const [scale, setScale] = useState(0.5)
  useEffect(() => {
    const update = () => {
      // The strip above the card grows with the example chips and the resolve
      // messages, so measure it rather than assuming a fixed margin.
      const chromeH = recording
        ? 48
        : (headerRef.current?.offsetHeight ?? 0) + 52
      const chromeW = recording ? 48 : 100
      const availH = window.innerHeight - chromeH
      const availW = window.innerWidth - chromeW
      setScale(Math.min(1, availH / CARD_SIZE, availW / CARD_SIZE))
    }
    update()
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    if (!recording && headerRef.current) ro.observe(headerRef.current)
    return () => {
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [recording, headerRef])
  return scale
}
