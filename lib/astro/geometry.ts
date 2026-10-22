// ============================================================
// SCROLL ALIGNMENT — Astrocartography line geometry (pure math)
// Works only from {RA, Dec} per body and GAST, so it runs the same
// on the server and in the browser and has no engine dependency.
//
// For a body at right ascension α and declination δ, with Greenwich
// apparent sidereal time θ (all in degrees), at geographic longitude λ
// (east-positive) its local hour angle is  H = θ + λ − α.
//   MC  (upper culmination):  H = 0     →  λ = α − θ
//   IC  (lower culmination):  H = 180°  →  λ = α − θ + 180°
//   ASC / DSC (on the geometric horizon, altitude 0):
//        cos H₀ = −tan φ · tan δ,   ASC: H = −H₀,  DSC: H = +H₀
// ASC/DSC exist only where |tan φ · tan δ| ≤ 1, i.e. |φ| ≤ 90° − |δ|;
// there the two curves meet (on the MC or IC meridian).
// ============================================================

import { CONVENTIONS, EARTH_RADIUS_KM } from './conventions'
import type {
  AngleName, AstroLineCollection, BodyPosition, LineDistance, LineProperties,
} from './types'
import type { Feature, LineString, MultiLineString, Position } from 'geojson'

const D2R = Math.PI / 180
const R2D = 180 / Math.PI

/** Normalise to (−180, 180]. */
export function norm180(deg: number): number {
  let x = ((deg % 360) + 360) % 360
  if (x > 180) x -= 360
  return x
}

export function mcLongitude(raHours: number, gastHours: number): number {
  return norm180((raHours - gastHours) * 15)
}

/** Semi-diurnal arc H₀ (deg) at latitude φ, or null where the body never touches the horizon. */
export function horizonHourAngle(latDeg: number, decDeg: number): number | null {
  if (Math.abs(latDeg) >= 90) return null
  const x = -Math.tan(latDeg * D2R) * Math.tan(decDeg * D2R)
  if (x < -1 - 1e-12 || x > 1 + 1e-12) return null
  return Math.acos(Math.max(-1, Math.min(1, x))) * R2D
}

/** The highest |latitude| at which a body with this declination rises and sets. */
export function horizonLatitudeLimit(decDeg: number): number {
  return 90 - Math.abs(decDeg)
}

/** Longitude of a line at a given latitude (MC/IC ignore latitude). Null if the line doesn't reach it. */
export function lineLongitudeAt(angle: AngleName, pos: BodyPosition, gastH: number, latDeg: number): number | null {
  const mc = mcLongitude(pos.raHours, gastH)
  if (angle === 'MC') return mc
  if (angle === 'IC') return norm180(mc + 180)
  const h0 = horizonHourAngle(latDeg, pos.decDeg)
  if (h0 === null) return null
  return norm180(angle === 'ASC' ? mc - h0 : mc + h0)
}

/** Split a polyline wherever it crosses the ±180° meridian, interpolating the crossing point. */
export function splitAtAntimeridian(points: Position[]): Position[][] {
  const out: Position[][] = []
  let cur: Position[] = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (i === 0) { cur.push(p); continue }
    const prev = points[i - 1]
    const dLon = p[0] - prev[0]
    if (Math.abs(dLon) > 180) {
      // Unwrap the next point so the segment is short, find where it hits ±180.
      const edge = prev[0] > 0 ? 180 : -180
      const unwrapped = p[0] + (prev[0] > 0 ? 360 : -360)
      const f = (edge - prev[0]) / (unwrapped - prev[0])
      const lat = prev[1] + f * (p[1] - prev[1])
      cur.push([edge, lat])
      out.push(cur)
      cur = [[-edge, lat], p]
    } else {
      cur.push(p)
    }
  }
  if (cur.length > 1) out.push(cur)
  return out.filter(seg => seg.length > 1)
}

function feature(coords: Position[][], props: LineProperties): Feature<LineString | MultiLineString, LineProperties> {
  return coords.length === 1
    ? { type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: coords[0] } }
    : { type: 'Feature', properties: props, geometry: { type: 'MultiLineString', coordinates: coords } }
}

/** Latitudes to sample for a horizon curve: a regular grid plus the exact limit. */
function horizonLatitudes(decDeg: number, step: number, displayLimit: number): number[] {
  const limit = Math.min(displayLimit, horizonLatitudeLimit(decDeg))
  const lats: number[] = []
  for (let lat = -Math.floor(limit / step) * step; lat <= limit + 1e-9; lat += step) lats.push(lat)
  if (lats[0] > -limit) lats.unshift(-limit)
  if (lats[lats.length - 1] < limit) lats.push(limit)
  return lats
}

/** Build all 40 lines (10 bodies × MC/IC/ASC/DSC) as GeoJSON for display. */
export function buildLines(
  positions: BodyPosition[],
  gastH: number,
  step = CONVENTIONS.latitudeSampleDeg,
  displayLimit = CONVENTIONS.displayLatitudeLimitDeg,
): AstroLineCollection {
  const features: Feature<LineString | MultiLineString, LineProperties>[] = []
  for (const pos of positions) {
    const mc = mcLongitude(pos.raHours, gastH)
    const ic = norm180(mc + 180)
    const meridian = (lon: number): Position[] => {
      const pts: Position[] = []
      for (let lat = -displayLimit; lat <= displayLimit + 1e-9; lat += 5) pts.push([lon, lat])
      return pts
    }
    features.push(feature([meridian(mc)], { body: pos.body, angle: 'MC' }))
    features.push(feature([meridian(ic)], { body: pos.body, angle: 'IC' }))

    const lats = horizonLatitudes(pos.decDeg, step, displayLimit)
    for (const angle of ['ASC', 'DSC'] as AngleName[]) {
      const pts: Position[] = []
      for (const lat of lats) {
        const lon = lineLongitudeAt(angle, pos, gastH, lat)
        if (lon !== null) pts.push([round6(lon), round6(lat)])
      }
      const segs = splitAtAntimeridian(pts)
      if (segs.length) features.push(feature(segs, { body: pos.body, angle }))
    }
  }
  return { type: 'FeatureCollection', features }
}

function round6(x: number) { return Math.round(x * 1e6) / 1e6 }

// ─── Distances ────────────────────────────────────────────────

/** Great-circle distance (km), haversine. */
export function greatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * D2R, p2 = lat2 * D2R
  const dp = p2 - p1
  const dl = norm180(lon2 - lon1) * D2R
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

/**
 * Exact distance to a half-meridian running pole to pole at `lineLon`
 * (an MC or IC line). If the point is more than 90° of longitude away,
 * the nearest point of that half-meridian is a pole.
 */
function distanceToHalfMeridian(lat: number, lon: number, lineLon: number) {
  const dl = norm180(lon - lineLon)
  if (Math.abs(dl) <= 90) {
    const ang = Math.asin(Math.min(1, Math.abs(Math.sin(dl * D2R)) * Math.cos(lat * D2R)))
    // Foot of the perpendicular: latitude where the great circle through the point meets the meridian at right angles.
    const footLat = Math.atan2(Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(dl * D2R)) * R2D
    return { km: ang * EARTH_RADIUS_KM, nearestLat: footLat, nearestLon: lineLon }
  }
  const pole = lat >= 0 ? 90 : -90
  return { km: greatCircleKm(lat, lon, pole, lineLon), nearestLat: pole, nearestLon: lineLon }
}

/**
 * Distance to an ASC/DSC curve. The curve is scanned two ways — evenly in
 * latitude, and evenly in the semi-diurnal arc H₀ (which is dense where the
 * curve runs east–west near its polar tip) — then refined by golden-section
 * search around the best sample.
 */
function distanceToHorizonCurve(lat: number, lon: number, angle: 'ASC' | 'DSC', pos: BodyPosition, gastH: number) {
  const limit = horizonLatitudeLimit(pos.decDeg)
  const mc = mcLongitude(pos.raHours, gastH)
  const tanDec = Math.tan(pos.decDeg * D2R)
  const byLat = (phi: number) => {
    const l = lineLongitudeAt(angle, pos, gastH, phi)
    return l === null ? Infinity : greatCircleKm(lat, lon, phi, l)
  }
  // Point on the curve for a given H₀ (undefined at δ = 0, where the curve is a meridian pair).
  const pointByH0 = (h0: number): [number, number] => [
    Math.atan(-Math.cos(h0 * D2R) / tanDec) * R2D,
    norm180(angle === 'ASC' ? mc - h0 : mc + h0),
  ]
  const byH0 = (h0: number) => { const [phi, l] = pointByH0(h0); return greatCircleKm(lat, lon, phi, l) }

  const golden = (f: (x: number) => number, a: number, b: number) => {
    const g = (Math.sqrt(5) - 1) / 2
    for (let i = 0; i < 60; i++) {
      const c = b - g * (b - a), d = a + g * (b - a)
      if (f(c) < f(d)) b = d; else a = c
    }
    return (a + b) / 2
  }

  // Scan in latitude.
  const stepLat = 0.25
  let bestLat = -limit, bestLatD = Infinity
  for (let phi = -limit; phi <= limit + 1e-9; phi += stepLat) {
    const p = Math.min(phi, limit), d = byLat(p)
    if (d < bestLatD) { bestLatD = d; bestLat = p }
  }
  const refLat = golden(byLat, Math.max(-limit, bestLat - stepLat), Math.min(limit, bestLat + stepLat))
  let best = { km: byLat(refLat), nearestLat: refLat, nearestLon: lineLongitudeAt(angle, pos, gastH, refLat) ?? lon }
  if (bestLatD < best.km) best = { km: bestLatD, nearestLat: bestLat, nearestLon: lineLongitudeAt(angle, pos, gastH, bestLat) ?? lon }

  // Scan in H₀ (skipped when δ ≈ 0: the curve is then a meridian and latitude scanning is exact).
  if (Math.abs(tanDec) > 1e-9) {
    const stepH = 0.5
    let bestH = 0, bestHD = Infinity
    for (let h = 0; h <= 180 + 1e-9; h += stepH) {
      const d = byH0(Math.min(h, 180))
      if (d < bestHD) { bestHD = d; bestH = Math.min(h, 180) }
    }
    const refH = golden(byH0, Math.max(0, bestH - stepH), Math.min(180, bestH + stepH))
    for (const h of [refH, bestH]) {
      const d = byH0(h)
      if (d < best.km) { const [phi, l] = pointByH0(h); best = { km: d, nearestLat: phi, nearestLon: l } }
    }
  }
  return best
}

/** Distance (km) from a point to every line, nearest first. */
export function lineDistances(lat: number, lon: number, positions: BodyPosition[], gastH: number): LineDistance[] {
  const out: LineDistance[] = []
  for (const pos of positions) {
    const mc = mcLongitude(pos.raHours, gastH)
    out.push({ body: pos.body, angle: 'MC', ...distanceToHalfMeridian(lat, lon, mc) })
    out.push({ body: pos.body, angle: 'IC', ...distanceToHalfMeridian(lat, lon, norm180(mc + 180)) })
    out.push({ body: pos.body, angle: 'ASC', ...distanceToHorizonCurve(lat, lon, 'ASC', pos, gastH) })
    out.push({ body: pos.body, angle: 'DSC', ...distanceToHorizonCurve(lat, lon, 'DSC', pos, gastH) })
  }
  return out
    .map(d => ({ ...d, km: Math.round(d.km * 10) / 10 }))
    .sort((x, y) => x.km - y.km)
}

/** How far (degrees of longitude) a birth-time uncertainty of ±minutes moves every line. */
export function uncertaintyLongitudeDeg(minutes: number): number {
  // Earth turns 360° per sidereal day ≈ 1.0027379 × 360° per solar day.
  return minutes * (360 * 1.00273790935) / 1440
}
