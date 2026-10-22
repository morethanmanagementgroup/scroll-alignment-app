// ============================================================
// SCROLL ALIGNMENT — Natal map orchestration (server-side)
// Deterministic: same inputs + conventions + engine → same output.
// ============================================================

import { createHash } from 'crypto'
import { CONVENTIONS, ENGINE, GEOMETRY_VERSION } from './conventions'
import { allPositions, gastHours } from './positions'
import { buildLines, uncertaintyLongitudeDeg } from './geometry'
import type { BirthChartRecord, NatalMapResult } from './types'

/** Everything that can change the output. Hashed into the cache key. */
export function natalCacheInputs(userId: string, chart: BirthChartRecord) {
  return {
    userId,
    instantUtc: chart.utc,
    timeAccuracy: chart.timeAccuracy,
    approxMinutes: chart.approxMinutes,
    // The place does not move the lines, but it is part of the confirmed
    // input, and a changed place must never be served a stale result.
    place: { id: chart.place.id, lat: chart.place.lat, lon: chart.place.lon, timeZone: chart.place.timeZone },
    localDate: chart.localDate,
    localTime: chart.localTime,
    timeChoice: chart.timeChoice,
    tzdbVersion: chart.tzdbVersion,
    conventions: CONVENTIONS,
    geometryVersion: GEOMETRY_VERSION,
    engine: ENGINE,
  }
}

export function cacheKeyFor(inputs: unknown): string {
  return createHash('sha256').update(stableStringify(inputs)).digest('hex')
}

export function computeNatalMap(chart: BirthChartRecord, cacheKey: string): NatalMapResult {
  if (!chart.utc) throw new Error('computeNatalMap requires a resolved birth instant')
  const instant = new Date(chart.utc)
  const positions = allPositions(instant)
  const gast = gastHours(instant)
  const lines = buildLines(positions, gast)
  const minutes = chart.timeAccuracy === 'approximate' ? (chart.approxMinutes ?? 30) : 0
  return {
    status: 'ok',
    instantUtc: chart.utc,
    gastHours: gast,
    positions,
    lines,
    uncertainty: minutes > 0 ? { minutes, longitudeDeg: uncertaintyLongitudeDeg(minutes) } : null,
    conventions: CONVENTIONS,
    engine: { name: ENGINE.name, version: ENGINE.version },
    tzdbVersion: chart.tzdbVersion,
    cacheKey,
    cached: false,
    computedAt: new Date().toISOString(),
  }
}

/** JSON.stringify with sorted keys, so equal objects hash equally. */
export function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v)
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']'
  const o = v as Record<string, unknown>
  return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + stableStringify(o[k])).join(',') + '}'
}
