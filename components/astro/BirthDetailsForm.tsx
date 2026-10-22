'use client'
import { useState } from 'react'
import PlaceSearch from './PlaceSearch'
import Button from '@/components/ui/Button'
import { authFetch } from '@/lib/clientAuth'
import { storage } from '@/lib/storage'
import type { BirthChartRecord, BirthTimeAccuracy, Place, TimeChoice } from '@/lib/astro/types'

interface Props {
  existing: BirthChartRecord | null
  /** Legacy fields from the profile, used to pre-fill for members confirming for the first time. */
  legacy: { birthDate?: string; birthTime?: string; birthCity?: string }
  onSaved: (record: BirthChartRecord) => void
  onCancel?: () => void
}

interface Option { choice: TimeChoice; utc: string; offset: string; label: string }

const ACCURACY: { value: BirthTimeAccuracy; label: string; hint: string }[] = [
  { value: 'exact',       label: 'Exact',        hint: 'From a birth certificate or hospital record' },
  { value: 'approximate', label: 'Approximate',  hint: 'Remembered or estimated' },
  { value: 'unknown',     label: 'Unknown',      hint: 'No time on record' },
]

export default function BirthDetailsForm({ existing, legacy, onSaved, onCancel }: Props) {
  const [place, setPlace] = useState<Place | null>(existing?.place ?? null)
  const [date, setDate] = useState(existing?.localDate ?? legacy.birthDate ?? '')
  const [accuracy, setAccuracy] = useState<BirthTimeAccuracy>(existing?.timeAccuracy ?? (legacy.birthTime ? 'exact' : 'unknown'))
  const [time, setTime] = useState(existing?.localTime ?? legacy.birthTime ?? '')
  const [approx, setApprox] = useState(existing?.approxMinutes ?? 30)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState<{ message: string; options: Option[] } | null>(null)

  const canSave = !!place && /^\d{4}-\d{2}-\d{2}$/.test(date) && (accuracy === 'unknown' || /^\d{2}:\d{2}$/.test(time))

  const submit = async (timeChoice?: TimeChoice) => {
    if (!place) return
    setSaving(true); setError('')
    try {
      const res = await authFetch('/api/birth/confirm', {
        method: 'POST',
        body: JSON.stringify({
          placeId: place.id, date, time: accuracy === 'unknown' ? null : time,
          timeAccuracy: accuracy, approxMinutes: approx, timeChoice,
        }),
      })
      const data = await res.json()
      if (res.status === 409 && data.options) { setQuestion({ message: data.message, options: data.options }); return }
      if (!res.ok) { setError(data.error ?? 'Could not save. Please try again.'); return }
      setQuestion(null)
      const record = data.record as BirthChartRecord
      const u = storage.getUser()
      if (u) {
        storage.saveUser({
          ...u, birthChart: record, birthDate: record.localDate, birthTime: record.localTime ?? undefined,
          birthCity: record.place.name, birthRegion: record.place.admin1, birthCountry: record.place.countryName,
        })
      }
      onSaved(record)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (question) {
    return (
      <div className="space-y-4">
        <p className="text-scroll-bone leading-relaxed">{question.message}</p>
        <div className="space-y-3">
          {question.options.map(o => (
            <button key={o.choice} onClick={() => submit(o.choice)} disabled={saving}
              className="w-full text-left scroll-card px-4 py-3 hover:border-scroll-gold/60 transition-colors">
              <span className="block text-scroll-bone text-sm">{o.label}</span>
              <span className="block text-scroll-bone-dim/70 text-xs mt-1">
                {o.offset} · {new Date(o.utc).toISOString().replace('T', ' ').slice(0, 16)} UTC
              </span>
            </button>
          ))}
        </div>
        <button onClick={() => setQuestion(null)} className="text-scroll-bone-dim text-sm underline">Change the time instead</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="birthplace" className="block text-sm text-scroll-bone-dim mb-2">Birthplace <span className="text-scroll-gold">*</span></label>
        <PlaceSearch id="birthplace" value={place} onChange={setPlace} placeholder={legacy.birthCity ? `e.g. ${legacy.birthCity}` : 'City where you were born'} />
        {place && (
          <p className="text-xs text-scroll-bone-dim/70 mt-2">
            {place.lat.toFixed(3)}°, {place.lon.toFixed(3)}° · time zone {place.timeZone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="birthdate" className="block text-sm text-scroll-bone-dim mb-2">Date of birth <span className="text-scroll-gold">*</span></label>
        <input id="birthdate" type="date" className="scroll-input" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <fieldset>
        <legend className="block text-sm text-scroll-bone-dim mb-2">How sure are you of the birth time?</legend>
        <div className="grid grid-cols-3 gap-2">
          {ACCURACY.map(a => (
            <button key={a.value} type="button" onClick={() => setAccuracy(a.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${accuracy === a.value
                ? 'border-scroll-gold bg-scroll-purple-dim text-scroll-gold' : 'border-scroll-border text-scroll-bone-dim hover:border-scroll-bone-dim'}`}>
              <span className="block font-medium">{a.label}</span>
              <span className="block text-[11px] leading-snug opacity-70 mt-0.5">{a.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {accuracy !== 'unknown' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="birthtime" className="block text-sm text-scroll-bone-dim mb-2">Local clock time <span className="text-scroll-gold">*</span></label>
            <input id="birthtime" type="time" className="scroll-input" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          {accuracy === 'approximate' && (
            <div>
              <label htmlFor="approx" className="block text-sm text-scroll-bone-dim mb-2">Could be off by</label>
              <select id="approx" className="scroll-input" value={approx} onChange={e => setApprox(Number(e.target.value))}>
                <option value={15}>± 15 minutes</option>
                <option value={30}>± 30 minutes</option>
                <option value={60}>± 1 hour</option>
                <option value={120}>± 2 hours</option>
              </select>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-scroll-bone-dim/60 leading-relaxed">
        Enter the time as the clock showed it where you were born. We convert it to universal time using the
        historical time-zone and daylight-saving rules for that place and date.
      </p>

      {error && <p className="text-red-400/80 text-sm bg-red-900/10 border border-red-900/30 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => submit()} disabled={!canSave} loading={saving}>Confirm birth details</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </div>
  )
}
