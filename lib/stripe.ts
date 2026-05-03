import Stripe from 'stripe'

// Stripe client — initialized server-side only (API routes)
// process.env.STRIPE_SECRET_KEY is set in Vercel environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})
