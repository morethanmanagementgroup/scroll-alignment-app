import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function LandingPage() {
  return (
    <div className="bg-scroll-black text-scroll-bone">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-gold w-96 h-96 top-20 left-1/4 -translate-x-1/2" />
        <div className="orb orb-purple w-80 h-80 bottom-40 right-1/4 translate-x-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <p className="text-scroll-gold/60 tracking-[0.4em] text-xs uppercase mb-6">
            Scroll Alignment
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
            Your birth code.<br />
            Your current season.<br />
            <span className="gold-text">Your daily alignment.</span>
          </h1>
          <p className="text-scroll-bone-dim text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Scroll Alignment turns your personal rhythm, numerology, zodiac archetype, intention,
            and reflection into a daily operating system for your life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="bg-gold-gradient text-scroll-black px-10 py-4 rounded-lg text-lg font-bold hover:opacity-90 transition-opacity gold-glow"
            >
              Create My Scroll
            </Link>
            <a href="#how-it-works" className="text-scroll-bone-dim hover:text-scroll-bone text-base underline underline-offset-4">
              See how it works
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-scroll-gold/40 to-transparent mx-auto" />
        </div>
      </section>

      {/* ── What Scroll Alignment Is ─────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-4">What It Is</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">
              Not a horoscope.<br />Not a personality test.
            </h2>
            <p className="text-scroll-bone-dim text-lg max-w-2xl mx-auto">
              Scroll Alignment is a personal operating system — built from the codes already embedded
              in your birth, refined by your current season, and delivered daily to keep you in alignment
              with the deepest version of your work and your life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '◆', title: 'Birth Code', desc: 'Your Life Path number, Chinese zodiac, elemental nature, and core archetype — the original signal you were born with.' },
              { icon: '◉', title: 'Current Season', desc: 'Where you are right now — your personal year, your active focus, your intention — translated into actionable alignment.' },
              { icon: '✦', title: 'Daily Scroll', desc: 'Each morning, your personalized alignment for the day: theme, assignments, shadow, power move, affirmation, and journal prompt.' },
            ].map(item => (
              <div key={item.title} className="scroll-card p-8 text-center hover:border-scroll-gold/30 transition-colors">
                <div className="text-scroll-gold text-3xl mb-4">{item.icon}</div>
                <h3 className="font-serif text-xl mb-3">{item.title}</h3>
                <p className="text-scroll-bone-dim text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-scroll-deep">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-4">How It Works</p>
            <h2 className="font-serif text-4xl md:text-5xl">Three steps. One system.</h2>
          </div>
          <div className="space-y-8">
            {[
              { num: '01', title: 'Enter your birth data and current season', desc: 'Name, birth date, current focus, and intention. Takes 3 minutes. Your birth code is calculated automatically — life path number, Chinese zodiac, elemental nature, and core archetype.' },
              { num: '02', title: 'Receive your free Scroll Snapshot', desc: 'Instantly see your core archetype, primary strength, primary shadow, and a focused message for your current season. No payment required.' },
              { num: '03', title: 'Unlock your Full Scroll for $33', desc: 'A complete, personalized Scroll Alignment report — 18 sections — plus daily scroll access to keep you in alignment morning by morning.' },
            ].map(step => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 scroll-card-gold rounded-full flex items-center justify-center font-serif text-scroll-gold text-sm">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">{step.title}</h3>
                  <p className="text-scroll-bone-dim leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/onboarding"
              className="bg-gold-gradient text-scroll-black px-10 py-4 rounded-lg text-lg font-bold hover:opacity-90 transition-opacity gold-glow"
            >
              Create My Scroll
            </Link>
          </div>
        </div>
      </section>

      {/* ── Free Snapshot Preview ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-4">Free Preview</p>
            <h2 className="font-serif text-4xl">Your Scroll Snapshot</h2>
            <p className="text-scroll-bone-dim mt-4">What every free user receives immediately after onboarding.</p>
          </div>
          <div className="scroll-card-gold p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { label: 'Life Path Number', value: 'Calculated from your birth date', locked: false },
                { label: 'Chinese Zodiac', value: 'Calculated from your birth year', locked: false },
                { label: 'Core Archetype', value: 'Your unique energetic identity', locked: false },
                { label: 'Primary Strength', value: 'The power you carry', locked: false },
                { label: 'Primary Shadow', value: 'The pattern to watch', locked: false },
                { label: 'Current Focus Message', value: 'Aligned to your stated focus', locked: false },
                { label: 'Affirmation', value: 'For this season', locked: false },
                { label: 'Action Step', value: 'The one move that matters today', locked: false },
              ].map(item => (
                <div key={item.label} className="border-b border-scroll-border pb-4">
                  <p className="text-scroll-gold/60 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-scroll-bone-dim text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/onboarding"
                className="bg-gold-gradient text-scroll-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get My Free Snapshot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full Scroll Offer ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-scroll-deep">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-4">The Full Scroll</p>
            <h2 className="font-serif text-4xl md:text-5xl">Everything. $33.</h2>
            <p className="text-scroll-bone-dim mt-4 max-w-xl mx-auto">
              A complete scroll alignment report plus daily access to keep you calibrated.
              One payment. No subscription.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {[
              'Opening Scroll Message', 'Full Birth Code Breakdown',
              'Life Path Deep Breakdown', 'Chinese Zodiac Deep Breakdown',
              'Core Archetype Profile', 'Strength Pattern Analysis',
              'Shadow Pattern Analysis', 'Business & Execution Pattern',
              'Money & Abundance Pattern', 'Relationship Pattern',
              'Body & Discipline Pattern', 'Spiritual Assignment',
              'Current Season of Growth', 'Recommended Colors & Frequencies',
              'Personalized Morning Routine', 'Personalized Evening Routine',
              '30-Day Alignment Plan', 'Daily Scroll Access',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3 py-2">
                <span className="text-scroll-gold text-sm">◆</span>
                <span className="text-scroll-bone-dim text-sm">{feature}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/onboarding"
              className="bg-gold-gradient text-scroll-black px-12 py-5 rounded-lg text-xl font-bold hover:opacity-90 transition-opacity gold-glow"
            >
              Unlock Full Scroll — $33
            </Link>
            <p className="text-scroll-bone-dim/50 text-xs mt-4">One-time payment · No subscription · Instant delivery</p>
          </div>
        </div>
      </section>

      {/* ── Sample Daily Scroll ───────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-scroll-gold/60 tracking-widest text-xs uppercase mb-4">Sample</p>
            <h2 className="font-serif text-4xl">A Daily Scroll</h2>
          </div>
          <div className="scroll-card p-8 md:p-10 space-y-6">
            <div className="text-center border-b border-scroll-border pb-6">
              <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Thursday · Deep Work</p>
              <h3 className="font-serif text-2xl">Refinement & Problem-Solving</h3>
            </div>
            {[
              { label: 'Today\'s Energy', content: 'Precise, sustained, focused. Today is the day for the work that requires your full mind — not meetings, not admin, not email.' },
              { label: 'Spiritual Assignment', content: 'Practice honest self-assessment today. Not criticism — assessment. What is working? What is not? Be specific.' },
              { label: 'Business Assignment', content: 'Identify the highest-leverage, most cognitively demanding task on your list and protect 3 hours for it. Nothing interrupts it.' },
              { label: 'Shadow to Watch', content: 'Perfectionism — spending the day refining what does not need refinement instead of advancing what does.' },
              { label: 'Power Move', content: 'Fix the one thing that has been creating friction for more than two weeks. Today. In one hour.' },
              { label: 'Today\'s Affirmation', content: 'I audit without judgment and adjust without drama. Precision is a form of power.' },
              { label: 'Journal Prompt', content: 'What is the one thing in my work or life that keeps not working? What is the actual root cause?' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-2">{item.label}</p>
                <p className="text-scroll-bone-dim leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-scroll-deep">
        <div className="max-w-3xl mx-auto text-center">
          <div className="orb orb-gold w-64 h-64 top-0 left-1/2 -translate-x-1/2 opacity-10" />
          <h2 className="font-serif text-5xl md:text-6xl mb-6 relative z-10">
            <span className="gold-text">Read what's been<br />written in you.</span>
          </h2>
          <p className="text-scroll-bone-dim text-lg mb-10">
            Begin with a free Scroll Snapshot. Unlock the full system when you are ready.
          </p>
          <Link
            href="/onboarding"
            className="inline-block bg-gold-gradient text-scroll-black px-12 py-5 rounded-lg text-xl font-bold hover:opacity-90 transition-opacity gold-glow"
          >
            Create My Scroll
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-scroll-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-scroll-bone-dim/40 text-xs">
          <p className="font-serif tracking-widest text-scroll-gold/40">SCROLL</p>
          <p>Read what's been written in you.</p>
          <p>© {new Date().getFullYear()} Scroll Alignment. Sacred work, built with restraint.</p>
        </div>
      </footer>
    </div>
  )
}
