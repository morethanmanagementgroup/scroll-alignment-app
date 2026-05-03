'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { storage } from '@/lib/storage'

type Status = 'verifying' | 'success' | 'error'

// useSearchParams() must live inside a component wrapped by <Suspense>
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

    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.paid) {
          const user = storage.getUser()
          if (user) {
            storage.saveUser({
              ...user,
              isPaid: true,
              plan: data.plan || 'reading',
              stripeSessionId: sessionId,
            })
          }
          setPlan(data.plan || 'reading')
          setStatus('success')
          setTimeout(() => router.push('/report'), 2500)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [searchParams, router])

  return (
    <div className="bg-scroll-black min-h-screen flex items-center justify-center px-6">
      {status === 'verifying' && (
        <div className="text-center animate-pulse">
          <p className="font-serif text-scroll-gold text-2xl mb-3">Verifying your scroll access.</p>
          <p className="text-scroll-bone-dim text-sm">This takes just a moment.</p>
        </div>
      )}

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

      {status === 'error' && (
        <div className="text-center">
          <p className="font-serif text-scroll-gold text-2xl mb-3">Something went wrong.</p>
          <p className="text-scroll-bone-dim text-sm mb-6">
            Your payment may have gone through — reach out to us at{' '}
            <a href="mailto:morethanmanagementgroup@gmail.com" className="text-scroll-gold underline">
              morethanmanagementgroup@gmail.com
            </a>{' '}
            and we'll sort it out immediately.
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
