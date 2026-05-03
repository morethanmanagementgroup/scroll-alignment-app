// ============================================================
// SCROLL ALIGNMENT — Chinese Zodiac Engine
// MVP: Uses birth year for approximate zodiac.
// NOTE: Future version should calculate exact Chinese New Year
// boundary (typically Jan 21–Feb 20) for precision.
// ============================================================

export interface ZodiacProfile {
  animal: string
  element: string
  yin: boolean          // true = Yin, false = Yang
  symbol: string
  years: string         // example years
}

// 12-year zodiac cycle starting from base year 1900 (Rat)
const ZODIAC_CYCLE = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
] as const

// 10-year heavenly stem cycle (5 elements × 2)
// Even index = Yang, Odd index = Yin
// Element cycle: Wood(0-1), Fire(2-3), Earth(4-5), Metal(6-7), Water(8-9)
const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const

/**
 * Get Chinese Zodiac animal from birth year
 * NOTE: This is approximate — does not account for the exact
 * Chinese New Year date within the year. For people born
 * Jan 1–Feb 20 approximately, the previous year's animal may apply.
 * MVP: Use year-based calculation. Add date-boundary logic in V2.
 */
export function getChineseZodiac(birthYear: number): { animal: string; element: string } {
  const animalIndex = (birthYear - 1900) % 12
  const animal = ZODIAC_CYCLE[((animalIndex % 12) + 12) % 12]

  // Heavenly stems: (year - 4) % 10 gives stem index
  const stemIndex = (birthYear - 4) % 10
  const normalizedStem = ((stemIndex % 10) + 10) % 10
  const elementIndex = Math.floor(normalizedStem / 2)
  const element = ELEMENTS[elementIndex % 5]

  return { animal, element }
}

/** Get polarity (Yin/Yang) for a birth year */
export function getPolarity(birthYear: number): 'Yang' | 'Yin' {
  return birthYear % 2 === 0 ? 'Yang' : 'Yin'
}

/** Full zodiac description for snapshot and report */
export function getZodiacDescription(animal: string, element: string): string {
  const descriptions: Record<string, string> = {
    Rat:     'Adaptive, resourceful, and keenly observant. You read situations before others realize they have changed. Your intelligence is not loud — it is precise.',
    Ox:      'Steadfast, methodical, and quietly formidable. You build what others cannot sustain. Your power lives not in speed, but in the deliberate weight of what you create.',
    Tiger:   'Courageous, magnetic, and built for bold action. You are drawn to what matters and repelled by what does not. You lead from the front, even when no one is watching.',
    Rabbit:  'Perceptive, graceful, and diplomatically precise. You sense the room before you enter it. Your gift is knowing when to move and when to remain still.',
    Dragon:  'Visionary, intense, and built for significance. You carry an unusual combination of fire and depth. The work you are here to do is larger than most people will attempt.',
    Snake:   'Intuitive, strategic, and deeply interior. You know things without being told. Your wisdom is earned in silence and expressed in precision.',
    Horse:   'Energetic, freedom-oriented, and built for momentum. You are most yourself in motion — chasing what is alive, refusing what is settled.',
    Goat:    'Creative, empathic, and internally complex. You feel deeply, create beautifully, and carry a quiet wisdom that others seek without naming.',
    Monkey:  'Brilliant, versatile, and relentlessly curious. You solve what others cannot because you refuse to accept the first answer. Your mind is your primary instrument.',
    Rooster: 'Detail-oriented, expressive, and driven by excellence. You see what is imprecise and feel the pull to correct it. Integrity runs through everything you build.',
    Dog:     'Loyal, principled, and grounded in purpose. You operate from a deep moral clarity. The people you commit to receive the best of you — reliably, and without performance.',
    Pig:     'Abundant, sincere, and naturally generous. You move toward what is good without apology. Your gift is an instinct for what is real — in people, in work, in life.',
  }

  const elementMod: Record<string, string> = {
    Wood:   'Wood adds vision and growth — you build organically, guided by an instinct for what is alive.',
    Fire:   'Fire adds intensity and transformation — you move fast, feel deeply, and leave rooms changed.',
    Earth:  'Earth adds stability and practicality — you ground what others theorize and make the abstract real.',
    Metal:  'Metal adds precision and refinement — you are exacting in your standards and uncompromising in your craft.',
    Water:  'Water adds depth and intuition — you navigate by feeling, and your emotional intelligence is a strategic asset.',
  }

  const base = descriptions[animal] ?? `The ${animal} carries a distinct energetic signature.`
  const mod  = elementMod[element] ?? ''
  return `${base} ${mod}`.trim()
}
