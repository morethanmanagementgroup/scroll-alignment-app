// ============================================================
// POST /api/birth/confirm — save a member's confirmed birth details
//
// Body: {
//   placeId: number,                 // from /api/places/search
//   date: 'YYYY-MM-DD',
//   time: 'HH:MM' | null,
//   timeAccuracy: 'exact' | 'approximate' | 'unknown',
//   approxMinutes?: 15 | 30 | 60 | 120,
//   timeChoice?: 'earlier' | 'later' | 'offset-before' | 'offset-after',
//   dryRun?: boolean                 // resolve only, don't save
// }
//
// The server looks up the place (coordinates + IANA zone) itself and
// converts the local time to UTC with the tz database. If the local
// time was repeated (clocks fell back) or skipped (clocks sprang
// forward), it returns 409 with both readings and saves nothing until
// the member picks one.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireUser, updateServerFields, getProfile } from '@/lib/server/auth'
import { getPlaceById } from '@/lib/places'
import { chooseInstant, resolveLocalTime, tzdbVersion } from '@/lib/astro/time'
import { formatOffset } from '@/lib/astro/format'
import type { BirthChartRecord, BirthTimeAccuracy, TimeChoice } from '@/lib/astro/types'

export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

const ACCURACIES: BirthTimeAccuracy[] = ['exact', 'approximate', 'unknown']
const APPROX: number[] = [15, 30, 60, 120]
const CHOICES: TimeChoice[] = ['earlier', 'later', 'offset-before', 'offset-after']

export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const place = typeof body.placeId === 'number' ? getPlaceById(body.placeId) : null
  if (!place) return NextResponse.json({ error: 'Choose your birthplace from the list.' }, { status: 400 })

  const date = String(body.date ?? '')
  const timeAccuracy = body.timeAccuracy as BirthTimeAccuracy
  if (!ACCURACIES.includes(timeAccuracy)) {
    return NextResponse.json({ error: 'Choose how accurate your birth time is.' }, { status: 400 })
  }
  const time = timeAccuracy === 'unknown' ? null : String(body.time ?? '')
  const approxMinutes = timeAccuracy === 'approximate'
    ? (APPROX.includes(Number(body.approxMinutes)) ? Number(body.approxMinutes) : 30)
    : null
  const timeChoice: TimeChoice | null = CHOICES.includes(body.timeChoice) ? body.timeChoice : null

  // Validate the date even when the time is unknown (noon is never skipped in a way that changes the date check).
  const resolution = resolveLocalTime(date, time ?? '12:00', place.timeZone)
  if (resolution.status === 'invalid') {
    return NextResponse.json({ error: resolution.reason }, { status: 400 })
  }

  let utc: string | null = null
  let offsetSeconds: number | null = null
  let resolutionKind: BirthChartRecord['resolution'] = 'time-unknown'
  let lmtWarning = false

  if (time !== null) {
    const picked = chooseInstant(resolution, timeChoice)
    if (!picked) {
      // Ambiguous or skipped and no (valid) choice yet: explain both readings.
      const options = resolution.status === 'ambiguous'
        ? resolution.candidates.map((c, i) => ({
            choice: i === 0 ? 'earlier' : 'later',
            utc: c.utc,
            offset: formatOffset(c.offsetSeconds),
            label: i === 0 ? 'The first time the clock showed this (before clocks went back)'
                           : 'The second time the clock showed this (after clocks went back)',
          }))
        : resolution.status === 'nonexistent'
          ? resolution.candidates.map(c => ({
              choice: c.rule,
              utc: c.utc,
              offset: formatOffset(c.offsetSeconds),
              label: c.rule === 'offset-before'
                ? `Read it on the clock time in use before the change (${formatOffset(c.offsetSeconds)})`
                : `Read it on the clock time in use after the change (${formatOffset(c.offsetSeconds)})`,
            }))
          : []
      return NextResponse.json({
        status: resolution.status,
        message: resolution.status === 'ambiguous'
          ? `In ${place.timeZone}, ${time} on ${date} happened twice because clocks were set back. Which one was it?`
          : `In ${place.timeZone}, clocks jumped forward on ${date}, so ${time} never appeared on local clocks. Records sometimes use the old clock time. Which reading matches your record?`,
        options,
      }, { status: 409 })
    }
    utc = picked.utc
    offsetSeconds = picked.offsetSeconds
    resolutionKind = picked.resolution
    lmtWarning = resolution.status === 'ok' && resolution.lmtWarning === true
  }

  const record: BirthChartRecord = {
    schema: 1,
    place,
    localDate: date,
    localTime: time,
    timeAccuracy,
    approxMinutes,
    utc,
    offsetSeconds,
    resolution: resolutionKind,
    timeChoice: resolutionKind === 'ambiguous-chosen' || resolutionKind === 'nonexistent-chosen' ? timeChoice : null,
    lmtWarning,
    tzdbVersion: tzdbVersion(),
    confirmedAt: new Date().toISOString(),
  }

  if (body.dryRun === true) return NextResponse.json({ status: 'ok', record, saved: false })

  if (!(await getProfile(auth.user.id))) {
    return NextResponse.json({ error: 'Your profile has not synced yet. Open the Daily Scroll once, then try again.' }, { status: 409 })
  }
  // birthChart is server-owned; the legacy display fields are kept in step.
  await updateServerFields(auth.user.id, {
    birthChart: record,
    birthDate: date,
    birthTime: time ?? undefined,
    birthCity: place.name,
    birthRegion: place.admin1,
    birthCountry: place.countryName,
  })
  return NextResponse.json({ status: 'ok', record, saved: true })
}
