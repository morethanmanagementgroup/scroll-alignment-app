// ============================================================
// SCROLL ALIGNMENT — Build the birthplace / city dataset
//
// Produces data/cities.json: every GeoNames place with 1,000+
// people, its coordinates, and the IANA time zone at that point.
//
// This is a one-off, offline build step. Its two inputs are NOT app
// dependencies (geo-tz alone is ~70 MB), so run it with:
//
//   npx -y -p all-the-cities@3.1.0 -p geo-tz@8.1.10 node scripts/build-cities.mjs
//
// Sources and licences
// - City names, coordinates, population: GeoNames (CC BY 4.0) via the
//   all-the-cities npm package (MIT). Attribution shown on the map page.
// - Time-zone boundaries: timezone-boundary-builder (ODbL, OpenStreetMap)
//   via geo-tz (MIT), using the "comprehensive" product, which keeps
//   distinct IANA identifiers so pre-1970 local times resolve correctly.
// ============================================================

import { createRequire } from 'node:module'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(join(process.cwd(), 'noop.js'))
const cities = require('all-the-cities')
const { find } = require('geo-tz/all')
// package.json is not an exported subpath of these packages, so read it from disk.
const pkgOf = name => JSON.parse(readFileSync(join(dirname(require.resolve(name)).split(`node_modules/${name}`)[0], 'node_modules', name, 'package.json'), 'utf8'))
const citiesPkg = pkgOf('all-the-cities')
const geoTzPkg = pkgOf('geo-tz')

const here = dirname(fileURLToPath(import.meta.url))
const outPath = join(here, '..', 'data', 'cities.json')

const zones = []
const zoneIndex = new Map()
const rows = []
let noZone = 0

for (const c of cities) {
  const [lon, lat] = c.loc.coordinates
  const found = find(lat, lon)
  if (!found || found.length === 0) { noZone++; continue }
  // Ocean / Etc zones are not usable for a birthplace on land.
  const tz = found.find(z => !z.startsWith('Etc/')) ?? found[0]
  if (!zoneIndex.has(tz)) { zoneIndex.set(tz, zones.length); zones.push(tz) }
  rows.push([
    c.cityId,
    c.name,
    c.altName || '',
    c.country,
    c.adminCode || '',
    c.population,
    Math.round(lat * 1e5) / 1e5,
    Math.round(lon * 1e5) / 1e5,
    zoneIndex.get(tz),
  ])
}

// Largest places first, so prefix search returns the likeliest match first.
rows.sort((a, b) => b[5] - a[5])

const out = {
  format: 'scroll-cities/1',
  columns: ['id', 'name', 'altName', 'country', 'admin1', 'population', 'lat', 'lon', 'zone'],
  sources: {
    places: `GeoNames cities1000 via all-the-cities@${citiesPkg.version} (CC BY 4.0)`,
    zones: `timezone-boundary-builder via geo-tz@${geoTzPkg.version} comprehensive dataset (ODbL)`,
  },
  builtAt: new Date().toISOString(),
  zones,
  rows,
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(out))
console.log(`Wrote ${rows.length} places, ${zones.length} zones (${noZone} skipped without zone) to ${outPath}`)
