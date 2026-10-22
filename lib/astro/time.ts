// ============================================================
// SCROLL ALIGNMENT — Local birth time → UTC
// Resolves a wall-clock time in an IANA zone to the exact UTC
// instant(s) it can mean, using the runtime's IANA tz database
// (Node's built-in ICU data). Handles three cases explicitly:
//   ok          — exactly one instant
//   ambiguous   — the clock showed this time twice (clocks fell back)
//   nonexistent — the clock skipped this time (clocks sprang forward)
// Pure and deterministic for a given tz database version.
// ============================================================

import type { LocalTimeResolution, TimeChoice } from './types'

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^(\d{2}):(\d{2})$/

export const MIN_YEAR = 1850
export const MAX_YEAR = 2100

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      era: 'short',
    })
    formatters.set(timeZone, f)
  }
  return f
}

/** True when the runtime knows this IANA zone. */
export function isValidTimeZone(timeZone: string): boolean {
  try { formatterFor(timeZone); return true } catch { return false }
}

/** The local wall-clock reading of a UTC instant, as "UTC-like" milliseconds. */
function wallClockMs(utcMs: number, timeZone: string): number {
  const parts = formatterFor(timeZone).formatToParts(new Date(utcMs))
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '0'
  let year = parseInt(get('year'), 10)
  if (get('era') === 'BC') year = 1 - year
  const ms = Date.UTC(
    year, parseInt(get('month'), 10) - 1, parseInt(get('day'), 10),
    parseInt(get('hour'), 10), parseInt(get('minute'), 10), parseInt(get('second'), 10),
  )
  // Intl rounds to whole seconds; keep the sub-second part of the input.
  return ms + (((utcMs % 1000) + 1000) % 1000)
}

/** UTC offset (seconds, east-positive) in force at a UTC instant. */
export function offsetSecondsAt(utcMs: number, timeZone: string): number {
  return Math.round((wallClockMs(utcMs, timeZone) - utcMs) / 1000)
}

/** Version of the IANA tz database the runtime uses (e.g. "2025b"). */
export function tzdbVersion(): string {
  return (process.versions as Record<string, string | undefined>).tz ?? 'unknown'
}

/**
 * Every UTC instant at which the clock in `timeZone` read `date time`.
 * Returns 0 (skipped), 1 (normal) or 2 (repeated) instants.
 */
export function resolveLocalTime(date: string, time: string, timeZone: string): LocalTimeResolution {
  const dm = DATE_RE.exec(date)
  const tm = TIME_RE.exec(time)
  if (!dm) return { status: 'invalid', reason: 'Date must be YYYY-MM-DD.' }
  if (!tm) return { status: 'invalid', reason: 'Time must be HH:MM (24-hour).' }
  const [y, mo, d] = [Number(dm[1]), Number(dm[2]), Number(dm[3])]
  const [h, mi] = [Number(tm[1]), Number(tm[2])]
  if (y < MIN_YEAR || y > MAX_YEAR) return { status: 'invalid', reason: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.` }
  if (h > 23 || mi > 59) return { status: 'invalid', reason: 'Time is out of range.' }
  const naive = Date.UTC(y, mo - 1, d, h, mi, 0)
  const check = new Date(naive)
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    return { status: 'invalid', reason: 'That calendar date does not exist.' }
  }
  if (!isValidTimeZone(timeZone)) return { status: 'invalid', reason: `Unknown time zone "${timeZone}".` }

  // Every offset in force within ±36 hours is a candidate. Real zones
  // change offset at most a few times in a day and never by > 26 hours.
  const offsets = new Set<number>()
  for (let k = -36; k <= 36; k += 1) offsets.add(offsetSecondsAt(naive + k * 3600_000, timeZone))

  const matches: { utc: string; offsetSeconds: number }[] = []
  for (const off of Array.from(offsets)) {
    const utcMs = naive - off * 1000
    if (wallClockMs(utcMs, timeZone) === naive && offsetSecondsAt(utcMs, timeZone) === off) {
      matches.push({ utc: new Date(utcMs).toISOString(), offsetSeconds: off })
    }
  }
  matches.sort((a, b) => a.utc.localeCompare(b.utc))
  const unique = matches.filter((m, i) => i === 0 || m.utc !== matches[i - 1].utc)

  if (unique.length === 1) {
    const lmtWarning = unique[0].offsetSeconds % 60 !== 0
    return { status: 'ok', ...unique[0], ...(lmtWarning ? { lmtWarning } : {}) }
  }
  if (unique.length >= 2) return { status: 'ambiguous', candidates: unique }

  // Skipped time: report the offsets either side of the jump and the
  // two readings a person could reasonably mean.
  const before = offsetSecondsAt(naive - 24 * 3600_000, timeZone)
  const after = offsetSecondsAt(naive + 24 * 3600_000, timeZone)
  return {
    status: 'nonexistent',
    offsetBeforeSeconds: before,
    offsetAfterSeconds: after,
    candidates: [
      { utc: new Date(naive - before * 1000).toISOString(), offsetSeconds: before, rule: 'offset-before' },
      { utc: new Date(naive - after * 1000).toISOString(), offsetSeconds: after, rule: 'offset-after' },
    ],
  }
}

/**
 * Pick one instant from a resolution, using the person's explicit choice
 * when the local time was ambiguous or skipped. Returns null when a
 * choice is required but missing or does not fit the case.
 */
export function chooseInstant(
  r: LocalTimeResolution,
  choice: TimeChoice | null | undefined,
): { utc: string; offsetSeconds: number; resolution: 'unique' | 'ambiguous-chosen' | 'nonexistent-chosen' } | null {
  if (r.status === 'ok') return { utc: r.utc, offsetSeconds: r.offsetSeconds, resolution: 'unique' }
  if (r.status === 'ambiguous') {
    if (choice !== 'earlier' && choice !== 'later') return null
    const c = choice === 'earlier' ? r.candidates[0] : r.candidates[r.candidates.length - 1]
    return { utc: c.utc, offsetSeconds: c.offsetSeconds, resolution: 'ambiguous-chosen' }
  }
  if (r.status === 'nonexistent') {
    if (choice !== 'offset-before' && choice !== 'offset-after') return null
    const c = r.candidates.find(x => x.rule === choice)!
    return { utc: c.utc, offsetSeconds: c.offsetSeconds, resolution: 'nonexistent-chosen' }
  }
  return null
}

export { formatOffset } from './format'
