'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'

const ADMIN_EMAIL = 'morethanmanagementgroup@gmail.com'

const NAV_PAID = [
  { href: '/dashboard', label: 'Daily Scroll', icon: '◈' },
  { href: '/journal',   label: 'Journal',      icon: '✦' },
  { href: '/routine',   label: 'Routine',      icon: '○' },
  { href: '/streak',    label: 'Streak',       icon: '◆' },
  { href: '/calendar',  label: 'Calendar',     icon: '◇' },
  { href: '/library',   label: 'Library',      icon: '◉' },
  { href: '/report',    label: 'Full Report',  icon: '▣' },
  { href: '/settings',  label: 'Settings',     icon: '⌘' },
]

const NAV_FREE = [
  { href: '/snapshot', label: 'My Snapshot', icon: '◆' },
  { href: '/unlock',   label: 'Full Scroll',  icon: '🔒' },
  { href: '/settings', label: 'Settings',     icon: '⌘' },
]

export default function Sidebar({ isPaid = false }: { isPaid?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const nav = isPaid ? NAV_PAID : NAV_FREE
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    storage.clearAll()
    router.push('/')
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-scroll-charcoal border-r border-scroll-border min-h-screen py-8 px-4">
      <Link href={isPaid ? '/dashboard' : '/snapshot'} className="font-serif text-xl gold-text tracking-widest px-2 mb-8">
        SCROLL
      </Link>

      <nav className="flex flex-col gap-1">
        {nav.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-scroll-purple-dim text-scroll-gold border border-scroll-purple/30'
                  : 'text-scroll-bone-dim hover:text-scroll-bone hover:bg-scroll-card'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-scroll-border">
        {!isPaid && (
          <div className="scroll-card-gold p-4 text-center mb-3">
            <p className="text-xs text-scroll-bone-dim mb-3">Your full scroll awaits.</p>
            <Link
              href="/unlock"
              className="block bg-gold-gradient text-scroll-black text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Unlock — $33
            </Link>
          </div>
        )}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-1 ${
              pathname.startsWith('/admin')
                ? 'bg-scroll-purple-dim text-scroll-gold border border-scroll-purple/30'
                : 'text-scroll-gold/50 hover:text-scroll-gold hover:bg-scroll-card'
            }`}
          >
            <span className="text-base">✦</span>
            Admin
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-scroll-bone-dim/40 hover:text-scroll-bone-dim hover:bg-scroll-card transition-all"
        >
          <span className="text-base">↪</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
