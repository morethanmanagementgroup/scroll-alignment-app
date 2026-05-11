'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { storeReferralCode } from '@/lib/referral'

/**
 * Invisible client component — captures ?ref= URL param on landing
 * and stores it in localStorage so it survives to checkout.
 */
export default function RefCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && ref.startsWith('SCR') && ref.length >= 9) {
      storeReferralCode(ref)
    }
  }, [searchParams])

  return null
}
