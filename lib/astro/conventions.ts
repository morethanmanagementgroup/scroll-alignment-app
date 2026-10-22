// ============================================================
// SCROLL ALIGNMENT — Calculation conventions
// Change any value here and every cached map is recomputed,
// because these values are part of the cache key.
// ============================================================

import type { AngleName, CalculationConventions, PlanetName } from './types'

export const BODIES: PlanetName[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
]

export const ANGLES: AngleName[] = ['MC', 'IC', 'ASC', 'DSC']

/** Bump when the line-building code changes in a way that alters output. */
export const GEOMETRY_VERSION = '1'

export const ENGINE = {
  name: 'astronomy-engine',
  // Keep in sync with package.json (pinned exactly).
  version: '2.1.19',
} as const

export const CONVENTIONS: CalculationConventions = {
  frame: 'geocentric apparent position (light-time + aberration), true equator and equinox of date',
  siderealTime: 'Greenwich apparent sidereal time (GAST)',
  horizon: 'geometric: altitude 0° from the geocentre, no refraction, no parallax',
  lineMethod: 'in mundo (from right ascension and declination), not zodiacal longitude',
  longitude: 'east-positive degrees in (-180, 180]',
  bodies: BODIES,
  latitudeSampleDeg: 1,
  displayLatitudeLimitDeg: 85,
}

/** Mean Earth radius (IUGG), km. Used for great-circle distances. */
export const EARTH_RADIUS_KM = 6371.0088
