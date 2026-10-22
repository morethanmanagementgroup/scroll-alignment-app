// Swiss Ephemeris reference (built-in Moshier ephemeris, no data files).
// Used ONLY for validation; not part of the app (AGPL — not shipped).
//   npm i --no-save sweph@2.10.3-7 && node validation/swe-dump.js > validation/out/swe.json
const fs = require('fs')
const path = require('path')
const swe = require('sweph')
const C = swe.constants

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'cases.json'), 'utf8'))
const BODIES = { Sun: C.SE_SUN, Moon: C.SE_MOON, Mercury: C.SE_MERCURY, Venus: C.SE_VENUS, Mars: C.SE_MARS,
  Jupiter: C.SE_JUPITER, Saturn: C.SE_SATURN, Uranus: C.SE_URANUS, Neptune: C.SE_NEPTUNE, Pluto: C.SE_PLUTO }

const results = cases.instants.map(utc => {
  const d = new Date(utc)
  const jd = swe.utc_to_jd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), C.SE_GREG_CAL).data[1] // [jd_et, jd_ut]
  const positions = {}
  for (const [name, id] of Object.entries(BODIES)) {
    // Default = apparent (light-time, aberration, deflection), true equator & equinox of date.
    const r = swe.calc_ut(jd, id, C.SEFLG_MOSEPH | C.SEFLG_EQUATORIAL)
    positions[name] = { raHours: r.data[0] / 15, decDeg: r.data[1] }
  }
  return { utc, gastHours: swe.sidtime(jd), positions }
})
process.stdout.write(JSON.stringify({ reference: `Swiss Ephemeris ${swe.version()} (Moshier)`, results }))
