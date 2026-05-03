// ============================================================
// SCROLL ALIGNMENT — Numerology Engine
// Life Path Number calculation
// Preserves master numbers: 11, 22, 33
// ============================================================

const MASTER_NUMBERS = new Set([11, 22, 33])

/** Reduce a number to a single digit, preserving master numbers */
function reduceNumber(n: number): number {
  if (MASTER_NUMBERS.has(n)) return n
  if (n < 10) return n
  const sum = String(n).split('').reduce((acc, d) => acc + parseInt(d), 0)
  return reduceNumber(sum)
}

/**
 * Calculate Life Path Number from birth date string (YYYY-MM-DD)
 * Method: reduce month, day, and year separately, then sum and reduce.
 * Master numbers (11, 22, 33) are preserved at each step.
 */
export function calculateLifePathNumber(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number)

  const reducedMonth = reduceNumber(month)
  const reducedDay   = reduceNumber(day)
  const reducedYear  = reduceNumber(
    String(year).split('').reduce((acc, d) => acc + parseInt(d), 0)
  )

  const total = reducedMonth + reducedDay + reducedYear

  // Final reduction — preserve master numbers at final step too
  if (MASTER_NUMBERS.has(total)) return total
  return reduceNumber(total)
}

/** Determine if a life path number is a master number */
export function isMasterNumber(n: number): boolean {
  return MASTER_NUMBERS.has(n)
}

/** Get the display label for a life path number */
export function getLifePathLabel(n: number): string {
  const labels: Record<number, string> = {
    1:  'Life Path 1 — The Pioneer',
    2:  'Life Path 2 — The Diplomat',
    3:  'Life Path 3 — The Creator',
    4:  'Life Path 4 — The Builder',
    5:  'Life Path 5 — The Explorer',
    6:  'Life Path 6 — The Nurturer',
    7:  'Life Path 7 — The Seeker',
    8:  'Life Path 8 — The Authority',
    9:  'Life Path 9 — The Humanitarian',
    11: 'Life Path 11 — The Illuminator ✦',
    22: 'Life Path 22 — The Master Builder ✦',
    33: 'Life Path 33 — The Master Teacher ✦',
  }
  return labels[n] ?? `Life Path ${n}`
}

/** Monthly numerology theme (based on current month number) */
export function getMonthlyNumerology(month: number): number {
  return reduceNumber(month)
}

/** Get the personal year number for a given birth date and current year */
export function getPersonalYear(birthDate: string, currentYear: number): number {
  const [, month, day] = birthDate.split('-').map(Number)
  const reducedMonth = reduceNumber(month)
  const reducedDay   = reduceNumber(day)
  const reducedYear  = reduceNumber(
    String(currentYear).split('').reduce((acc, d) => acc + parseInt(d), 0)
  )
  const total = reducedMonth + reducedDay + reducedYear
  return MASTER_NUMBERS.has(total) ? total : reduceNumber(total)
}
