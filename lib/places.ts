// ============================================================
// SCROLL ALIGNMENT — Place search (server-side)
// Searches the bundled GeoNames dataset (data/cities.json, built by
// scripts/build-cities.mjs). No third-party geocoding calls.
// ============================================================

import { readFileSync } from 'fs'
import path from 'path'
import type { Place } from './astro/types'

interface CityFile {
  columns: string[]
  zones: string[]
  rows: [number, string, string, string, string, number, number, number, number][]
  sources: Record<string, string>
}

interface Indexed {
  file: CityFile
  keys: string[]        // normalised primary names, same order as rows
  alt: string[]         // normalised alt names
  byId: Map<number, number>
}

let cache: Indexed | null = null
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

function load(): Indexed {
  if (cache) return cache
  const file = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'cities.json'), 'utf8')) as CityFile
  const keys = file.rows.map(r => normalise(r[1]))
  const alt = file.rows.map(r => normalise(r[2]))
  const byId = new Map<number, number>()
  file.rows.forEach((r, i) => byId.set(r[0], i))
  cache = { file, keys, alt, byId }
  return cache
}

export function normalise(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function toPlace(ix: Indexed, i: number): Place {
  const r = ix.file.rows[i]
  let countryName = r[3]
  try { countryName = regionNames.of(r[3]) ?? r[3] } catch { /* keep code */ }
  return {
    id: r[0], name: r[1], admin1: r[4], country: r[3], countryName,
    population: r[5], lat: r[6], lon: r[7], timeZone: ix.file.zones[r[8]],
  }
}

/**
 * Search by name prefix. "springfield, il" or "paris france" narrow by
 * the admin code / country after the comma or last word. Results are
 * ordered by population (the dataset is pre-sorted).
 */
export function searchPlaces(query: string, limit = 8): Place[] {
  const ix = load()
  const raw = query.trim()
  if (raw.length < 2) return []
  const [namePart, ...rest] = raw.split(',')
  const q = normalise(namePart)
  const qualifier = normalise(rest.join(' '))
  if (!q) return []

  const matches: number[] = []
  const contains: number[] = []
  for (let i = 0; i < ix.keys.length && matches.length < 400; i++) {
    const k = ix.keys[i]
    if (k.startsWith(q) || (ix.alt[i] && ix.alt[i].startsWith(q))) matches.push(i)
    else if (contains.length < 200 && q.length >= 4 && k.includes(q)) contains.push(i)
  }
  const pool = matches.length ? matches : contains
  const filtered = qualifier
    ? pool.filter(i => {
        const p = toPlace(ix, i)
        const hay = normalise(`${p.admin1} ${p.country} ${p.countryName}`)
        return qualifier.split(' ').every(w => hay.split(' ').some(h => h.startsWith(w)))
      })
    : pool
  // Exact name matches first, then by population (already sorted).
  const exact = filtered.filter(i => ix.keys[i] === q)
  const others = filtered.filter(i => ix.keys[i] !== q)
  return [...exact, ...others].slice(0, limit).map(i => toPlace(ix, i))
}

export function getPlaceById(id: number): Place | null {
  const ix = load()
  const i = ix.byId.get(id)
  return i === undefined ? null : toPlace(ix, i)
}

export function placeDataSources(): Record<string, string> {
  return load().file.sources
}

export { placeLabel } from './astro/format'
