import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://scroll-alignment-app.vercel.app'
const REFERRAL_COUPON_ID = 'SCROLL_REF_10'

/** Ensure the 10% referral coupon exists in Stripe */
async function ensureReferralCoupon() {
  try {
    await stripe.coupons.retrieve(REFERRAL_COUPON_ID)
  } catch {
    await stripe.coupons.create({
      id: REFERRAL_COUPON_ID,
      percent_off: 10,
      duration: 'once',
      name: 'Scroll Referral — 10% off',
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, userId, plan, referralCode } = await req.json()

    if (!email || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const isAnnual    = plan === 'annual'
    const hasReferral = !!referralCode
    const metadata    = { userId: userId || '', plan, email, referralCode: referralCode || '' }
    const success_url = `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`
    const cancel_url  = `${APP_URL}/unlock`

    // If referred, apply 10% coupon (mutually exclusive with allow_promotion_codes)
    let discounts: { coupon: string }[] | undefined
    let allowPromoCodes = true
    if (hasReferral) {
      await ensureReferralCoupon()
      discounts = [{ coupon: REFERRAL_COUPON_ID }]
      allowPromoCodes = false
    }

    let session

    if (isAnnual) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        mode: 'subscription',
        ...(allowPromoCodes ? { allow_promotion_codes: true } : { discounts }),
        billing_address_collection: 'auto',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Scroll Alignment — Annual Access',
                description:
                  'Full reading + daily scrolls, all focus areas, shadow work, saved history. Renews yearly.',
              },
              unit_amount: 3300,
              recurring: { interval: 'year' },
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url,
        cancel_url,
      })
    } else {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        mode: 'payment',
        ...(allowPromoCodes ? { allow_promotion_codes: true } : { discounts }),
        billing_address_collection: 'auto',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Scroll Alignment — Full Reading',
                description:
                  '18-section personalized reading built from your birth code and current season.',
              },
              unit_amount: 333,
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url,
        cancel_url,
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    console.error('[checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
