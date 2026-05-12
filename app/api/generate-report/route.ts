// ============================================================
// SCROLL ALIGNMENT — AI Report Generation
// POST /api/generate-report
// Calls Claude to generate a fully personalized FullScrollReport.
// Requires ANTHROPIC_API_KEY in environment variables.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import type { User, FullScrollReport, ThirtyDayEntry } from '@/lib/types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// ── Build the generation prompt ───────────────────────────────

function buildPrompt(user: User, personalYear: number): string {
  return `You are the voice of Scroll Alignment — a sacred, premium spiritual-business alignment system. Your voice is:
- Direct, grounded, practical — never fluffy or generic
- Spiritually intelligent but not religious or preachy
- Honest about shadow patterns without being fear-based
- Written as if this person's entire birth code has been read deeply and you are delivering something true
- Premium quality — this is a $33 personal reading. Every sentence must earn its place.

The person's birth profile:
- Name: ${user.firstName}
- Life Path Number: ${user.lifePathNumber}${user.lifePathNumber === 11 ? ' (Master Number — The Intuitive Channel)' : user.lifePathNumber === 22 ? ' (Master Number — The Master Builder)' : user.lifePathNumber === 33 ? ' (Master Number — The Master Teacher)' : ''}
- Chinese Zodiac: ${user.chineseZodiac}
- Chinese Element: ${user.chineseElement}
- Personal Year (numerology): ${personalYear}
- Current Focus Area: ${user.currentFocus}
- Current Intention: "${user.currentIntention}"
- Birth City: ${user.birthCity}, ${user.birthRegion}, ${user.birthCountry}
- Birth Date: ${user.birthDate}

Generate a complete, deeply personalized Full Scroll Alignment reading for ${user.firstName}. This reading must feel as if it was written specifically for them — not a template. Use their name naturally. Reference their Chinese zodiac and element in the context of their life path. Let their current focus (${user.currentFocus}) and intention thread through the relevant sections.

Return ONLY valid JSON matching this exact structure (no markdown, no explanation, just the JSON object):

{
  "openingMessage": "3-4 sentences. Sacred, direct, personal. Address them by name. Speak to what their specific combination of Life Path ${user.lifePathNumber} + ${user.chineseElement} ${user.chineseZodiac} + ${user.currentFocus} focus means right now.",

  "birthCodeSummary": "One line — the key codes: Life Path ${user.lifePathNumber} · [archetype name] · ${user.chineseElement} ${user.chineseZodiac} · Personal Year ${personalYear} · ${user.currentFocus} Season",

  "lifePathBreakdown": "3 paragraphs. Deep breakdown of Life Path ${user.lifePathNumber}. What this number means at its core, how it shapes the way ${user.firstName} moves through the world, and what the recurring growth edge looks like. Be specific — name real patterns, not generic wisdom.",

  "chineseZodiacBreakdown": "2 paragraphs. The ${user.chineseZodiac} in ${user.chineseElement} energy. How these two forces combine. What gifts they create, what tensions they produce. How this interacts with Life Path ${user.lifePathNumber}.",

  "coreArchetype": "The archetype name + short title. Format: '[Name] — [Title]'. E.g. 'The Architect — Builder of Original Structures'. Make it specific to the LP ${user.lifePathNumber} + ${user.chineseZodiac} combination.",

  "strengthPattern": "2 paragraphs. ${user.firstName}'s genuine strengths as revealed by this birth code. Name specific capacities. Be precise — not 'you are strong' but what specific strength pattern operates in them.",

  "shadowPattern": "2 paragraphs. The real shadow pattern for this combination. Be honest and specific — name the actual behavioral pattern, what triggers it, what it costs them. No sugarcoating. This is the most valuable section.",

  "businessPattern": "2 paragraphs. How ${user.firstName} is built to operate in work and business. What structure suits them, what kills their momentum, what their real business superpower is in the context of ${user.currentFocus}.",

  "moneyPattern": "2 paragraphs. The specific relationship with money this code produces. What creates flow, what creates blocks. What the actual financial practice should be.",

  "relationshipPattern": "2 paragraphs. How this combination operates in close relationships. What they need, what they give, where the friction pattern lives.",

  "bodyDisciplinePattern": "2 paragraphs. How ${user.firstName}'s specific code relates to physical discipline, health, and the body. What movement and recovery practices suit this combination.",

  "spiritualAssignment": "2 paragraphs. The spiritual practice and assignment for this life path + zodiac combination right now. What the deeper work is beneath the surface work.",

  "currentSeason": "2 paragraphs. What Personal Year ${personalYear} means for ${user.firstName}, filtered through their focus on ${user.currentFocus} and their intention: '${user.currentIntention}'. Make this feel timely and accurate.",

  "recommendedColors": ["3-5 colors that align with LP ${user.lifePathNumber} + ${user.chineseElement} energy. Be specific — not just 'gold' but 'deep amber gold' or 'forest emerald'."],

  "recommendedFrequency": "One specific Hz frequency recommendation with a 1-sentence explanation of why it aligns with this code.",

  "morningRoutine": ["5-7 specific morning practices for this exact combination. Each item should be 1 sentence — actionable, not vague."],

  "eveningRoutine": ["4-6 specific evening practices. Each item 1 sentence."],

  "thirtyDayPlan": [
    {"week": 1, "theme": "Week 1 theme", "focus": "What to focus on this week (2 sentences)", "practice": "The specific daily practice (1 sentence)"},
    {"week": 2, "theme": "Week 2 theme", "focus": "What to focus on this week (2 sentences)", "practice": "The specific daily practice (1 sentence)"},
    {"week": 3, "theme": "Week 3 theme", "focus": "What to focus on this week (2 sentences)", "practice": "The specific daily practice (1 sentence)"},
    {"week": 4, "theme": "Week 4 theme", "focus": "What to focus on this week (2 sentences)", "practice": "The specific daily practice (1 sentence)"}
  ],

  "closingAffirmation": "One powerful sentence — a personal affirmation written specifically for ${user.firstName}'s code. Not generic. This is the line they will remember."
}`
}

// ── Calculate personal year ───────────────────────────────────
function getPersonalYear(birthDate: string, currentYear: number): number {
  const [, month, day] = birthDate.split('-').map(Number)
  const sum = String(month).split('').reduce((a, d) => a + parseInt(d), 0)
         + String(day).split('').reduce((a, d) => a + parseInt(d), 0)
         + String(currentYear).split('').reduce((a, d) => a + parseInt(d), 0)
  let n = sum
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d), 0)
  }
  return n
}

// ── Route handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured in environment variables.' },
      { status: 500 }
    )
  }

  let user: User
  try {
    const body = await req.json()
    user = body.user as User
    if (!user?.id || !user?.birthDate) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const personalYear = getPersonalYear(user.birthDate, new Date().getFullYear())
  const prompt = buildPrompt(user, personalYear)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[generate-report] Anthropic error:', err)
      return NextResponse.json({ error: 'AI generation failed', detail: err }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text ?? ''

    // Strip markdown code fences if present
    const jsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    let reportData: Partial<FullScrollReport>
    try {
      reportData = JSON.parse(jsonText)
    } catch {
      console.error('[generate-report] JSON parse failed:', jsonText.slice(0, 300))
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 })
    }

    // Validate + fill required fields
    const report: FullScrollReport = {
      userId:                user.id,
      openingMessage:        reportData.openingMessage        ?? '',
      birthCodeSummary:      reportData.birthCodeSummary      ?? '',
      lifePathBreakdown:     reportData.lifePathBreakdown     ?? '',
      chineseZodiacBreakdown: reportData.chineseZodiacBreakdown ?? '',
      coreArchetype:         reportData.coreArchetype         ?? '',
      strengthPattern:       reportData.strengthPattern       ?? '',
      shadowPattern:         reportData.shadowPattern         ?? '',
      businessPattern:       reportData.businessPattern       ?? '',
      moneyPattern:          reportData.moneyPattern          ?? '',
      relationshipPattern:   reportData.relationshipPattern   ?? '',
      bodyDisciplinePattern: reportData.bodyDisciplinePattern ?? '',
      spiritualAssignment:   reportData.spiritualAssignment   ?? '',
      currentSeason:         reportData.currentSeason         ?? '',
      recommendedColors:     Array.isArray(reportData.recommendedColors) ? reportData.recommendedColors : [],
      recommendedFrequency:  reportData.recommendedFrequency  ?? '',
      morningRoutine:        Array.isArray(reportData.morningRoutine) ? reportData.morningRoutine : [],
      eveningRoutine:        Array.isArray(reportData.eveningRoutine) ? reportData.eveningRoutine : [],
      thirtyDayPlan:         Array.isArray(reportData.thirtyDayPlan)
        ? (reportData.thirtyDayPlan as ThirtyDayEntry[])
        : [],
      closingAffirmation:    reportData.closingAffirmation    ?? '',
      createdAt:             new Date().toISOString(),
    }

    return NextResponse.json({ report })

  } catch (err) {
    console.error('[generate-report]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
