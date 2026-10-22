// ============================================================
// SCROLL ALIGNMENT — Astrocartography types
// Pure data shapes shared by the server calculation layer, the
// API routes and the My Map page. Nothing here imports AI code.
// ============================================================

import type { FeatureCollection, LineString, MultiLineString } from 'geojson'

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'

/** The four angular lines of astrocartography. */
export type AngleName = 'MC' | 'IC' | 'ASC' | 'DSC'

/**
 * How sure the person is about their birth time.
 * - exact:       from a birth certificate or hospital record
 * - approximate: within a stated number of minutes
 * - unknown:     no usable time; angular lines cannot be drawn
 */
export type BirthTimeAccuracy = 'exact' | 'approximate' | 'unknown'

/** A place from the bundled GeoNames dataset, resolved on the server. */
export interface Place {
  id: number              // GeoNames id
  name: string
  admin1: string          // first-level admin code (e.g. "NY"); may be numeric or empty
  country: string         // ISO 3166-1 alpha-2
  countryName: string
  population: number
  lat: number
  lon: number             // east-positive degrees
  timeZone: string        // IANA identifier, e.g. "America/New_York"
}

/** How a local wall-clock birth time maps to UTC. */
export type LocalTimeResolution =
  | { status: 'ok'; utc: string; offsetSeconds: number; lmtWarning?: boolean }
  | { status: 'ambiguous'; candidates: { utc: string; offsetSeconds: number }[] }
  | {
      status: 'nonexistent'
      offsetBeforeSeconds: number
      offsetAfterSeconds: number
      candidates: { utc: string; offsetSeconds: number; rule: 'offset-before' | 'offset-after' }[]
    }
  | { status: 'invalid'; reason: string }

/** Which reading the person chose when a local time was ambiguous or skipped. */
export type TimeChoice = 'earlier' | 'later' | 'offset-before' | 'offset-after'

/**
 * The confirmed birth record. Written only by the server
 * (POST /api/birth/confirm); the database trigger stops browsers
 * from changing it. Stored at user_profiles.profile.birthChart.
 */
export interface BirthChartRecord {
  schema: 1
  place: Place
  localDate: string                 // YYYY-MM-DD as written on the record
  localTime: string | null          // HH:MM, null when unknown
  timeAccuracy: BirthTimeAccuracy
  approxMinutes: number | null      // ± minutes when approximate
  utc: string | null                // resolved instant, null when time unknown
  offsetSeconds: number | null      // UTC offset applied
  resolution: 'unique' | 'ambiguous-chosen' | 'nonexistent-chosen' | 'time-unknown'
  timeChoice: TimeChoice | null
  lmtWarning: boolean               // zone was on local mean time at that date
  tzdbVersion: string               // IANA tz database version used for the conversion
  confirmedAt: string
}

export interface BodyPosition {
  body: PlanetName
  raHours: number       // apparent geocentric right ascension, true equator & equinox of date
  decDeg: number        // apparent geocentric declination, same frame
  distanceAu: number
}

export interface LineProperties {
  body: PlanetName
  angle: AngleName
}

export type AstroLineCollection = FeatureCollection<LineString | MultiLineString, LineProperties>

/** Everything that defines a calculation. Part of the cache key. */
export interface CalculationConventions {
  frame: string
  siderealTime: string
  horizon: string
  lineMethod: string
  longitude: string
  bodies: PlanetName[]
  latitudeSampleDeg: number
  displayLatitudeLimitDeg: number
}

export interface NatalMapResult {
  status: 'ok'
  instantUtc: string
  gastHours: number
  positions: BodyPosition[]
  lines: AstroLineCollection
  uncertainty: { minutes: number; longitudeDeg: number } | null
  conventions: CalculationConventions
  engine: { name: string; version: string }
  tzdbVersion: string
  cacheKey: string
  cached: boolean
  computedAt: string
}

export interface NatalMapUnavailable {
  status: 'time-unknown' | 'not-confirmed'
  message: string
}

export interface LineDistance {
  body: PlanetName
  angle: AngleName
  km: number
  nearestLat: number
  nearestLon: number
}

/**
 * PHASE 2/3 INTEGRATION POINT — not built yet.
 * Any angular (line-based) fact is only valid for one exact instant.
 * Location-aware scrolls must carry the instant they were computed for,
 * never a whole-day snapshot.
 */
export interface LocationContext {
  instantUtc: string                // the exact moment the angles were computed for
  place: Pick<Place, 'id' | 'name' | 'country' | 'lat' | 'lon' | 'timeZone'>
  natalLines: LineDistance[]        // location-specific: distance from natal lines
  transitContacts?: unknown[]       // global (location-independent) — Phase 2
  transitAngles?: unknown[]         // location-specific, instant-specific — Phase 2
  cacheKey: string
}
