// ============================================================
// GET /api/astro/natal — the signed-in member's natal map
// Paid members only (checked server-side). Reads the server-owned
// birthChart, then serves a cached result keyed by the complete
// calculation inputs, conventions and engine version — or computes,
// stores and returns a fresh one. No AI is involved.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, requirePaidUser } from '@/lib/server/auth'
import { cacheKeyFor, computeNatalMap, natalCacheInputs } from '@/lib/astro/natal'
import { CONVENTIONS, ENGINE } from '@/lib/astro/conventions'
import { UNKNOWN_TIME_MESSAGE } from '@/lib/astro/explanations'
import type { BirthChartRecord, NatalMapResult } from '@/lib/astro/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requirePaidUser(req)
  if (!auth.ok) return auth.response

  const chart = auth.profile?.birthChart as BirthChartRecord | undefined
  if (!chart || chart.schema !== 1) {
    return NextResponse.json({ status: 'not-confirmed', message: 'Confirm your birth details to draw your map.' })
  }
  if (chart.timeAccuracy === 'unknown' || !chart.utc) {
    return NextResponse.json({ status: 'time-unknown', message: UNKNOWN_TIME_MESSAGE, birthChart: chart })
  }

  const inputs = natalCacheInputs(auth.user.id, chart)
  const cacheKey = cacheKeyFor(inputs)
  const db = getAdminClient()

  // Cache read. A missing table (migration not yet applied) is not fatal.
  try {
    const { data } = await db.from('astro_natal_cache')
      .select('result').eq('user_id', auth.user.id).eq('cache_key', cacheKey).maybeSingle()
    if (data?.result) {
      return NextResponse.json({ ...(data.result as NatalMapResult), cached: true, birthChart: chart })
    }
  } catch { /* fall through to compute */ }

  const result = computeNatalMap(chart, cacheKey)

  try {
    await db.from('astro_natal_cache').upsert({
      user_id: auth.user.id,
      cache_key: cacheKey,
      inputs,
      conventions: CONVENTIONS,
      engine: ENGINE.name,
      engine_version: ENGINE.version,
      result,
    }, { onConflict: 'user_id,cache_key' })
  } catch { /* cache write is best-effort */ }

  return NextResponse.json({ ...result, birthChart: chart })
}
