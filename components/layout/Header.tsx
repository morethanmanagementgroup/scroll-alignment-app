'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  isPaid?: boolean
}

export default function Header({ isPaid = false }: HeaderProps) {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  if (isLanding) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-scroll-black/80 backdrop-blur-md border-b border-scroll-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl gold-text tracking-widest">
            SCROLL
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-scroll-bone-dim text-sm hover:text-scroll-bone transition-colors">
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="bg-gold-gradient text-scroll-black px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Create My Scroll
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-scroll-charcoal/90 backdrop-blur-md border-b border-scroll-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={isPaid ? '/dashboard' : '/snapshot'} className="font-serif text-xl gold-text tracking-widest">
          SCROLL
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {isPaid ? (
            <>
              <NavLink href="/dashboard" label="Daily Scroll" current={pathname} />
              <NavLink href="/journal" label="Journal" current={pathname} />
              <NavLink href="/routine" label="Routine" current={pathname} />
              <NavLink href="/calendar" label="Calendar" current={pathname} />
              <NavLink href="/library" label="Library" current={pathname} />
              <NavLink href="/settings" label="Settings" current={pathname} />
            </>
          ) : (
            <>
              <NavLink href="/snapshot" label="My Snapshot" current={pathname} />
              <NavLink href="/unlock" label="Unlock Full Scroll" current={pathname} />
              <NavLink href="/settings" label="Settings" current={pathname} />
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function NavLink({ href, label, current }: { href: string; label: string; current: string }) {
  const active = current.startsWith(href)
  return (
    <Link
      href={href}
      className={`transition-colors ${active ? 'text-scroll-gold' : 'text-scroll-bone-dim hover:text-scroll-bone'}`}
    >
      {label}
    </Link>
  )
}
