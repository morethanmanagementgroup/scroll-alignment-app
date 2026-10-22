import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildLines, greatCircleKm, horizonHourAngle, horizonLatitudeLimit, lineDistances,
  lineLongitudeAt, mcLongitude, norm180, splitAtAntimeridian,
} from './geometry'
import type { BodyPosition } from './types'

const pos = (raHours: number, decDeg: number, body: BodyPosition['body'] = 'Venus'): BodyPosition =>
  ({ body, raHours, decDeg, distanceAu: 1 })

test('norm180 wraps into (−180, 180]', () => {
  assert.equal(norm180(180), 180)
  assert.equal(norm180(-180), 180)
  assert.equal(norm180(190), -170)
  assert.equal(norm180(-190), 170)
  assert.equal(norm180(720 + 45), 45)
})

test('MC/IC longitudes wrap across the antimeridian', () => {
  // RA 23h, GAST 1h → α − θ = 330° → −30°
  assert.equal(mcLongitude(23, 1), -30)
  assert.equal(lineLongitudeAt('IC', pos(23, 10), 1, 0), 150)
  // RA 0.5h, GAST 12.5h → −180° → 180°
  assert.equal(mcLongitude(0.5, 12.5), 180)
})

test('horizon lines meet MC/IC at the polar limit, and vanish beyond it', () => {
  const p = pos(6, 20)
  const limit = horizonLatitudeLimit(20)                      // 70°
  assert.equal(limit, 70)
  assert.ok(Math.abs(horizonHourAngle(limit, 20)! - 180) < 1e-5)  // at +70° both meet the IC
  assert.ok(Math.abs(horizonHourAngle(-limit, 20)! - 0) < 1e-5)   // at −70° both meet the MC
  assert.equal(horizonHourAngle(75, 20), null)                // circumpolar there: no line
  assert.equal(lineLongitudeAt('ASC', p, 0, 75), null)
})

test('at the equator a body rises 90° east of where it culminates', () => {
  const p = pos(3, 15)
  const mc = mcLongitude(3, 0)
  assert.ok(Math.abs(norm180(lineLongitudeAt('ASC', p, 0, 0)! - (mc - 90))) < 1e-9)
  assert.ok(Math.abs(norm180(lineLongitudeAt('DSC', p, 0, 0)! - (mc + 90))) < 1e-9)
})

test('antimeridian split produces continuous segments ending at ±180', () => {
  const segs = splitAtAntimeridian([[170, 0], [179, 1], [-179, 2], [-170, 3]])
  assert.equal(segs.length, 2)
  assert.equal(segs[0][segs[0].length - 1][0], 180)
  assert.equal(segs[1][0][0], -180)
  assert.ok(Math.abs(segs[0][segs[0].length - 1][1] - 1.5) < 1e-9)
})

test('every built line stays inside (−180, 180] and never jumps more than 180°', () => {
  const positions = [pos(23.9, 28), pos(11.95, -27, 'Moon'), pos(0.05, 0.001, 'Sun')]
  const fc = buildLines(positions, 12.03)
  assert.equal(fc.features.length, 12)
  for (const f of fc.features) {
    const parts = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const seg of parts) for (let i = 0; i < seg.length; i++) {
      assert.ok(seg[i][0] > -180 - 1e-9 && seg[i][0] <= 180 + 1e-9)
      if (i) assert.ok(Math.abs(seg[i][0] - seg[i - 1][0]) <= 180)
    }
  }
})

test('distance to an MC line equals the analytic cross-track distance', () => {
  const p = pos(0, 0)
  const d = lineDistances(40, 10, [p], 0).find(x => x.angle === 'MC')!   // line at 0°E
  const expected = Math.asin(Math.sin(10 * Math.PI / 180) * Math.cos(40 * Math.PI / 180)) * 6371.0088
  assert.ok(Math.abs(d.km - expected) < 0.1, `${d.km} vs ${expected}`)
})

test('a point on a line is ~0 km from it, including across the antimeridian', () => {
  const p = pos(12, 23)
  const gast = 0                                     // MC at 180°
  for (const lat of [-40, 0, 35, 60]) {
    for (const angle of ['ASC', 'DSC'] as const) {
      const lon = lineLongitudeAt(angle, p, gast, lat)!
      const d = lineDistances(lat, lon, [p], gast).find(x => x.angle === angle)!
      assert.ok(d.km < 1, `${angle} at ${lat}: ${d.km} km`)
    }
  }
  const near = lineDistances(10, -179.9, [p], gast).find(x => x.angle === 'MC')!
  assert.ok(near.km < 12, `antimeridian MC distance ${near.km}`)
})

test('great-circle distance sanity: London–New York ≈ 5,570 km', () => {
  const d = greatCircleKm(51.5074, -0.1278, 40.7128, -74.006)
  assert.ok(Math.abs(d - 5570) < 15, String(d))
})
