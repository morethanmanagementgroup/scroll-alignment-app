// ============================================================
// Dump Scroll's own calculation results for the validation set.
//   npx tsx validation/engine-dump.ts > validation/out/engine.json
// The reference scripts read the same instants from cases.json.
// ============================================================

import { readFileSync } from 'fs'
import path from 'path'
import { allPositions, gastHours } from '../lib/astro/positions'
import { lineLongitudeAt, lineDistances, horizonLatitudeLimit, buildLines } from '../lib/astro/geometry'
import { ANGLES } from '../lib/astro/conventions'

const cases = JSON.parse(readFileSync(path.join(__dirname, 'cases.json'), 'utf8'))

const out = cases.instants.map((utc: string) => {
  const t = new Date(utc)
  const positions = allPositions(t)
  const gast = gastHours(t)
  const lines: Record<string, Record<string, Record<string, number | null>>> = {}
  for (const p of positions) {
    lines[p.body] = {}
    for (const a of ANGLES) {
      lines[p.body][a] = {}
      for (const lat of cases.latitudes as number[]) lines[p.body][a][String(lat)] = lineLongitudeAt(a, p, gast, lat)
    }
  }
  const limits = Object.fromEntries(positions.map(p => [p.body, horizonLatitudeLimit(p.decDeg)]))
  const distances = (cases.cities as { name: string; lat: number; lon: number }[]).map(c => ({
    city: c.name, lines: lineDistances(c.lat, c.lon, positions, gast),
  }))
  // Antimeridian handling of the display geometry
  const fc = buildLines(positions, gast)
  let split = 0, maxJump = 0, outOfRange = 0
  for (const f of fc.features) {
    const parts = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates
    if (parts.length > 1) split++
    for (const seg of parts) for (let i = 0; i < seg.length; i++) {
      if (seg[i][0] <= -180 - 1e-9 || seg[i][0] > 180 + 1e-9) outOfRange++
      if (i) maxJump = Math.max(maxJump, Math.abs(seg[i][0] - seg[i - 1][0]))
    }
  }
  return { utc, gastHours: gast, positions, lines, limits, distances, display: { features: fc.features.length, split, maxJump, outOfRange } }
})

process.stdout.write(JSON.stringify({ engine: 'astronomy-engine 2.1.19', results: out }))
