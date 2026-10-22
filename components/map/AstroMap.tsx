'use client'
import { useEffect, useRef } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Map as MLMap, GeoJSONSource, ExpressionSpecification, MapMouseEvent } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import { feature } from 'topojson-client'
import countriesTopo from 'world-atlas/countries-110m.json'
import { PLANET_INFO } from '@/lib/astro/explanations'
import { ANGLES, BODIES } from '@/lib/astro/conventions'
import type { AngleName, AstroLineCollection, PlanetName } from '@/lib/astro/types'

export interface MapCity { name: string; lat: number; lon: number }
export interface MapHighlight { body: PlanetName; angle: AngleName; nearestLat: number; nearestLon: number }

interface Props {
  lines: AstroLineCollection
  bodies: PlanetName[]
  angles: AngleName[]
  city: MapCity | null
  highlight: MapHighlight | null
  approximate: boolean
  onLineClick: (body: PlanetName, angle: AngleName) => void
}

const DASH: Record<AngleName, number[] | null> = { MC: null, IC: [3, 2], ASC: null, DSC: [1, 1.6] }
const WIDTH: Record<AngleName, number> = { MC: 2, IC: 1.8, ASC: 2.4, DSC: 2.2 }

const colorExpr = [
  'match', ['get', 'body'],
  ...BODIES.flatMap(b => [b, PLANET_INFO[b].color]),
  '#C9A96E',
] as unknown as ExpressionSpecification

function graticule(): FeatureCollection {
  const features: FeatureCollection['features'] = []
  for (let lon = -180; lon <= 180; lon += 30) {
    features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[lon, -85], [lon, 85]] } })
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: number[][] = []
    for (let lon = -180; lon <= 180; lon += 5) pts.push([lon, lat])
    features.push({ type: 'Feature', properties: { equator: lat === 0 }, geometry: { type: 'LineString', coordinates: pts } })
  }
  return { type: 'FeatureCollection', features }
}

const empty: FeatureCollection = { type: 'FeatureCollection', features: [] }

export default function AstroMap({ lines, bodies, angles, city, highlight, approximate, onLineClick }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<MLMap | null>(null)
  const ready = useRef(false)
  const clickRef = useRef(onLineClick)
  clickRef.current = onLineClick
  const latest = useRef({ lines, bodies, angles, city, highlight, approximate })
  latest.current = { lines, bodies, angles, city, highlight, approximate }

  // Create the map once.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const maplibregl = (await import('maplibre-gl')).default
      if (cancelled || !el.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const countries = feature(countriesTopo as any, (countriesTopo as any).objects.countries) as unknown as FeatureCollection
      const m = new maplibregl.Map({
        container: el.current,
        attributionControl: { compact: true, customAttribution: 'Borders: Natural Earth · Places: GeoNames (CC BY 4.0)' },
        center: [0, 25],
        zoom: 0.6,
        minZoom: 0.2,
        maxZoom: 8,
        renderWorldCopies: true,
        dragRotate: false,
        pitchWithRotate: false,
        style: {
          version: 8,
          sources: {
            countries: { type: 'geojson', data: countries },
            graticule: { type: 'geojson', data: graticule() },
            astro: { type: 'geojson', data: latest.current.lines },
            connector: { type: 'geojson', data: empty },
            city: { type: 'geojson', data: empty },
          },
          layers: [
            { id: 'bg', type: 'background', paint: { 'background-color': '#0B0B17' } },
            { id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#171728' } },
            { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': '#2A2A44', 'line-width': 0.6 } },
            { id: 'grid', type: 'line', source: 'graticule', paint: {
              'line-color': ['case', ['==', ['get', 'equator'], true], '#3D2D52', '#1E1E33'] as unknown as ExpressionSpecification,
              'line-width': 0.6 } },
            ...ANGLES.map(a => ({
              id: `astro-${a}`, type: 'line' as const, source: 'astro',
              filter: ['==', ['get', 'angle'], a] as unknown as ExpressionSpecification,
              layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
              paint: {
                'line-color': colorExpr,
                'line-width': WIDTH[a],
                'line-opacity': 0.9,
                ...(DASH[a] ? { 'line-dasharray': DASH[a]! } : {}),
              },
            })),
            { id: 'astro-hit', type: 'line', source: 'astro', paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 14 } },
            { id: 'connector', type: 'line', source: 'connector', paint: { 'line-color': '#E2C98A', 'line-width': 1.4, 'line-dasharray': [2, 2] } },
            { id: 'city-halo', type: 'circle', source: 'city', paint: { 'circle-radius': 11, 'circle-color': '#C9A96E', 'circle-opacity': 0.18 } },
            { id: 'city-dot', type: 'circle', source: 'city', paint: { 'circle-radius': 5, 'circle-color': '#E2C98A', 'circle-stroke-color': '#080810', 'circle-stroke-width': 1.5 } },
          ],
        },
      })
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      m.on('load', () => { ready.current = true; sync() })
      m.on('click', 'astro-hit', (e: MapMouseEvent & { features?: { properties: Record<string, unknown> }[] }) => {
        const f = e.features?.[0]
        if (f) clickRef.current(f.properties.body as PlanetName, f.properties.angle as AngleName)
      })
      m.on('mouseenter', 'astro-hit', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'astro-hit', () => { m.getCanvas().style.cursor = '' })
      map.current = m
    })()
    return () => { cancelled = true; map.current?.remove(); map.current = null; ready.current = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function sync() {
    const m = map.current
    if (!m || !ready.current) return
    const { lines, bodies, angles, city, highlight, approximate } = latest.current
    ;(m.getSource('astro') as GeoJSONSource).setData(lines)
    const bodyFilter = ['in', ['get', 'body'], ['literal', bodies]] as unknown as ExpressionSpecification
    for (const a of ANGLES) {
      m.setFilter(`astro-${a}`, ['all', ['==', ['get', 'angle'], a], bodyFilter] as unknown as ExpressionSpecification)
      m.setLayoutProperty(`astro-${a}`, 'visibility', angles.includes(a) ? 'visible' : 'none')
      m.setPaintProperty(`astro-${a}`, 'line-opacity', approximate ? 0.65 : 0.9)
      const isHi = highlight ? ['all', ['==', ['get', 'body'], highlight.body], ['==', ['get', 'angle'], highlight.angle]] : false
      m.setPaintProperty(`astro-${a}`, 'line-width',
        (highlight ? ['case', isHi, WIDTH[a] + 2.5, WIDTH[a]] : WIDTH[a]) as unknown as ExpressionSpecification)
    }
    m.setFilter('astro-hit', ['all', bodyFilter, ['in', ['get', 'angle'], ['literal', angles]]] as unknown as ExpressionSpecification)

    ;(m.getSource('city') as GeoJSONSource).setData(city
      ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [city.lon, city.lat] } }] }
      : empty)
    if (city && highlight) {
      // Keep the connector short across the antimeridian.
      let lon = highlight.nearestLon
      if (lon - city.lon > 180) lon -= 360
      if (city.lon - lon > 180) lon += 360
      ;(m.getSource('connector') as GeoJSONSource).setData({ type: 'FeatureCollection', features: [{
        type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[city.lon, city.lat], [lon, highlight.nearestLat]] },
      }] })
    } else {
      (m.getSource('connector') as GeoJSONSource).setData(empty)
    }
  }

  useEffect(() => { sync() }, [lines, bodies, angles, city, highlight, approximate]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (city && map.current) map.current.flyTo({ center: [city.lon, city.lat], zoom: Math.max(map.current.getZoom(), 2.4), speed: 1.4 })
  }, [city])

  return <div ref={el} className="astro-map w-full h-full" role="application" aria-label="World map of your planetary lines" />
}
