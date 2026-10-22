// ============================================================
// SCROLL ALIGNMENT — Local birth time → UTC
// Resolves a wall-clock time in an IANA zone to the exact UTC
// instant(s) it can mean, using the bundled IANA tz table
// (data/tz-transitions.json, with backzone history). Handles three cases explicitly:
//   ok          — exactly one instant
//   ambiguous   — the clock showed this time twice (clocks fell back)
//   nonexistent — the clock skipped this time (clocks sprang forward)
// Pure and deterministic for a given tz database version.
// ============================================================

import { readFileSync } from 'fs'
import path from 'path'
import type { LocalTimeResolution, TimeChoice } from './types'

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^(\d{2}):(\d{2})$/

export const MIN_YEAR = 1850
export const MAX_YEAR = 2040   // end of the bundled tz table

// ─── Time-zone table ──────────────────────────────────────────
// Built by scripts/build-tz.py from the IANA database WITH backzone history.
// Node's built-in ICU zone data drops that history, which silently gives many
// places a neighbour's rules before 1970 (e.g. Stockholm 1947 → Berlin's DST).

interface TzTable { tzdb: string; range: [string, string]; zones: Record<string, { t: number[]; o: number[] }> }
let table: TzTable | null = null

function tz(): TzTable {
  if (!table) table = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'tz-transitions.json'), 'utf8')) as TzTable
  return table
}

/** True when this IANA zone is in Scroll's table. */
export function isValidTimeZone(timeZone: string): boolean {
  return Object.prototype.hasOwnProperty.call(tz().zones, timeZone)
}

/** UTC offset (seconds, east-positive) in force at a UTC instant. */
export function offsetSecondsAt(utcMs: number, timeZone: string): number {
  const z = tz().zones[timeZone]
  const s = Math.floor(utcMs / 1000)
  let lo = 0, hi = z.t.length - 1
  if (s < z.t[0]) return z.o[0]
  while (lo < hi) {               // last transition at or before s
    const mid = (lo + hi + 1) >> 1
    if (z.t[mid] <= s) lo = mid; else hi = mid - 1
  }
  return z.o[lo]
}

function wallClockMs(utcMs: number, timeZone: string): number {
  return utcMs + offsetSecondsAt(utcMs, timeZone) * 1000
}

/** Version of the IANA tz database used (e.g. "2026e+backzone"). */
export function tzdbVersion(): string {
  return `${tz().tzdb}+backzone`
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
