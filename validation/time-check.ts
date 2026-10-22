// Compare Scroll's local-time resolution with the Python zoneinfo reference.
//   npx tsx validation/time-check.ts
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { resolveLocalTime, tzdbVersion } from '../lib/astro/time'

const ref = JSON.parse(readFileSync(path.join(__dirname, 'out', 'time-cases.json'), 'utf8'))
let agree = 0
const byStatus: Record<string, { n: number; agree: number }> = {}
const mismatches: unknown[] = []
for (const c of ref.cases) {
  const r = resolveLocalTime(c.date, c.time, c.zone)
  const utcs = r.status === 'ok' ? [r.utc] : r.status === 'ambiguous' ? r.candidates.map(x => x.utc) : []
  const same = r.status === c.status && JSON.stringify(utcs) === JSON.stringify(c.utc)
  byStatus[c.status] ??= { n: 0, agree: 0 }
  byStatus[c.status].n++
  if (same) { agree++; byStatus[c.status].agree++ } else mismatches.push({ ...c, ours: { status: r.status, utc: utcs } })
}
// How often would Node's built-in ICU zone data have produced a different
// instant? (It lacks IANA backzone history.) Checked on the reference's
// unambiguous answers: does ICU's wall clock at that UTC instant match the input?
let icuWrong = 0, icuWrongPre1970 = 0
for (const c of ref.cases) {
  if (c.status !== 'ok') continue
  try {
    const f = new Intl.DateTimeFormat('sv-SE', { timeZone: c.zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    const wall = f.format(new Date(c.utc[0])).replace(' ', 'T')
    if (wall !== `${c.date}T${c.time}`) { icuWrong++; if (c.date < '1970') icuWrongPre1970++ }
  } catch { icuWrong++ }
}
const summary = { nodeIcu: { tz: process.versions.tz, wrong: icuWrong, wrongPre1970: icuWrongPre1970, of: byStatus.ok?.n ?? 0 }, reference: ref.reference, ours: `bundled IANA table ${tzdbVersion()} (data/tz-transitions.json)`, total: ref.cases.length, agree, byStatus, mismatches }
writeFileSync(path.join(__dirname, 'out', 'time-check.json'), JSON.stringify(summary, null, 1))
console.log(JSON.stringify({ ...summary, mismatches: mismatches.length }, null, 1))
