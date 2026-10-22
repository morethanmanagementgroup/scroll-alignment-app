'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import BirthDetailsForm from '@/components/astro/BirthDetailsForm'
import PlaceSearch from '@/components/astro/PlaceSearch'
import { storage } from '@/lib/storage'
import { authFetch, fetchEntitlement } from '@/lib/clientAuth'
import { lineDistances } from '@/lib/astro/geometry'
import { ANGLES, BODIES } from '@/lib/astro/conventions'
import { ANGLE_INFO, PLANET_INFO, UNKNOWN_TIME_MESSAGE, influenceBand, lineExplanation, lineTitle } from '@/lib/astro/explanations'
import { formatKm, formatMiles, formatOffset, placeLabel } from '@/lib/astro/format'
import type { AngleName, BirthChartRecord, LineDistance, NatalMapResult, Place, PlanetName } from '@/lib/astro/types'
import type { User } from '@/lib/types'

const AstroMap = dynamic(() => import('@/components/map/AstroMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-scroll-gold/60 animate-pulse-gold">✦ Drawing the map…</div>,
})

type View =
  | { kind: 'loading' }
  | { kind: 'sign-in' }
  | { kind: 'confirm'; chart: BirthChartRecord | null }
  | { kind: 'time-unknown'; chart: BirthChartRecord }
  | { kind: 'map'; data: NatalMapResult; chart: BirthChartRecord }
  | { kind: 'error'; message: string }

const ANGLE_STROKE: Record<AngleName, string> = { MC: 'solid', IC: 'dashed', ASC: 'solid', DSC: 'dotted' }

export default function MapPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [editing, setEditing] = useState(false)
  const [bodies, setBodies] = useState<PlanetName[]>(BODIES)
  const [angles, setAngles] = useState<AngleName[]>(ANGLES)
  const [city, setCity] = useState<Place | null>(null)
  const [selected, setSelected] = useState<{ body: PlanetName; angle: AngleName } | null>(null)
  const [units, setUnits] = useState<'km' | 'mi'>('km')

  const load = useCallback(async () => {
    setView({ kind: 'loading' })
    try {
      const ent = await fetchEntitlement()
      if (!ent.authenticated) { setView({ kind: 'sign-in' }); return }
      if (!ent.isPaid) { router.push('/unlock'); return }
      const res = await authFetch('/api/astro/natal')
      const data = await res.json()
      if (!res.ok) { setView({ kind: 'error', message: data.error ?? 'Could not load your map.' }); return }
      if (data.status === 'not-confirmed') setView({ kind: 'confirm', chart: null })
      else if (data.status === 'time-unknown') setView({ kind: 'time-unknown', chart: data.birthChart })
      else setView({ kind: 'map', data, chart: data.birthChart })
    } catch {
      setView({ kind: 'error', message: 'Network error. Check your connection and try again.' })
    }
  }, [router])

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }
    setUser(u)
    load()
  }, [router, load])

  const distances: LineDistance[] = useMemo(() => {
    if (view.kind !== 'map' || !city) return []
    return lineDistances(city.lat, city.lon, view.data.positions, view.data.gastHours)
      .filter(d => bodies.includes(d.body) && angles.includes(d.angle))
  }, [view, city, bodies, angles])

  const highlight = useMemo(() => {
    if (!selected) return distances[0] ? { ...distances[0] } : null
    const d = distances.find(x => x.body === selected.body && x.angle === selected.angle)
    return d ? { ...d } : null
  }, [selected, distances])

  if (!user) return null
  const chart = view.kind === 'map' || view.kind === 'time-unknown' ? view.chart : view.kind === 'confirm' ? view.chart : null
  const fmt = (km: number) => (units === 'km' ? formatKm(km) : formatMiles(km))

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1 min-w-0">
        <Header isPaid />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="mb-6">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Astrocartography</p>
            <h1 className="font-serif text-3xl sm:text-4xl">My Map</h1>
            <p className="text-scroll-bone-dim mt-2 max-w-2xl">
              Where each planet was rising, setting, overhead or underfoot at the moment you were born — and how close any city is to those lines.
            </p>
          </div>

          {view.kind === 'loading' && (
            <Card className="text-center py-16"><p className="text-scroll-gold animate-pulse-gold">✦ Reading the sky at your birth…</p></Card>
          )}

          {view.kind === 'sign-in' && (
            <Card variant="gold" className="max-w-xl">
              <h2 className="font-serif text-xl mb-2">Sign in to open your map</h2>
              <p className="text-scroll-bone-dim text-sm mb-5">Your map is calculated on our servers from your confirmed birth details, so we need to know it&apos;s you.</p>
              <Link href="/signin?redirect=/map"><Button>Sign in</Button></Link>
            </Card>
          )}

          {view.kind === 'error' && (
            <Card className="max-w-xl">
              <p className="text-red-400/80 mb-4">{view.message}</p>
              <Button variant="ghost" onClick={load}>Try again</Button>
            </Card>
          )}

          {(view.kind === 'confirm' || editing) && (
            <Card variant="gold" className="max-w-xl mb-8">
              <h2 className="font-serif text-xl mb-1">{chart ? 'Update your birth details' : 'Confirm your birth details'}</h2>
              <p className="text-scroll-bone-dim text-sm mb-6">
                {chart
                  ? 'Changing these redraws your map.'
                  : 'Lines are drawn from your exact birthplace and birth moment. Please check these carefully — we pre-filled what you gave us at sign-up.'}
              </p>
              <BirthDetailsForm
                existing={chart}
                legacy={{ birthDate: user.birthDate, birthTime: user.birthTime, birthCity: user.birthCity }}
                onSaved={() => { setEditing(false); setSelected(null); load() }}
                onCancel={chart ? () => setEditing(false) : undefined}
              />
            </Card>
          )}

          {chart && !editing && view.kind !== 'confirm' && <BirthSummary chart={chart} onEdit={() => setEditing(true)} />}

          {view.kind === 'time-unknown' && !editing && (
            <Card className="max-w-2xl">
              <h2 className="font-serif text-xl mb-3">Precise lines need a birth time</h2>
              <p className="text-scroll-bone-dim leading-relaxed text-sm">{UNKNOWN_TIME_MESSAGE}</p>
              <div className="mt-5"><Button onClick={() => setEditing(true)}>Add my birth time</Button></div>
            </Card>
          )}

          {view.kind === 'map' && !editing && (
            <>
              {view.data.uncertainty && (
                <div className="scroll-card-gold px-4 py-3 mb-4 text-sm text-scroll-bone-dim">
                  <span className="text-scroll-gold">Approximate birth time.</span>{' '}
                  ±{view.data.uncertainty.minutes} minutes means every line could sit up to ±{view.data.uncertainty.longitudeDeg.toFixed(1)}° of
                  longitude east or west — about {fmt(view.data.uncertainty.longitudeDeg * 111.32)} at the equator, less toward the poles. Treat distances as rough.
                </div>
              )}

              <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
                <div className="space-y-4 min-w-0">
                  <div className="scroll-card overflow-hidden h-[58vh] min-h-[340px] sm:h-[520px]">
                    <AstroMap
                      lines={view.data.lines}
                      bodies={bodies}
                      angles={angles}
                      city={city ? { name: city.name, lat: city.lat, lon: city.lon } : null}
                      highlight={city ? highlight : null}
                      approximate={!!view.data.uncertainty}
                      onLineClick={(body, angle) => setSelected({ body, angle })}
                    />
                  </div>
                  <Toggles bodies={bodies} setBodies={setBodies} angles={angles} setAngles={setAngles} />
                </div>

                <div className="space-y-4">
                  <Card className="!p-5">
                    <h2 className="font-serif text-lg mb-3">Check a city</h2>
                    <PlaceSearch value={city} onChange={p => { setCity(p); setSelected(null) }} placeholder="Search any city…" />
                    {city && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-scroll-bone-dim">Nearest lines to {city.name}</p>
                          <button onClick={() => setUnits(u => (u === 'km' ? 'mi' : 'km'))} className="text-xs text-scroll-gold/70 hover:text-scroll-gold">
                            {units === 'km' ? 'Show miles' : 'Show km'}
                          </button>
                        </div>
                        <ul className="space-y-1.5">
                          {distances.slice(0, 6).map(d => {
                            const band = influenceBand(d.km)
                            const active = highlight?.body === d.body && highlight?.angle === d.angle
                            return (
                              <li key={d.body + d.angle}>
                                <button onClick={() => setSelected({ body: d.body, angle: d.angle })}
                                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-scroll-purple-dim' : 'hover:bg-scroll-charcoal'}`}>
                                  <span style={{ color: PLANET_INFO[d.body].color }} className="text-lg w-5 text-center">{PLANET_INFO[d.body].glyph}</span>
                                  <span className="flex-1 text-scroll-bone">{lineTitle(d.body, d.angle)}</span>
                                  <span className="text-right">
                                    <span className="block text-scroll-bone tabular-nums">{fmt(d.km)}</span>
                                    <span className="block text-[11px] text-scroll-bone-dim/70">{band.label}</span>
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                          {distances.length === 0 && <li className="text-sm text-scroll-bone-dim">Turn on at least one planet and line type.</li>}
                        </ul>
                        <p className="text-[11px] text-scroll-bone-dim/60 mt-3 leading-snug">
                          Shortest distance over the Earth&apos;s surface to each line. Strength bands are an interpretive convention, not a measurement.
                        </p>
                      </div>
                    )}
                  </Card>

                  {(selected || (city && highlight)) && (
                    <LineCard body={(selected ?? highlight)!.body} angle={(selected ?? highlight)!.angle}
                      km={city ? distances.find(d => d.body === (selected ?? highlight)!.body && d.angle === (selected ?? highlight)!.angle)?.km : undefined}
                      fmt={fmt} cityName={city?.name} />
                  )}

                  <Legend />
                </div>
              </div>

              <Method data={view.data} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function BirthSummary({ chart, onEdit }: { chart: BirthChartRecord; onEdit: () => void }) {
  const acc = chart.timeAccuracy === 'exact' ? 'exact time'
    : chart.timeAccuracy === 'approximate' ? `approximate (±${chart.approxMinutes} min)` : 'time unknown'
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-sm">
      <span className="text-scroll-bone">{placeLabel(chart.place)}</span>
      <span className="text-scroll-bone-dim">{chart.localDate}{chart.localTime ? ` · ${chart.localTime}` : ''}</span>
      {chart.offsetSeconds !== null && <span className="text-scroll-bone-dim">{formatOffset(chart.offsetSeconds)}</span>}
      {chart.utc && <span className="text-scroll-bone-dim/70">{chart.utc.replace('T', ' ').slice(0, 16)} UTC</span>}
      <span className="text-scroll-gold/80">{acc}</span>
      {chart.lmtWarning && <span className="text-scroll-bone-dim/70">· historical local mean time — please double-check</span>}
      <button onClick={onEdit} className="text-scroll-gold/70 hover:text-scroll-gold underline underline-offset-2">Edit</button>
    </div>
  )
}

function Toggles({ bodies, setBodies, angles, setAngles }: {
  bodies: PlanetName[]; setBodies: (b: PlanetName[]) => void; angles: AngleName[]; setAngles: (a: AngleName[]) => void
}) {
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v])
  return (
    <div className="scroll-card p-4 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {BODIES.map(b => {
          const on = bodies.includes(b)
          return (
            <button key={b} onClick={() => setBodies(toggle(bodies, b))} aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? 'border-scroll-border bg-scroll-charcoal text-scroll-bone' : 'border-scroll-border/50 text-scroll-bone-dim/40'}`}>
              <span style={{ color: on ? PLANET_INFO[b].color : undefined }}>{PLANET_INFO[b].glyph}</span>{b}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {ANGLES.map(a => {
          const on = angles.includes(a)
          return (
            <button key={a} onClick={() => setAngles(toggle(angles, a))} aria-pressed={on}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? 'border-scroll-gold/50 text-scroll-gold' : 'border-scroll-border/50 text-scroll-bone-dim/40'}`}>
              {ANGLE_INFO[a].short} <span className="opacity-60">· {ANGLE_STROKE[a]}</span>
            </button>
          )
        })}
        <span className="flex-1" />
        <button onClick={() => { setBodies(BODIES); setAngles(ANGLES) }} className="text-xs text-scroll-bone-dim hover:text-scroll-bone">Show all</button>
        <button onClick={() => setBodies([])} className="text-xs text-scroll-bone-dim hover:text-scroll-bone ml-2">Hide all</button>
      </div>
    </div>
  )
}

function LineCard({ body, angle, km, fmt, cityName }: { body: PlanetName; angle: AngleName; km?: number; fmt: (km: number) => string; cityName?: string }) {
  const p = PLANET_INFO[body]
  return (
    <Card variant="gold" className="!p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl" style={{ color: p.color }}>{p.glyph}</span>
        <div>
          <h3 className="font-serif text-lg leading-tight">{body} {ANGLE_INFO[angle].name}</h3>
          {km !== undefined && cityName && <p className="text-xs text-scroll-bone-dim">{fmt(km)} from {cityName} · {influenceBand(km).label.toLowerCase()}</p>}
        </div>
      </div>
      <p className="text-sm text-scroll-bone-dim leading-relaxed">{lineExplanation(body, angle)}</p>
    </Card>
  )
}

function Legend() {
  return (
    <div className="scroll-card p-4 text-xs text-scroll-bone-dim space-y-1.5">
      {ANGLES.map(a => (
        <p key={a}><span className="text-scroll-bone">{ANGLE_INFO[a].short}</span> <span className="opacity-60">({ANGLE_STROKE[a]})</span> — {ANGLE_INFO[a].meaning}</p>
      ))}
      <p className="pt-1 opacity-70">Tap any line on the map for its meaning.</p>
    </div>
  )
}

function Method({ data }: { data: NatalMapResult }) {
  return (
    <details className="mt-8 scroll-card p-5 text-xs text-scroll-bone-dim">
      <summary className="cursor-pointer text-scroll-bone text-sm">How this map is calculated</summary>
      <div className="mt-3 space-y-1.5 leading-relaxed">
        <p>Birth moment: {data.instantUtc.replace('T', ' ').slice(0, 19)} UTC · time-zone rules: IANA tz {data.tzdbVersion}</p>
        <p>Positions: {data.conventions.frame}. Earth rotation: {data.conventions.siderealTime}.</p>
        <p>Lines: {data.conventions.lineMethod}; horizon is {data.conventions.horizon}.</p>
        <p>Engine: {data.engine.name} {data.engine.version}. Calculated by astronomy, not AI; interpretations above are fixed text.</p>
        <p>Lines are drawn to {data.conventions.displayLatitudeLimitDeg}° latitude; distances use the full geometry up to the poles.</p>
      </div>
    </details>
  )
}
