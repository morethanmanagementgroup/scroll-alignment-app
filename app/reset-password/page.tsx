'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Supabase PKCE flow: link contains ?code=...
    const code = searchParams.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) {
          setError('This reset link has expired or is invalid. Please request a new one.')
        } else {
          setReady(true)
        }
        setChecking(false)
      })
    } else {
      // Implicit / hash flow — session may already be set
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true)
        } else {
          setError('This reset link is invalid or has already been used. Please request a new one.')
        }
        setChecking(false)
      })
    }
  }, [searchParams])

  const handleReset = async () => {
    if (!password) { setError('Please enter a new password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  return (
    <div className="bg-scroll-black min-h-screen">
      <Header />
      <div className="max-w-md mx-auto px-6 pt-36 pb-20">

        <div className="mb-10 text-center">
          <p className="text-scroll-gold/50 tracking-[0.4em] text-xs uppercase mb-4">Scroll Alignment</p>
          <h1 className="font-serif text-3xl mb-2">Set a new password.</h1>
          <p className="text-scroll-bone-dim text-sm">Choose something you will remember.</p>
        </div>

        {/* Loading state while verifying token */}
        {checking && (
          <div className="text-center py-10">
            <p className="text-scroll-bone-dim text-sm animate-pulse">Verifying your reset link...</p>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="text-center py-10">
            <p className="font-serif text-scroll-gold text-xl mb-3">Password updated.</p>
            <p className="text-scroll-bone-dim text-sm leading-relaxed">
              Your password has been changed. Taking you to your Scroll now.
            </p>
          </div>
        )}

        {/* Error — invalid link */}
        {!checking && !ready && !success && (
          <div className="space-y-5 text-center">
            <p className="text-red-400/80 text-sm bg-red-900/10 border border-red-900/30 rounded-lg px-4 py-4 leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="text-scroll-gold/70 text-sm hover:text-scroll-gold transition-colors"
            >
              ← Back to sign in
            </button>
          </div>
        )}

        {/* Reset form */}
        {!checking && ready && !success && (
          <div className="space-y-5">
            <div>
              <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                className="scroll-input w-full"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                className="scroll-input w-full"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
              />
            </div>

            {error && (
              <p className="text-red-400/80 text-sm bg-red-900/10 border border-red-900/30 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <Button variant="gold" className="w-full" loading={loading} onClick={handleReset}>
              Update My Password
            </Button>

            <button
              onClick={() => router.push('/signin')}
              className="text-scroll-bone-dim/50 text-xs hover:text-scroll-bone-dim transition-colors block mx-auto"
            >
              ← Back to sign in
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scroll-input {
          background: #161624;
          border: 1px solid #232338;
          border-radius: 8px;
          color: #F0EBE1;
          padding: 12px 16px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .scroll-input:focus { border-color: #C9A96E; }
        .scroll-input::placeholder { color: #B8B0A4; }
      `}</style>
    </div>
  )
}

const Fallback = (
  <div className="bg-scroll-black min-h-screen flex items-center justify-center">
    <p className="text-scroll-bone-dim text-sm animate-pulse">Loading...</p>
  </div>
)

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={Fallback}>
      <ResetPasswordContent />
    </Suspense>
  )
}
