// GET /api/places/search?q=springfield,%20il
// Searches the bundled GeoNames dataset. Public (used during onboarding,
// before an account exists); no third-party geocoder is called.
import { NextRequest, NextResponse } from 'next/server'
import { searchPlaces } from '@/lib/places'

export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 80)
  const limit = Math.min(12, Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 8))
  if (q.trim().length < 2) return NextResponse.json({ places: [] })
  const places = searchPlaces(q, limit)
  return NextResponse.json(
    { places },
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
  )
}
