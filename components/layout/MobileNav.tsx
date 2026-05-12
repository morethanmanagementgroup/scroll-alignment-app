'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'

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
  { href: '/snapshot', label: 'My Snapshot',      icon: '◆' },
  { href: '/unlock',   label: 'Unlock Full Scroll', icon: '✦' },
  { href: '/settings', label: 'Settings',          icon: '⌘' },
]

interface MobileNavProps {
  isPaid?: boolean
}

const ADMIN_EMAIL = 'morethanmanagementgroup@gmail.com'

export default function MobileNav({ isPaid = false }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const nav = isPaid ? NAV_PAID : NAV_FREE

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
  }, [])

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleSignOut = async () => {
    setOpen(false)
    await supabase.auth.signOut()
    storage.clearAll()
    router.push('/')
  }

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg bg-scroll-card border border-scroll-border hover:border-scroll-gold/40 transition-colors"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-scroll-gold rounded-full" />
        <span className="block w-5 h-0.5 bg-scroll-gold rounded-full" />
        <span className="block w-3 h-0.5 bg-scroll-gold/60 rounded-full" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-scroll-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-scroll-charcoal border-r border-scroll-border flex flex-col md:hidden transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-scroll-border">
          <Link
            href={isPaid ? '/dashboard' : '/snapshot'}
            className="font-serif text-xl gold-text tracking-widest"
            onClick={() => setOpen(false)}
          >
            SCROLL
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-scroll-bone-dim hover:text-scroll-bone rounded-lg hover:bg-scroll-card transition-colors text-lg"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-scroll-purple-dim text-scroll-gold border border-scroll-purple/30'
                    : 'text-scroll-bone-dim hover:text-scroll-bone hover:bg-scroll-card'
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-scroll-gold" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-6 space-y-3 border-t border-scroll-border pt-4">
          {!isPaid && (
            <Link
              href="/unlock"
              className="block bg-gold-gradient text-scroll-black text-sm font-semibold px-4 py-3 rounded-xl text-center"
              onClick={() => setOpen(false)}
            >
              ✦ Unlock Full Scroll
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="block px-4 py-2.5 text-scroll-gold/60 hover:text-scroll-gold text-sm rounded-xl hover:bg-scroll-card transition-colors"
              onClick={() => setOpen(false)}
            >
              ✦ Admin Portal
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 text-scroll-bone-dim/50 hover:text-scroll-bone-dim text-sm rounded-xl hover:bg-scroll-card transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
