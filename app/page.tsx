import { Suspense } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import PreviewWidget from '@/components/landing/PreviewWidget'
import RefCapture from '@/components/landing/RefCapture'

export default function LandingPage() {
  return (
    <div className="bg-scroll-black text-scroll-bone">
      <Header />
      <Suspense fallback={null}><RefCapture /></Suspense>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-gold w-[500px] h-[500px] top-10 left-1/2 -translate-x-1/2 opacity-20" />
        <div className="orb orb-purple w-72 h-72 bottom-20 right-10 opacity-15" />

        <div className="relative z-10 w-full max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left — identity-first copy */}
            <div className="animate-fade-in">
              <p className="text-scroll-gold/50 tracking-[0.4em] text-xs uppercase mb-6">
                Scroll Alignment
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6">
                You've done the<br />
                inner work.<br />
                Built the thing.<br />
                <span className="gold-text">Still something's<br />off-frequency.</span>
              </h1>
              <p className="text-scroll-bone-dim text-base md:text-lg leading-relaxed mb-4">
                Most alignment tools were built for people still figuring out who they are.
                You already know. What you need is a system that operates at your actual level.
              </p>
              <p className="text-scroll-bone-dim/60 text-sm leading-relaxed mb-8">
                Scroll Alignment reads the codes written in your birth — life path, Chinese zodiac,
                elemental nature — cross-references them with your current season, and runs them
                forward into your daily work and life.
              </p>
              <div className="flex items-center gap-4 text-xs text-scroll-bone-dim/40 tracking-widest uppercase">
                <span>◆ Numerology</span>
                <span>◆ Chinese Astrology</span>
                <span>◆ Daily Alignment</span>
              </div>
            </div>

            {/* Right — Preview Widget */}
            <div className="animate-slide-up">
              <PreviewWidget />
            </div>

          </div>
        </div>
      </section>

      {/* ── TWO WORLDS, ONE PERSON ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-scroll-deep">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-scroll-gold/50 tracking-widest text-xs uppercase mb-4">Who This Is For</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Both live inside you.
            </h2>
            <p className="text-scroll-bone-dim max-w-xl mx-auto">
              Most people have to choose between the spiritual and the strategic.
              Your Scroll doesn't make you choose.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {/* The Seeker */}
            <div className="scroll-card p-8">
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-4">The Seeker</p>
              <ul className="space-y-3 text-scroll-bone-dim text-sm leading-relaxed">
                {[
                  'You\'ve studied astrology, human design, or numerology — and wanted something deeper.',
                  'You track your energy cycles and know your seasons before others name them.',
                  'You\'ve done shadow work, therapy, or deep inner inquiry — and you\'re still going.',
                  'You want a daily practice that matches the depth of the questions you\'re actually asking.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-scroll-gold/40 mt-0.5 flex-shrink-0">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Builder */}
            <div className="scroll-card p-8">
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-4">The Builder</p>
              <ul className="space-y-3 text-scroll-bone-dim text-sm leading-relaxed">
                {[
                  'You\'re building something real — a business, a body of work, a creative practice.',
                  'You think in systems, but the best system you\'ve built is the one for external output.',
                  'You want a daily operating structure rooted in purpose — not just productivity.',
                  'You\'re done with generic frameworks. You\'re ready for one that starts with you.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-scroll-gold/40 mt-0.5 flex-shrink-0">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Convergence */}
          <div className="scroll-card-gold p-8 md:p-10 text-center max-w-2xl mx-auto">
            <p className="text-scroll-gold text-3xl mb-4">✦</p>
            <p className="font-serif text-2xl md:text-3xl mb-4 leading-snug">
              "You finish the business meeting<br className="hidden md:block" /> and still ask the existential question."
            </p>
            <p className="text-scroll-bone-dim text-sm leading-relaxed">
              Your Scroll addresses both. Every day. In the same breath.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'RE ACTUALLY GETTING ────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-scroll-gold/50 tracking-widest text-xs uppercase mb-4">The System</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              Not a horoscope.<br />Not a personality test.
            </h2>
            <p className="text-scroll-bone-dim max-w-xl mx-auto">
              A personal operating system — built from the codes already embedded in your birth,
              refined by your current season, delivered daily.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '◆',
                title: 'Your Birth Code',
                desc: 'Life Path number, Chinese zodiac, elemental nature, and core archetype — the original signal you were born with. Calculated. Not guessed.',
              },
              {
                icon: '◉',
                title: 'Your Current Season',
                desc: 'Where you are right now — your personal year, active focus, and current intention — cross-referenced with your birth code and translated into direction.',
              },
              {
                icon: '✦',
                title: 'Your Daily Scroll',
                desc: 'Every morning: today\'s theme, business assignment, spiritual assignment, shadow to watch, power move, affirmation, and journal prompt. Built for you. Not a template.',
              },
            ].map(item => (
              <div key={item.title} className="scroll-card p-8 hover:border-scroll-gold/30 transition-colors">
                <div className="text-scroll-gold text-2xl mb-5">{item.icon}</div>
                <h3 className="font-serif text-xl mb-3">{item.title}</h3>
                <p className="text-scroll-bone-dim text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMPLE DAILY SCROLL ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-scroll-deep">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-scroll-gold/50 tracking-widest text-xs uppercase mb-4">What a Daily Scroll Looks Like</p>
            <h2 className="font-serif text-4xl mb-3">The journal prompt you'll actually sit with.</h2>
            <p className="text-scroll-bone-dim text-sm">The shadow pattern you've been circling for years — named, clearly, finally.</p>
          </div>
          <div className="scroll-card p-8 md:p-10 space-y-6">
            <div className="text-center border-b border-scroll-border pb-6">
              <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-1">Thursday · Deep Work</p>
              <h3 className="font-serif text-2xl">Refinement & Problem-Solving</h3>
            </div>
            {[
              { label: "Today's Energy", content: 'Precise, sustained, focused. Today is the day for the work that requires your full mind — not meetings, not admin, not email.' },
              { label: 'Spiritual Assignment', content: 'Practice honest self-assessment today. Not criticism — assessment. What is working? What is not? Be specific.' },
              { label: 'Business Assignment', content: 'Identify the highest-leverage, most cognitively demanding task on your list and protect 3 hours for it. Nothing interrupts it.' },
              { label: 'Shadow to Watch', content: 'Perfectionism — spending the day refining what does not need refinement instead of advancing what does.' },
              { label: 'Power Move', content: 'Fix the one thing that has been creating friction for more than two weeks. Today. In one hour.' },
              { label: "Today's Affirmation", content: 'I audit without judgment and adjust without drama. Precision is a form of power.' },
              { label: 'Journal Prompt', content: 'What is the one thing in my work or life that keeps not working? What is the actual root cause?' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-scroll-gold/50 text-xs tracking-widest uppercase mb-2">{item.label}</p>
                <p className="text-scroll-bone-dim leading-relaxed text-sm">{item.content}</p>
              </div>
            ))}
          </div>
          <p className="text-scroll-bone-dim/40 text-xs text-center mt-6">
            This is a general sample. Your Scroll is generated from your specific life path, zodiac, and current focus.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-scroll-gold/50 tracking-widest text-xs uppercase mb-4">How It Works</p>
            <h2 className="font-serif text-4xl md:text-5xl">Three steps. One system.</h2>
          </div>
          <div className="space-y-8">
            {[
              {
                num: '01',
                title: 'Enter your birth data and current season',
                desc: 'Name, birth date, city, current focus, and intention. Takes 3 minutes. Your life path number, Chinese zodiac, and elemental nature are calculated automatically.',
              },
              {
                num: '02',
                title: 'Receive your free Scroll Snapshot instantly',
                desc: 'Your core archetype, primary strength, primary shadow, current season message, affirmation, and action step — free, no payment required. See what the Scroll sees.',
              },
              {
                num: '03',
                title: 'Unlock your Full Scroll',
                desc: '18 sections of your complete alignment report — plus daily Scroll access to keep you calibrated morning by morning. One payment. No subscription.',
              },
            ].map(step => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 scroll-card-gold rounded-full flex items-center justify-center font-serif text-scroll-gold text-sm">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">{step.title}</h3>
                  <p className="text-scroll-bone-dim leading-relaxed text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S IN THE FULL SCROLL ────────────────────────────────── */}
      <section className="py-24 px-6 bg-scroll-deep">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-scroll-gold/50 tracking-widest text-xs uppercase mb-4">The Full Scroll</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Everything. $33.</h2>
            <p className="text-scroll-bone-dim max-w-xl mx-auto">
              One payment. No subscription. Immediate delivery.
              Everything your Scroll is built to show you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mb-12 max-w-3xl mx-auto">
            {[
              'Opening Scroll Message',
              'Full Birth Code Breakdown',
              'Life Path Deep Breakdown',
              'Chinese Zodiac Deep Breakdown',
              'Core Archetype Profile',
              'Strength Pattern Analysis',
              'Shadow Pattern Analysis',
              'Business & Execution Pattern',
              'Money & Abundance Pattern',
              'Relationship Pattern',
              'Body & Discipline Pattern',
              'Spiritual Assignment',
              'Current Season of Growth',
              'Recommended Colors & Frequencies',
              'Personalized Morning Routine',
              'Personalized Evening Routine',
              '30-Day Alignment Plan',
              'Daily Scroll Access — ongoing',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3 py-1.5 border-b border-scroll-border/50">
                <span className="text-scroll-gold text-xs flex-shrink-0">◆</span>
                <span className="text-scroll-bone-dim text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/onboarding"
              className="inline-block bg-gold-gradient text-scroll-black px-12 py-5 rounded-lg text-lg font-bold hover:opacity-90 transition-opacity gold-glow"
            >
              Start Free — Unlock Full Scroll for $33
            </Link>
            <p className="text-scroll-bone-dim/40 text-xs mt-4">
              Begin with a free Snapshot · One-time payment · No subscription · Instant delivery
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="orb orb-gold w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-scroll-gold/50 tracking-[0.4em] text-xs uppercase mb-6">
            This was always yours
          </p>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            <span className="gold-text">Read what's been<br />written in you.</span>
          </h2>
          <p className="text-scroll-bone-dim text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Your birth code has been running quietly in the background your entire life.
            The Scroll just makes it legible.
          </p>
          <Link
            href="/onboarding"
            className="inline-block bg-gold-gradient text-scroll-black px-14 py-5 rounded-lg text-xl font-bold hover:opacity-90 transition-opacity gold-glow"
          >
            Create My Scroll
          </Link>
          <p className="text-scroll-bone-dim/30 text-xs mt-5 tracking-widest uppercase">
            Free to start · No obligation
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-scroll-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-serif tracking-[0.3em] text-scroll-gold/40 text-sm">SCROLL</p>
          <p className="text-scroll-bone-dim/30 text-xs">Read what&apos;s been written in you.</p>
          <div className="flex gap-6 text-scroll-bone-dim/30 text-xs">
            <Link href="/unlock" className="hover:text-scroll-bone-dim transition-colors">Pricing</Link>
            <Link href="/onboarding" className="hover:text-scroll-bone-dim transition-colors">Get Started</Link>
            <Link href="/signin" className="hover:text-scroll-bone-dim transition-colors">Sign In</Link>
          </div>
          <p className="text-scroll-bone-dim/20 text-xs">© {new Date().getFullYear()} Scroll Alignment</p>
        </div>
      </footer>
    </div>
  )
}
