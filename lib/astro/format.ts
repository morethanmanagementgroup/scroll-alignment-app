// Small display helpers safe to import in the browser.

/** "UTC−4" / "UTC+5:30" / "UTC−4:56:02" */
export function formatOffset(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? '−' : '+'
  const a = Math.abs(offsetSeconds)
  const h = Math.floor(a / 3600)
  const m = Math.floor((a % 3600) / 60)
  const s = a % 60
  return `UTC${sign}${h}${m || s ? ':' + String(m).padStart(2, '0') : ''}${s ? ':' + String(s).padStart(2, '0') : ''}`
}

export function formatKm(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km).toLocaleString('en-US')} km`
}

export function formatMiles(km: number): string {
  const mi = km * 0.621371
  if (mi < 10) return `${mi.toFixed(1)} mi`
  return `${Math.round(mi).toLocaleString('en-US')} mi`
}

/** "Springfield, IL, United States" — numeric admin codes are omitted. */
export function placeLabel(p: { name: string; admin1: string; countryName: string; country: string }): string {
  const admin = p.admin1 && !/^\d+$/.test(p.admin1) ? `, ${p.admin1}` : ''
  return `${p.name}${admin}, ${p.countryName || p.country}`
}
