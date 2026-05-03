// ============================================================
// SCROLL ALIGNMENT — Type Definitions
// Supabase-ready structure. localStorage for MVP.
// ============================================================

export type FocusArea =
  | 'Purpose' | 'Business' | 'Love' | 'Healing' | 'Discipline'
  | 'Fitness' | 'Money' | 'Creativity' | 'Spiritual Growth'
  | 'Shadow Work' | 'Leadership' | 'Family' | 'Career Transition'

export type GenerationMode = 'template' | 'admin-curated' | 'ai'

// ─── Core User ────────────────────────────────────────────────
export type UserPlan = 'free' | 'reading' | 'annual'

export interface User {
  id: string
  firstName: string
  email: string
  birthDate: string          // ISO 8601: YYYY-MM-DD
  birthTime?: string         // HH:MM (optional)
  birthCity: string
  birthRegion: string        // state / province
  birthCountry: string
  currentFocus: FocusArea
  currentIntention: string
  lifePathNumber: number     // 1–9, 11, 22, 33
  chineseZodiac: string
  chineseElement: string
  isPaid: boolean
  plan: UserPlan             // 'free' | 'reading' | 'annual'
  stripeSessionId?: string   // last Stripe checkout session ID
  createdAt: string          // ISO 8601
}

// ─── Scroll Snapshot (Free) ───────────────────────────────────
export interface ScrollSnapshot {
  userId: string
  lifePathNumber: number
  chineseZodiac: string
  coreArchetype: string
  strength: string
  shadow: string
  focusMessage: string
  affirmation: string
  actionStep: string
  generatedAt: string
}

// ─── Full Scroll Report (Paid) ────────────────────────────────
export interface FullScrollReport {
  userId: string
  openingMessage: string
  birthCodeSummary: string
  lifePathBreakdown: string
  chineseZodiacBreakdown: string
  coreArchetype: string
  strengthPattern: string
  shadowPattern: string
  businessPattern: string
  moneyPattern: string
  relationshipPattern: string
  bodyDisciplinePattern: string
  spiritualAssignment: string
  currentSeason: string
  recommendedColors: string[]
  recommendedFrequency: string
  morningRoutine: string[]
  eveningRoutine: string[]
  thirtyDayPlan: ThirtyDayEntry[]
  closingAffirmation: string
  createdAt: string
}

export interface ThirtyDayEntry {
  week: number
  theme: string
  focus: string
  practice: string
}

// ─── Admin Daily Theme ────────────────────────────────────────
export interface AdminDailyTheme {
  date: string               // YYYY-MM-DD
  collectiveTheme: string
  moonSeasonalNote: string
  spiritualMessage: string
  businessMessage: string
  bodyMessage: string
  shadowOfDay: string
  powerMove: string
  suggestedFrequency: string
  journalPrompt: string
  eveningReflection: string
}

// ─── Daily Scroll ─────────────────────────────────────────────
export interface DailyScroll {
  userId: string
  date: string               // YYYY-MM-DD
  theme: string
  energy: string
  spiritualAssignment: string
  businessAssignment: string
  bodyAssignment: string
  emotionalCheckIn: string
  shadowToWatch: string
  powerMove: string
  affirmation: string
  frequency: string
  journalPrompt: string
  actionWindow: string
  eveningReflection: string
  completionScore: number    // 0–100
  generationMode: GenerationMode
}

// ─── Journal Entry ────────────────────────────────────────────
export interface JournalEntry {
  id: string
  userId: string
  date: string               // YYYY-MM-DD
  mood: string
  energyLevel: number        // 1–10
  learned: string
  avoided: string
  grateful: string
  tomorrowIntention: string
  freeWrite: string
  createdAt: string
}

// ─── Routine ──────────────────────────────────────────────────
export interface RoutineItem {
  id: string
  label: string
  completed: boolean
  order: number
}

export interface Routine {
  userId: string
  date: string
  morning: RoutineItem[]
  evening: RoutineItem[]
  morningCompleted: boolean
  eveningCompleted: boolean
}

// ─── Calendar Day ─────────────────────────────────────────────
export interface CalendarDay {
  date: string
  theme: string
  journalCompleted: boolean
  morningRoutineCompleted: boolean
  eveningRoutineCompleted: boolean
  mainActionCompleted: boolean
  alignmentScore: number     // 0–100 (25 pts each)
}

// ─── Storage Interface (localStorage → Supabase ready) ────────
export interface StorageAdapter {
  getUser(): User | null
  saveUser(user: User): void
  getSnapshot(): ScrollSnapshot | null
  saveSnapshot(snapshot: ScrollSnapshot): void
  getFullReport(): FullScrollReport | null
  saveFullReport(report: FullScrollReport): void
  getDailyScroll(date: string): DailyScroll | null
  saveDailyScroll(scroll: DailyScroll): void
  getJournalEntries(): JournalEntry[]
  saveJournalEntry(entry: JournalEntry): void
  getRoutine(date: string): Routine | null
  saveRoutine(routine: Routine): void
  getAdminThemes(): AdminDailyTheme[]
  saveAdminTheme(theme: AdminDailyTheme): void
  getAdminThemeForDate(date: string): AdminDailyTheme | null
  clearAll(): void
}
