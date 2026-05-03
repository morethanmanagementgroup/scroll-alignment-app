'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { restoreFromCloud } from '@/lib/supabaseSync'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const redirectTo = searchParams.get('redirect') ?? '/dashboard'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push(redirectTo)
    })
  }, [router, redirectTo])

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Incorrect email or password. Try again.')
      setLoading(false)
      return
    }

    if (data.user) {
      const restored = await restoreFromCloud(data.user.id)
      if (!restored) {
        // No cloud data — they may have created account without data yet
        router.push('/onboarding')
        return
      }
    }

    router.push(redirectTo)
  }

  const handlePasswordReset = async () => {
    if (!email) { setError('Enter your email address first.'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/signin`,
    })

    if (err) setError(err.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="bg-scroll-black min-h-screen">
      <Header />
      <div className="max-w-md mx-auto px-6 pt-36 pb-20">
        <div className="mb-10 text-center">
          <p className="text-scroll-gold/50 tracking-[0.4em] text-xs uppercase mb-4">Scroll Alignment</p>
          <h1 className="font-serif text-3xl mb-2">Welcome back.</h1>
          <p className="text-scroll-bone-dim text-sm">Sign in to access your Scroll from any device.</p>
        </div>

        {mode === 'signin' && (
          <div className="space-y-5">
            <div>
              <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                className="scroll-input w-full"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                className="scroll-input w-full"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              />
            </div>

            {error && (
              <p className="text-red-400/80 text-sm bg-red-900/10 border border-red-900/30 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <Button variant="gold" className="w-full" loading={loading} onClick={handleSignIn}>
              Sign In to My Scroll
            </Button>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => { setMode('reset'); setError('') }}
                className="text-scroll-bone-dim/50 text-xs hover:text-scroll-bone-dim transition-colors"
              >
                Forgot password?
              </button>
              <Link href="/onboarding" className="text-scroll-gold/70 text-xs hover:text-scroll-gold transition-colors">
                New here? Create your Scroll →
              </Link>
            </div>
          </div>
        )}

        {mode === 'reset' && (
          <div className="space-y-5">
            {resetSent ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-4">✦</p>
                <p className="font-serif text-scroll-gold text-xl mb-3">Check your email.</p>
                <p className="text-scroll-bone-dim text-sm leading-relaxed">
                  A password reset link has been sent to <span className="text-scroll-gold">{email}</span>.
                  <br />Follow it to set a new password.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-scroll-bone-dim text-xs mb-2 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    className="scroll-input w-full"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-400/80 text-sm">{error}</p>}
                <Button variant="gold" className="w-full" loading={loading} onClick={handlePasswordReset}>
                  Send Reset Link
                </Button>
              </>
            )}
            <button
              onClick={() => { setMode('signin'); setError(''); setResetSent(false) }}
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

const SignInFallback = (
  <div className="bg-scroll-black min-h-screen flex items-center justify-center">
    <p className="text-scroll-bone-dim text-sm animate-pulse">Loading...</p>
  </div>
)

export default function SignInPage() {
  return (
    <Suspense fallback={SignInFallback}>
      <SignInContent />
    </Suspense>
  )
}
