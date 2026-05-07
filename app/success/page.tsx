'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { storage } from '@/lib/storage'
import { getCloudUserId, syncPaymentToCloud } from '@/lib/supabaseSync'

type Status = 'verifying' | 'success' | 'need-onboarding' | 'error'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('verifying')
  const [plan, setPlan] = useState<string>('reading')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      router.push('/unlock')
      return
    }

    const run = async () => {
      try {
        // 1. Verify payment with Stripe
        const verifyRes = await fetch(`/api/verify-payment?session_id=${sessionId}`)
        const verifyData = await verifyRes.json()

        if (!verifyData.paid) {
          setStatus('error')
          return
        }

        const resolvedPlan = verifyData.plan || 'reading'
        setPlan(resolvedPlan)

        // 2. Always stash payment info locally so onboarding can pick it up
        localStorage.setItem('scroll_pending_payment', JSON.stringify({
          sessionId,
          plan: resolvedPlan,
          email: verifyData.email || '',
          userId: verifyData.userId || '',
        }))

        // 3. Try server-side activation (works regardless of local state)
        fetch('/api/activate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {})

        // 4. Update localStorage user if they exist on this device
        const user = storage.getUser()
        if (user) {
          storage.saveUser({ ...user, isPaid: true, plan: resolvedPlan, stripeSessionId: sessionId })

          // 5. Sync to cloud
          const cloudUserId = await getCloudUserId()
          if (cloudUserId) {
            syncPaymentToCloud(cloudUserId, resolvedPlan, sessionId).catch(() => {})
          }

          setStatus('success')
          setTimeout(() => router.push('/report'), 2500)
        } else {
          // 6. No local user — they need to create an account first
          // The pending_payment in localStorage will be applied after onboarding
          setStatus('need-onboarding')
        }

      } catch {
        setStatus('error')
      }
    }

    run()
  }, [searchParams, router])

  return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center px-6">

      {/* Verifying */}
      {status === 'verifying' && (
        <div className="text-center animate-pulse">
          <p className="font-serif text-scroll-gold text-2xl mb-3">Verifying your scroll access.</p>
          <p className="text-scroll-bone-dim text-sm">This takes just a moment.</p>
        </div>
      )}

      {/* Success — existing user */}
      {status === 'success' && (
        <div className="text-center animate-fade-in">
          <p className="text-4xl mb-6">✦</p>
          <p className="font-serif text-scroll-gold text-3xl mb-3">Your Scroll is unlocked.</p>
          <p className="text-scroll-bone-dim text-sm mb-2">
            {plan === 'annual'
              ? 'Annual access confirmed — all features are yours.'
              : 'Your full reading is ready.'}
          </p>
          <p className="text-scroll-bone-dim/40 text-xs">Taking you there now...</p>
        </div>
      )}

      {/* Need onboarding — payment confirmed but no account yet */}
      {status === 'need-onboarding' && (
        <div className="text-center animate-fade-in max-w-sm">
          <p className="text-4xl mb-6">✦</p>
          <p className="font-serif text-scroll-gold text-3xl mb-3">Payment confirmed.</p>
          <p className="text-scroll-bone-dim text-sm mb-6">
            Your access is locked in. Now create your Scroll profile — your birth code, zodiac, and focus — so we can build your reading.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-gold-gradient text-scroll-black font-semibold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Build My Scroll Profile →
          </button>
          <p className="text-scroll-bone-dim/30 text-xs mt-4">Your payment is already saved. You won&apos;t be charged again.</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="text-center max-w-sm">
          <p className="font-serif text-scroll-gold text-2xl mb-3">Something went wrong.</p>
          <p className="text-scroll-bone-dim text-sm mb-6">
            Your payment may have gone through. Email us at{' '}
            <a href="mailto:morethanmanagementgroup@gmail.com" className="text-scroll-gold underline">
              morethanmanagementgroup@gmail.com
            </a>{' '}
            and we&apos;ll activate your account manually within the hour.
          </p>
          <button
            onClick={() => router.push('/unlock')}
            className="text-scroll-bone-dim/60 text-sm underline"
          >
            Return to pricing
          </button>
        </div>
      )}

    </div>
  )
}

const VerifyingFallback = (
  <div className="bg-scroll-black min-h-screen flex items-center justify-center px-6">
    <div className="text-center animate-pulse">
      <p className="font-serif text-scroll-gold text-2xl mb-3">Verifying your scroll access.</p>
      <p className="text-scroll-bone-dim text-sm">This takes just a moment.</p>
    </div>
  </div>
)

export default function SuccessPage() {
  return (
    <Suspense fallback={VerifyingFallback}>
      <SuccessContent />
    </Suspense>
  )
}
