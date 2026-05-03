import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://scroll-alignment-app.vercel.app'

export async function POST(req: NextRequest) {
  try {
    const { email, userId, plan } = await req.json()

    if (!email || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const isAnnual = plan === 'annual'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      mode: isAnnual ? 'subscription' : 'payment',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: isAnnual
            ? {
                currency: 'usd',
                product_data: {
                  name: 'Scroll Alignment — Annual Access',
                  description:
                    'Full reading + daily scrolls, all focus areas, shadow work, saved history. Renews yearly.',
                  images: [],
                },
                unit_amount: 3300, // $33.00
                recurring: { interval: 'year' },
              }
            : {
                currency: 'usd',
                product_data: {
                  name: 'Scroll Alignment — Full Reading',
                  description:
                    '18-section personalized reading built from your birth code and current season.',
                  images: [],
                },
                unit_amount: 333, // $3.33
              },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId || '',
        plan,
        email,
      },
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/unlock`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    console.error('[checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
