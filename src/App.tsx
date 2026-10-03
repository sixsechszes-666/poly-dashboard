import { useEffect, useState } from 'react'
import { resolveTrader } from './lib/resolve'
import type { ProfileSearchResult } from './types'
import { useTrader } from './hooks/useTrader'
import { TraderCard, CARD_SIZE } from './components/TraderCard'

export default function App() {
  const [input, setInput] = useState('')
  const [address, setAddress] = useState<string | null>(null)
  const [resolveMsg, setResolveMsg] = useState('')
  const [choices, setChoices] = useState<ProfileSearchResult[]>([])
  const [resolving, setResolving] = useState(false)
  const [recording, setRecording] = useState(false)

  const { data, isLoading, isError, error } = useTrader(address)
  const scale = useFitScale(recording)

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
    setAddress(null)
    try {
      const r = await resolveTrader(input)
      if (r.kind === 'address') {
        setAddress(r.address)
      } else if (r.kind === 'choices') {
        setChoices(r.choices)
        setResolveMsg('Несколько трейдеров — выбери нужного:')
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
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 px-4 pt-7">
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
          <Hint text="Вставь ссылку на трейдера — соберём анимированную карточку" />
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
      Esc — выход · Пробел — повтор анимации
    </div>
  )
}

/** Scale factor so the 1080×1080 card fits the viewport. */
function useFitScale(recording: boolean) {
  const [scale, setScale] = useState(0.5)
  useEffect(() => {
    const update = () => {
      const marginH = recording ? 48 : 160
      const marginW = recording ? 48 : 80
      const availH = window.innerHeight - marginH
      const availW = window.innerWidth - marginW
      setScale(Math.min(1, availH / CARD_SIZE, availW / CARD_SIZE))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [recording])
  return scale
}
