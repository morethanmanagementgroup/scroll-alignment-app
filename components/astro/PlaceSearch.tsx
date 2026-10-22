'use client'
import { useEffect, useRef, useState } from 'react'
import { placeLabel } from '@/lib/astro/format'
import type { Place } from '@/lib/astro/types'

interface Props {
  value: Place | null
  onChange: (p: Place | null) => void
  placeholder?: string
  autoFocus?: boolean
  id?: string
}

/** Type-ahead search over the bundled GeoNames city list. */
export default function PlaceSearch({ value, onChange, placeholder = 'Start typing a city…', autoFocus, id }: Props) {
  const [q, setQ] = useState(value ? placeLabel(value) : '')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const reqId = useRef(0)

  useEffect(() => { if (value) setQ(placeLabel(value)) }, [value])

  const search = (text: string) => {
    setQ(text)
    if (value) onChange(null)
    clearTimeout(timer.current)
    if (text.trim().length < 2) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      const my = ++reqId.current
      setLoading(true)
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(text)}`)
        const data = await res.json()
        if (my === reqId.current) { setResults(data.places ?? []); setOpen(true); setActive(0) }
      } catch { /* ignore */ } finally {
        if (my === reqId.current) setLoading(false)
      }
    }, 200)
  }

  const pick = (p: Place) => {
    onChange(p); setQ(placeLabel(p)); setOpen(false); setResults([])
  }

  return (
    <div className="relative">
      <input
        id={id}
        className="scroll-input w-full"
        placeholder={placeholder}
        value={q}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onChange={e => search(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={e => {
          if (!open || !results.length) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
          if (e.key === 'Enter') { e.preventDefault(); pick(results[active]) }
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-scroll-gold/60 text-xs animate-pulse-gold">✦</span>}
      {open && (
        <ul role="listbox" className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-scroll-border bg-scroll-charcoal shadow-xl">
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-scroll-bone-dim">
              No match. Try the nearest larger town — the map shifts only by the distance between them.
            </li>
          )}
          {results.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={i === active}
              onMouseDown={e => { e.preventDefault(); pick(p) }}
              onMouseEnter={() => setActive(i)}
              className={`px-4 py-2.5 cursor-pointer text-sm flex justify-between gap-3 ${i === active ? 'bg-scroll-purple-dim text-scroll-gold' : 'text-scroll-bone'}`}
            >
              <span>{placeLabel(p)}</span>
              <span className="text-scroll-bone-dim/60 text-xs whitespace-nowrap">{p.timeZone}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
