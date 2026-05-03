import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const WEBHOOK_URL = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL
  if (!WEBHOOK_URL) {
    return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return NextResponse.json({ success: response.ok }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to forward webhook' }, { status: 500 })
  }
}
