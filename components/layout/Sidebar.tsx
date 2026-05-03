'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_PAID = [
  { href: '/dashboard', label: 'Daily Scroll', icon: '◈' },
  { href: '/journal',   label: 'Journal',      icon: '✦' },
  { href: '/routine',   label: 'Routine',      icon: '○' },
  { href: '/calendar',  label: 'Calendar',     icon: '◇' },
  { href: '/library',   label: 'Library',      icon: '◉' },
  { href: '/report',    label: 'Full Report',  icon: '◆' },
  { href: '/settings',  label: 'Settings',     icon: '⌘' },
]

const NAV_FREE = [
  { href: '/snapshot', label: 'My Snapshot', icon: '◆' },
  { href: '/unlock',   label: 'Full Scroll',  icon: '🔒' },
  { href: '/settings', label: 'Settings',     icon: '⌘' },
]

export default function Sidebar({ isPaid = false }: { isPaid?: boolean }) {
  const pathname = usePathname()
  const nav = isPaid ? NAV_PAID : NAV_FREE

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

      {!isPaid && (
        <div className="mt-auto">
          <div className="scroll-card-gold p-4 text-center">
            <p className="text-xs text-scroll-bone-dim mb-3">Your full scroll awaits.</p>
            <Link
              href="/unlock"
              className="block bg-gold-gradient text-scroll-black text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Unlock — $33
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
