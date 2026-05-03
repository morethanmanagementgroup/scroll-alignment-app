// ============================================================
// SCROLL ALIGNMENT — Core Generation Engine
// Three modes: Template · Admin-Curated · AI (placeholder)
// Default: Template Mode (no API cost)
// ============================================================

import { calculateLifePathNumber, getPersonalYear } from './numerology'
import { getChineseZodiac, getZodiacDescription } from './chineseZodiac'
import { getArchetype, getSubArchetype } from './archetypes'
import {
  LIFE_PATH_TEMPLATES,
  FOCUS_MESSAGES,
  DAY_THEMES,
  MONTHLY_THEMES,
} from './templates'
import type {
  User,
  ScrollSnapshot,
  FullScrollReport,
  DailyScroll,
  AdminDailyTheme,
  GenerationMode,
} from './types'

// ─── User Profile Calculation ─────────────────────────────────

export function enrichUserProfile(user: Partial<User>): {
  lifePathNumber: number
  chineseZodiac: string
  chineseElement: string
} {
  const birthDate = user.birthDate ?? '1990-01-01'
  const lifePathNumber = calculateLifePathNumber(birthDate)
  const birthYear = parseInt(birthDate.split('-')[0])
  const { animal, element } = getChineseZodiac(birthYear)
  return { lifePathNumber, chineseZodiac: animal, chineseElement: element }
}

// ─── Snapshot Generation (Free) ───────────────────────────────

export function generateScrollSnapshot(user: User): ScrollSnapshot {
  const template = LIFE_PATH_TEMPLATES[user.lifePathNumber]
    ?? LIFE_PATH_TEMPLATES[1]
  const focusData = FOCUS_MESSAGES[user.currentFocus]
  const archetype = getArchetype(user.lifePathNumber)

  return {
    userId:         user.id,
    lifePathNumber: user.lifePathNumber,
    chineseZodiac:  user.chineseZodiac,
    coreArchetype:  `${archetype.name} — ${archetype.title}`,
    strength:       template.snapshotStrength,
    shadow:         template.snapshotShadow,
    focusMessage:   focusData?.message ?? 'Your current focus is active. Pay attention to what keeps surfacing.',
    affirmation:    focusData?.affirmation ?? template.affirmations[0],
    actionStep:     focusData?.actionStep ?? 'Identify the one action today that has the most forward momentum.',
    generatedAt:    new Date().toISOString(),
  }
}

// ─── Full Report Generation (Paid — Template Mode) ───────────

export function generateFullReport(user: User): FullScrollReport {
  const template = LIFE_PATH_TEMPLATES[user.lifePathNumber]
    ?? LIFE_PATH_TEMPLATES[1]
  const archetype  = getArchetype(user.lifePathNumber)
  const subarch    = getSubArchetype(user.lifePathNumber, user.chineseZodiac)
  const zodiacDesc = getZodiacDescription(user.chineseZodiac, user.chineseElement)
  const now        = new Date()
  const personalYear = getPersonalYear(user.birthDate, now.getFullYear())

  const birthCodeSummary = [
    `Life Path ${user.lifePathNumber} · ${archetype.name}`,
    `${user.chineseElement} ${user.chineseZodiac}`,
    `Personal Year ${personalYear}`,
    `Primary Focus: ${user.currentFocus}`,
  ].join(' · ')

  const openingMessage = personalizeText(template.openingMessage, user)

  return {
    userId:                user.id,
    openingMessage,
    birthCodeSummary,
    lifePathBreakdown:     personalizeText(template.fullBreakdown, user),
    chineseZodiacBreakdown: zodiacDesc,
    coreArchetype:         `${archetype.name} — ${subarch}`,
    strengthPattern:       personalizeText(template.strengthPattern, user),
    shadowPattern:         personalizeText(template.shadowPattern, user),
    businessPattern:       personalizeText(template.businessPattern, user),
    moneyPattern:          personalizeText(template.moneyPattern, user),
    relationshipPattern:   personalizeText(template.relationshipPattern, user),
    bodyDisciplinePattern: personalizeText(template.bodyPattern, user),
    spiritualAssignment:   personalizeText(template.spiritualAssignment, user),
    currentSeason:         personalizeText(template.currentSeason, user),
    recommendedColors:     template.recommendedColors,
    recommendedFrequency:  template.recommendedFrequency,
    morningRoutine:        template.morningRoutine,
    eveningRoutine:        template.eveningRoutine,
    thirtyDayPlan:         template.thirtyDayThemes,
    closingAffirmation:    personalizeText(template.closingAffirmation, user),
    createdAt:             now.toISOString(),
  }
}

// ─── Daily Scroll Generation ──────────────────────────────────

/**
 * GENERATION MODE 1: Template Mode
 * Pure rule-based. No AI cost. Works offline.
 */
export function generateDailyScrollTemplate(
  user: User,
  date: string,
): DailyScroll {
  const d          = new Date(date + 'T12:00:00')
  const dayOfWeek  = d.getDay()
  const month      = d.getMonth() + 1
  const dayTheme   = DAY_THEMES[dayOfWeek]
  const monthTheme = MONTHLY_THEMES[month]
  const template   = LIFE_PATH_TEMPLATES[user.lifePathNumber] ?? LIFE_PATH_TEMPLATES[1]
  const focusData  = FOCUS_MESSAGES[user.currentFocus]

  // Rotate affirmations based on day of month to add variety
  const dom = d.getDate()
  const affirmationPool = template.affirmations
  const affirmation = affirmationPool[dom % affirmationPool.length]

  const energy = `${dayTheme.energy} ${monthTheme.message.split('.')[0]}.`

  return {
    userId:              user.id,
    date,
    theme:               `${dayTheme.theme} · ${monthTheme.theme}`,
    energy,
    spiritualAssignment: personalizeDailyText(dayTheme.spiritualAssignment, user),
    businessAssignment:  personalizeDailyText(dayTheme.businessAssignment, user),
    bodyAssignment:      dayTheme.bodyAssignment,
    emotionalCheckIn:    dayTheme.emotionalCheckIn,
    shadowToWatch:       `${dayTheme.shadowToWatch} — For the ${getArchetype(user.lifePathNumber).name}: ${template.snapshotShadow.split('—')[0].trim()}.`,
    powerMove:           dayTheme.powerMove,
    affirmation,
    frequency:           dayTheme.frequency,
    journalPrompt:       dayTheme.journalPrompt,
    actionWindow:        dayTheme.actionWindow,
    eveningReflection:   dayTheme.eveningReflection,
    completionScore:     0,
    generationMode:      'template',
  }
}

/**
 * GENERATION MODE 2: Admin-Curated Mode
 * Merges admin daily master theme with user profile.
 * Highest quality without AI cost.
 */
export function generateDailyScrollAdminCurated(
  user: User,
  date: string,
  adminTheme: AdminDailyTheme,
): DailyScroll {
  const template   = LIFE_PATH_TEMPLATES[user.lifePathNumber] ?? LIFE_PATH_TEMPLATES[1]
  const d          = new Date(date + 'T12:00:00')
  const dom        = d.getDate()
  const affirmation = template.affirmations[dom % template.affirmations.length]

  // Merge admin theme with user-personalized content
  const personalizedBusiness = `${adminTheme.businessMessage} — For you specifically: ${FOCUS_MESSAGES[user.currentFocus]?.actionStep ?? 'Take the action that has been waiting.'}`
  const personalizedShadow   = `${adminTheme.shadowOfDay} — Your personal pattern to watch: ${template.snapshotShadow.split('—')[0].trim()}.`

  return {
    userId:              user.id,
    date,
    theme:               adminTheme.collectiveTheme,
    energy:              adminTheme.moonSeasonalNote,
    spiritualAssignment: adminTheme.spiritualMessage,
    businessAssignment:  personalizedBusiness,
    bodyAssignment:      adminTheme.bodyMessage,
    emotionalCheckIn:    `Check in with yourself: how is your ${user.currentFocus.toLowerCase()} focus feeling today?`,
    shadowToWatch:       personalizedShadow,
    powerMove:           adminTheme.powerMove,
    affirmation,
    frequency:           adminTheme.suggestedFrequency,
    journalPrompt:       adminTheme.journalPrompt,
    actionWindow:        '8am – 12pm · Your peak execution window',
    eveningReflection:   adminTheme.eveningReflection,
    completionScore:     0,
    generationMode:      'admin-curated',
  }
}

/**
 * GENERATION MODE 3: AI Mode — PLACEHOLDER
 * Future version: Replace this with Claude/OpenAI API call.
 *
 * To activate:
 * 1. Install @anthropic-ai/sdk or openai
 * 2. Add NEXT_PUBLIC_AI_MODE=true to .env.local
 * 3. Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env.local
 * 4. Replace the stub below with actual API calls
 * 5. See /docs/ai-integration.md for prompt templates
 */
export async function generateDailyScrollAI(
  user: User,
  date: string,
): Promise<DailyScroll> {
  // AI MODE PLACEHOLDER — remove this block when activating AI
  console.warn('[Scroll AI] AI mode not yet activated. Falling back to template mode.')
  return generateDailyScrollTemplate(user, date)

  /* FUTURE AI IMPLEMENTATION:
  const prompt = buildScrollPrompt(user, date)
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    system: SCROLL_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })
  return parseAIResponse(response, user, date)
  */
}

// ─── Smart Daily Scroll Router ────────────────────────────────

/**
 * Generates the best available daily scroll based on what is available.
 * Priority: Admin-Curated > Template
 * (AI mode must be manually enabled)
 */
export function generateDailyScroll(
  user: User,
  date: string,
  adminTheme?: AdminDailyTheme | null,
  mode: GenerationMode = 'template',
): DailyScroll {
  if (mode === 'admin-curated' && adminTheme) {
    return generateDailyScrollAdminCurated(user, date, adminTheme)
  }
  return generateDailyScrollTemplate(user, date)
}

// ─── Personalization Helpers ──────────────────────────────────

function personalizeText(text: string, user: User): string {
  return text
    .replace(/\[NAME\]/g, user.firstName)
    .replace(/\[FOCUS\]/g, user.currentFocus)
    .replace(/\[INTENTION\]/g, user.currentIntention)
    .replace(/\[ZODIAC\]/g, user.chineseZodiac)
}

function personalizeDailyText(text: string, user: User): string {
  const focusAddition = FOCUS_MESSAGES[user.currentFocus]?.actionStep ?? ''
  const personalized = personalizeText(text, user)
  // For certain heavy execution assignments, add focus context
  if (text.includes('highest-leverage') && focusAddition) {
    return `${personalized} Specifically for your ${user.currentFocus} focus: ${focusAddition}`
  }
  return personalized
}

// ─── Alignment Score Calculator ───────────────────────────────

export function calculateAlignmentScore(options: {
  morningRoutineCompleted: boolean
  mainActionCompleted: boolean
  journalCompleted: boolean
  eveningReflectionCompleted: boolean
}): number {
  let score = 0
  if (options.morningRoutineCompleted)     score += 25
  if (options.mainActionCompleted)         score += 25
  if (options.journalCompleted)            score += 25
  if (options.eveningReflectionCompleted)  score += 25
  return score
}

// ─── Default Routines ─────────────────────────────────────────

export function getDefaultMorningRoutine(lifePathNumber: number) {
  const template = LIFE_PATH_TEMPLATES[lifePathNumber] ?? LIFE_PATH_TEMPLATES[1]
  return template.morningRoutine.map((label, i) => ({
    id: `morning-${i}`,
    label,
    completed: false,
    order: i,
  }))
}

export function getDefaultEveningRoutine(lifePathNumber: number) {
  const template = LIFE_PATH_TEMPLATES[lifePathNumber] ?? LIFE_PATH_TEMPLATES[1]
  return template.eveningRoutine.map((label, i) => ({
    id: `evening-${i}`,
    label,
    completed: false,
    order: i,
  }))
}
