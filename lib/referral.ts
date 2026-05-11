// ============================================================
// SCROLL ALIGNMENT — Referral Utilities
// ============================================================

/** Generate a unique referral code: SCR + 6 alphanumeric chars */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0, I/1 to avoid confusion
  let code = 'SCR'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/** Get referral code from localStorage (set when visitor lands via ?ref=) */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('scroll_referral') ?? null
}

/** Store a referral code in localStorage */
export function storeReferralCode(code: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('scroll_referral', code)
}

/** Clear referral code after it's been used at checkout */
export function clearReferralCode(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('scroll_referral')
}

/** Build the full referral link for a code */
export function buildReferralLink(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://scroll-alignment-app.vercel.app'
  return `${base}?ref=${code}`
}

/** Format USD balance for display */
export function formatBalance(amount: number): string {
  return `$${amount.toFixed(2)}`
}
