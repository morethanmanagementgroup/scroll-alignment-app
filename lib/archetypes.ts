// ============================================================
// SCROLL ALIGNMENT — Archetype System
// Maps Life Path Number → Core Archetype
// ============================================================

export interface Archetype {
  name: string
  title: string
  essence: string
  glyph: string             // single character symbol
}

export const ARCHETYPES: Record<number, Archetype> = {
  1: {
    name:    'The Pioneer',
    title:   'Original Force',
    essence: 'You came here to initiate. Not to follow a blueprint that already exists, but to write one. Your energy leads rooms before you speak. Your challenge is to trust the vision before the proof arrives.',
    glyph:   '◆',
  },
  2: {
    name:    'The Diplomat',
    title:   'Sacred Bridge',
    essence: 'You came here to harmonize. Not to disappear into others, but to hold the space between them. You feel the dynamics of every room. Your gift is knowing what needs to be said — and exactly when.',
    glyph:   '◇',
  },
  3: {
    name:    'The Creator',
    title:   'Living Expression',
    essence: 'You came here to create. Not for approval, but because the act of creation is how you breathe. Your words, your ideas, your presence — these are your instruments. The world needs what lives inside you.',
    glyph:   '△',
  },
  4: {
    name:    'The Builder',
    title:   'Foundation Keeper',
    essence: 'You came here to build what lasts. Not the fast thing — the right thing. You understand that real foundations require real work. Your discipline is not a burden. It is the architecture of your power.',
    glyph:   '□',
  },
  5: {
    name:    'The Explorer',
    title:   'Freedom Current',
    essence: 'You came here to move. Not from restlessness, but from an instinct for aliveness. Change is not your problem — stagnation is. The work is to channel your expansive energy into things that outlast the moment.',
    glyph:   '✦',
  },
  6: {
    name:    'The Nurturer',
    title:   'Sacred Keeper',
    essence: 'You came here to care — but not at the cost of yourself. Your love is one of your greatest powers. Your lesson is learning to give it without losing it. The people in your life feel your presence as a kind of shelter.',
    glyph:   '○',
  },
  7: {
    name:    'The Seeker',
    title:   'Inner Oracle',
    essence: 'You came here to know. Not to collect information, but to reach the truth underneath it. You are drawn inward when others move outward. Your depth is not distance — it is where your most valuable work happens.',
    glyph:   '⌘',
  },
  8: {
    name:    'The Authority',
    title:   'Power in Form',
    essence: 'You came here to master power — not to hold it over others, but to demonstrate what disciplined ambition looks like in integrity. You are built for significant things. The work is to align your power with your purpose.',
    glyph:   '∞',
  },
  9: {
    name:    'The Humanitarian',
    title:   'Sage of the Age',
    essence: 'You came here to complete — cycles, lessons, chapters. You carry the wisdom of many experiences. Your gift is the ability to hold complexity without being broken by it. You are here to serve something larger than yourself.',
    glyph:   '◉',
  },
  11: {
    name:    'The Illuminator',
    title:   'Master of Light ✦',
    essence: 'You came here to awaken. The 11 is the most spiritually charged of all numbers — sensitive, visionary, and capable of transmitting something rare into the world. Your challenge is to manage the intensity of your own frequency.',
    glyph:   '⟡',
  },
  22: {
    name:    'The Master Builder',
    title:   'Architecture of the Possible ✦',
    essence: 'You came here to construct at scale. The 22 bridges vision and form — what you can imagine, you can build. Your challenge is operating at the frequency your number demands without collapsing under its weight.',
    glyph:   '⬡',
  },
  33: {
    name:    'The Master Teacher',
    title:   'Embodied Wisdom ✦',
    essence: 'You came here to teach by becoming. The 33 is the highest expression of service — love made practical, wisdom made livable. Your challenge is not what to give, but learning to receive in equal measure.',
    glyph:   '✺',
  },
}

export function getArchetype(lifePathNumber: number): Archetype {
  return ARCHETYPES[lifePathNumber] ?? ARCHETYPES[1]
}

/** Derive a sub-archetype title from life path + zodiac combo */
export function getSubArchetype(lifePathNumber: number, zodiacAnimal: string): string {
  const base = ARCHETYPES[lifePathNumber]?.name ?? 'Seeker'
  const combos: Record<string, string> = {
    'Pioneer_Dragon':   'The Sovereign Initiator',
    'Pioneer_Tiger':    'The Bold Architect',
    'Builder_Ox':       'The Unbreakable Foundation',
    'Seeker_Snake':     'The Silent Oracle',
    'Authority_Dragon': 'The Dragon in Command',
    'Creator_Monkey':   'The Brilliant Innovator',
    'Illuminator_Rat':  'The Sharp Light Bringer',
    'Humanitarian_Dog': 'The Faithful Sage',
  }
  const key = `${base}_${zodiacAnimal}`
  return combos[key] ?? `${base} — ${zodiacAnimal} Expression`
}
