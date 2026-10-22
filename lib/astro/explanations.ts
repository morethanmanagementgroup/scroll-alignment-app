// ============================================================
// SCROLL ALIGNMENT — Line explanations (fixed copy, not AI)
// Interpretive text for each planet and angle. The calculation
// layer decides WHERE a line is; this file only says what the
// tradition associates with it. Safe to import in the browser.
// ============================================================

import type { AngleName, PlanetName } from './types'

export const PLANET_INFO: Record<PlanetName, { glyph: string; color: string; theme: string; gift: string; watch: string }> = {
  Sun:     { glyph: '☉', color: '#E2C98A', theme: 'identity, vitality, being seen',          gift: 'confidence and a clearer sense of who you are',       watch: 'ego and burnout from always being "on"' },
  Moon:    { glyph: '☽', color: '#C8C3D9', theme: 'emotion, home, belonging',                  gift: 'comfort, intuition and a feeling of home',            watch: 'moodiness and old family patterns resurfacing' },
  Mercury: { glyph: '☿', color: '#8FC1D4', theme: 'mind, speech, learning, trade',             gift: 'sharp thinking, networking and good conversations',  watch: 'restlessness and scattered focus' },
  Venus:   { glyph: '♀', color: '#E39BB6', theme: 'love, beauty, pleasure, money',             gift: 'ease, attraction, art and enjoyable relationships',   watch: 'indulgence and avoiding hard conversations' },
  Mars:    { glyph: '♂', color: '#E0765A', theme: 'drive, courage, conflict, the body',        gift: 'energy, initiative and physical stamina',             watch: 'friction, haste and burning out' },
  Jupiter: { glyph: '♃', color: '#D9A55B', theme: 'growth, luck, faith, teaching',             gift: 'opportunity, generosity and expansion',               watch: 'overpromising and excess' },
  Saturn:  { glyph: '♄', color: '#9C9483', theme: 'structure, discipline, time, mastery',      gift: 'focus, seriousness and long-term building',          watch: 'heaviness, delay and isolation' },
  Uranus:  { glyph: '♅', color: '#6FD0C5', theme: 'change, freedom, invention',                gift: 'breakthroughs and a break from routine',             watch: 'instability and sudden upheaval' },
  Neptune: { glyph: '♆', color: '#7F8FE0', theme: 'dreams, spirituality, imagination',         gift: 'inspiration, creativity and spiritual openness',     watch: 'confusion, escapism and blurred boundaries' },
  Pluto:   { glyph: '♇', color: '#A07AC9', theme: 'power, depth, transformation',              gift: 'intensity and the courage to transform',             watch: 'control struggles and emotional extremes' },
}

export const ANGLE_INFO: Record<AngleName, { name: string; short: string; meaning: string; geometry: string }> = {
  MC:  {
    name: 'Midheaven line', short: 'MC',
    meaning: 'career, reputation and public direction',
    geometry: 'Where this planet was directly overhead (at its highest point) at your birth moment.',
  },
  IC:  {
    name: 'Imum Coeli line', short: 'IC',
    meaning: 'home, roots, family and private life',
    geometry: 'Where this planet was directly underfoot (its lowest point, on the far side of the Earth) at your birth moment.',
  },
  ASC: {
    name: 'Ascendant line', short: 'ASC',
    meaning: 'self, body, first impressions and new starts',
    geometry: 'Where this planet was rising on the eastern horizon at your birth moment.',
  },
  DSC: {
    name: 'Descendant line', short: 'DSC',
    meaning: 'partners, clients and one-to-one relationships',
    geometry: 'Where this planet was setting on the western horizon at your birth moment.',
  },
}

export function lineTitle(body: PlanetName, angle: AngleName): string {
  return `${body} ${ANGLE_INFO[angle].short}`
}

export function lineExplanation(body: PlanetName, angle: AngleName): string {
  const p = PLANET_INFO[body]
  const a = ANGLE_INFO[angle]
  return `${a.geometry} Traditionally, ${body}'s themes of ${p.theme} show up here through ${a.meaning}. ` +
    `At its best this line brings ${p.gift}; the thing to watch is ${p.watch}.`
}

/** How strongly a line is usually felt at a given distance. A convention, not a measurement. */
export function influenceBand(km: number): { label: string; note: string } {
  if (km <= 150) return { label: 'Strong', note: 'within about 150 km of the line' }
  if (km <= 400) return { label: 'Noticeable', note: 'within about 400 km' }
  if (km <= 800) return { label: 'Faint', note: 'within about 800 km' }
  return { label: 'Distant', note: 'more than 800 km away' }
}

export const UNKNOWN_TIME_MESSAGE =
  'Astrocartography lines depend on the exact minute you were born. The Earth turns one degree ' +
  'every four minutes, so a birth time that is off by one hour moves every line about 15° of longitude — ' +
  'over 1,600 km at the equator. Without a recorded time, any line we drew could be in the wrong country. ' +
  'If you find your time (a birth certificate, hospital record or baby book), add it here and your map will appear.'
