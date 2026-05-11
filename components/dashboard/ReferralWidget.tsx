'use client'
import { useState } from 'react'
import { buildReferralLink, formatBalance } from '@/lib/referral'
import type { User } from '@/lib/types'

interface Props {
  user: User
}

export default function ReferralWidget({ user }: Props) {
  const [copied, setCopied] = useState(false)
  const [payoutSent, setPayoutSent] = useState(false)

  const referralCode = user.referralCode
  const balance      = user.referralBalance ?? 0
  const count        = user.referralCount   ?? 0
  const link         = referralCode ? buildReferralLink(referralCode) : ''

  const handleCopy = () => {
    if (!link) return
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  const handlePayoutRequest = async () => {
    if (balance < 5) return
    // Fire a simple capture-lead call to log the payout request
    await fetch('/api/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: user.firstName,
        email: user.email,
        source: 'Scroll Alignment Referral Payout Request',
        step: `Payout requested — ${formatBalance(balance)} owed (${count} referrals)`,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
      }),
    }).catch(() => {})
    setPayoutSent(true)
  }

  if (!referralCode) return null

  return (
    <div className="scroll-card border border-scroll-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-0.5">Referral</p>
          <h3 className="font-serif text-lg text-scroll-bone">Share Your Scroll</h3>
        </div>
        <span className="text-scroll-gold text-xl">◆</span>
      </div>

      {/* Balance + Count */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-scroll-deep rounded-xl p-4 text-center">
          <p className="font-serif text-2xl text-scroll-gold mb-0.5">{formatBalance(balance)}</p>
          <p className="text-scroll-bone-dim/50 text-xs">Total earned</p>
        </div>
        <div className="bg-scroll-deep rounded-xl p-4 text-center">
          <p className="font-serif text-2xl text-scroll-gold mb-0.5">{count}</p>
          <p className="text-scroll-bone-dim/50 text-xs">{count === 1 ? 'Referral' : 'Referrals'}</p>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-scroll-bone-dim/60 text-xs leading-relaxed mb-4">
        Share your link — your referral gets 10% off their Scroll.
        You earn 10% of every purchase they make.
      </p>

      {/* Referral Link */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-scroll-deep border border-scroll-border rounded-lg px-3 py-2 overflow-hidden">
          <p className="text-scroll-bone-dim/70 text-xs truncate font-mono">{link}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            copied
              ? 'bg-scroll-gold/20 text-scroll-gold border border-scroll-gold/40'
              : 'bg-scroll-gold text-scroll-black hover:opacity-90'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Code pill */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-scroll-bone-dim/40 text-xs">Code:</span>
        <span className="bg-scroll-deep border border-scroll-gold/20 text-scroll-gold text-xs font-mono px-3 py-1 rounded-full tracking-widest">
          {referralCode}
        </span>
      </div>

      {/* Payout request */}
      {balance >= 5 && !payoutSent && (
        <button
          onClick={handlePayoutRequest}
          className="w-full text-center text-scroll-gold/70 hover:text-scroll-gold text-xs underline transition-colors"
        >
          Request payout ({formatBalance(balance)} available)
        </button>
      )}
      {payoutSent && (
        <p className="text-center text-scroll-bone-dim/50 text-xs">
          ✦ Payout request sent — we&apos;ll reach out within 48 hours.
        </p>
      )}
      {balance > 0 && balance < 5 && (
        <p className="text-center text-scroll-bone-dim/30 text-xs">
          Payouts available at $5.00 minimum
        </p>
      )}
    </div>
  )
}
