// ============================================================
// SCROLL ALIGNMENT — Planetary positions (server-side)
// The only file that talks to the astronomy engine. Everything
// downstream works from {RA, Dec, GAST}, so the engine can be
// swapped (e.g. for Swiss Ephemeris) without touching geometry.
// ============================================================

import * as Astronomy from 'astronomy-engine'
import { BODIES } from './conventions'
import type { BodyPosition, PlanetName } from './types'

const BODY_MAP: Record<PlanetName, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
}

/**
 * Apparent geocentric RA/Dec on the true equator and equinox of date:
 * light-time corrected (always, by GeoVector), aberration corrected,
 * then rotated J2000 → of-date (precession + nutation).
 */
export function apparentGeocentric(body: PlanetName, instant: Date): BodyPosition {
  const t = Astronomy.MakeTime(instant)
  const eqj = Astronomy.GeoVector(BODY_MAP[body], t, true)
  const eqd = Astronomy.RotateVector(Astronomy.Rotation_EQJ_EQD(t), eqj)
  const eq = Astronomy.EquatorFromVector(eqd)
  return { body, raHours: eq.ra, decDeg: eq.dec, distanceAu: eq.dist }
}

/** Greenwich apparent sidereal time, hours in [0, 24). */
export function gastHours(instant: Date): number {
  return Astronomy.SiderealTime(Astronomy.MakeTime(instant))
}

export function allPositions(instant: Date, bodies: PlanetName[] = BODIES): BodyPosition[] {
  return bodies.map(b => apparentGeocentric(b, instant))
}
