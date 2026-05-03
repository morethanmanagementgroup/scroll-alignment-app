// ============================================================
// SCROLL ALIGNMENT — The Scroll Style Bible
// All template content for rule-based generation.
// Voice: sacred · direct · grounded · practical ·
//        emotionally intelligent · action-oriented · premium
// NOT: corny · fear-based · deterministic · cheesy
// ============================================================

import type { FocusArea } from './types'

// ─── Life Path Templates ──────────────────────────────────────

export interface LifePathTemplate {
  openingMessage: string
  birthCodeSummary: string
  fullBreakdown: string
  strengthPattern: string
  shadowPattern: string
  businessPattern: string
  moneyPattern: string
  relationshipPattern: string
  bodyPattern: string
  spiritualAssignment: string
  currentSeason: string
  recommendedColors: string[]
  recommendedFrequency: string
  thirtyDayThemes: { week: number; theme: string; focus: string; practice: string }[]
  closingAffirmation: string
  morningRoutine: string[]
  eveningRoutine: string[]
  affirmations: string[]
  snapshotStrength: string
  snapshotShadow: string
}

export const LIFE_PATH_TEMPLATES: Record<number, LifePathTemplate> = {
  1: {
    openingMessage: `You carry the frequency of the origin point — the first move, the blank page, the moment before everything begins. This is not a small thing to hold. It means your life is constantly asking you to initiate, even when the room is silent and no one else is moving. The question your scroll returns to, in season after season, is this: are you building from your own blueprint, or from the one the world handed you? You were made to lead from the inside out.`,

    birthCodeSummary: `Life Path 1 · Pioneer Frequency · Independent Architect · Original Force`,

    fullBreakdown: `The 1 is the number of origin — pure initiation, undiluted will, and the courage to begin. You are built for leadership not as a position but as a frequency. You move through the world with an instinct for what is possible before it exists, and an impatience with anything that has already peaked.

Your life will consistently return you to a single question: are you living from your own knowing, or from the script others handed you? Every time you override your inner authority for external approval, you feel it — not as failure, but as a low-grade static that accumulates until something breaks open.

The 1 does not need permission. Your growth work is not learning how to lead — it is learning to trust what you already know before the evidence arrives.`,

    strengthPattern: `You initiate where others wait. You carry an original frequency that is difficult to replicate — because it comes from source, not from study. When you are aligned, you can move a room with a single decision. Your confidence, when rooted in genuine self-knowing rather than performance, becomes the kind of presence others build their own courage around.`,

    shadowPattern: `The shadow of the 1 is isolation disguised as independence. When you feel misunderstood or unseen, the instinct is to need no one — to prove that you were right to go alone. This is the pattern that costs you the most. True leadership is not solitary. It is the ability to hold a vision while keeping real people around you. Watch for the moment you start editing others out of your story rather than letting them in.`,

    businessPattern: `You are built to build your own thing. Working inside someone else's structure will always create friction because your instinct is to see how something could be done differently — and then do it. The businesses that suit you are the ones you originate, not the ones you inherit. Your weakness is starting more than finishing. The discipline of completion is where your business power lives.`,

    moneyPattern: `Money follows your confidence, not your effort. When you are self-doubting and seeking external validation before you move, you will find money elusive. When you are grounded in your own knowing and acting from genuine conviction, money tends to find you faster than you expect. The practice is to stop waiting for permission before you price your work at what it is actually worth.`,

    relationshipPattern: `You love most powerfully when you are not trying to manage the other person's experience of you. The 1 can be magnetic in relationship — decisive, committed, present. The shadow is control masquerading as care. Real intimacy requires that you let someone see you before you've decided how to frame it. This is the work.`,

    bodyPattern: `Your body responds to challenge. Soft routines feel like stagnation. You need movement that tests something — strength training, competitive athletics, long-distance endurance work. The discipline of a physical practice is also where your mental clarity lives. When you skip the body, the mind loses its precision. Build the physical container first.`,

    spiritualAssignment: `Your spiritual assignment is to learn the difference between your will and the will that moves through you. You are not the originator — you are the instrument of origination. The deepest practice for the 1 is surrender without passivity: moving forward with full commitment while holding your plan loosely enough for the larger intelligence to redirect it.`,

    currentSeason: `You are in a season of consolidation — not of new beginnings, but of deepening what you have already started. The instinct will be to launch the next thing. The invitation is to complete the current one with the same intensity you used to begin it. This is where the 1 earns its next level.`,

    recommendedColors: ['Deep Crimson', 'Solar Gold', 'Midnight Black'],
    recommendedFrequency: '396 Hz — Liberation from fear and guilt · Root activation',

    morningRoutine: [
      'Wake without checking phone — 5 minutes of silence first',
      'Cold exposure (30–90 seconds) — activates the pioneer frequency',
      'State your singular intention for the day aloud',
      'Physical movement — minimum 20 minutes, challenge-based',
      'Read one page of something that demands your mind',
      'Name the one thing that, if completed today, makes everything else secondary',
    ],

    eveningRoutine: [
      'Review the day — what did you initiate, what did you avoid?',
      'Release what did not move — tomorrow is a new origin point',
      'Note one moment where you trusted your own knowing',
      'Set tomorrow\'s singular intention before sleep',
      'Stillness practice — 10 minutes, no agenda',
    ],

    thirtyDayThemes: [
      { week: 1, theme: 'Origin', focus: 'Identify the one thing you have been waiting for permission to begin', practice: 'Write your unedited vision — no one will see this' },
      { week: 2, theme: 'Authority', focus: 'Make one major decision this week without seeking external input first', practice: 'Notice the gap between what you know and what you act on' },
      { week: 3, theme: 'Completion', focus: 'Finish one thing you started and abandoned', practice: 'The unfinished thing holds more of your energy than a new beginning would' },
      { week: 4, theme: 'Consolidation', focus: 'Let what you have built be enough for now', practice: 'Rest is not the absence of ambition. It is the preparation for the next level.' },
    ],

    closingAffirmation: `I do not need the room to confirm what I already know. I initiate from my own knowing, complete what I begin, and trust that the vision came to me because I am the one built to carry it forward.`,

    affirmations: [
      'I lead from the inside out.',
      'My knowing does not require external confirmation.',
      'I begin before I am ready, because readiness is built in motion.',
      'I complete what I start. This is where my power compounds.',
      'My independence is not isolation — it is sovereignty.',
    ],

    snapshotStrength: 'Original vision — you see what is possible before others realize it is missing.',
    snapshotShadow:   'The habit of waiting for permission from rooms that were never meant to give it.',
  },

  2: {
    openingMessage: `You carry the frequency of the bridge — the sacred space between what is divided. This is one of the most underrated energies in the room, and one of the most powerful. You feel what others cannot yet name. You sense the dynamic before anyone has spoken a word. Your life keeps returning you to the same question: are you bridging from wholeness, or from the fear of conflict? The answer to that question changes everything about how your gift lands.`,

    birthCodeSummary: `Life Path 2 · Diplomat Frequency · Sacred Bridge · Harmonic Intelligence`,

    fullBreakdown: `The 2 is the number of relationship — of polarity, connection, and the space between two things. You are built not for the spotlight but for the architecture of environments that allow others to shine. This is not a smaller role. It is a different kind of power.

Your gift is emotional intelligence so acute it operates below the surface of language. You know when something is wrong before anyone has admitted it. You feel the undercurrent of a room before anyone else has noticed the current.

The challenge of the 2 is learning that sensitivity is not the same as vulnerability, and that having a strong internal position is not the same as conflict. You can hold a firm point of view and remain in relationship. This is the integration the 2 is here to learn.`,

    strengthPattern: `You create environments where depth becomes possible. Your sensitivity is not a liability — it is your primary instrument. When you are in alignment, others feel safer, more seen, and more able to access their own clarity. You do not lead by commanding. You lead by creating the conditions where leadership in others becomes inevitable.`,

    shadowPattern: `The shadow of the 2 is over-accommodation: giving so much of yourself to the harmony of the room that your own needs become invisible — first to others, then to yourself. The pattern often looks like peace but functions as self-erasure. Watch for the moment you agree when you mean no. That is where the energy leak begins.`,

    businessPattern: `You work best in partnership or in roles that require extraordinary interpersonal skill. You are not meant to build alone — your power multiplies in collaboration. The businesses that suit you are relational: consulting, facilitation, design, mediation, curation. Your weakness is underpricing yourself because you are uncomfortable making the ask. The work is to separate your worth from other people's comfort.`,

    moneyPattern: `Money is complicated for the 2 because it requires a kind of directness that feels at odds with your nature. The breakthrough comes when you realize that asking clearly for what you are worth is also an act of care — for yourself and for the integrity of the exchange. Undercharging is not generosity. It is a pattern that eventually produces resentment.`,

    relationshipPattern: `You are one of the most naturally gifted partners in the entire numerology system — attentive, deeply feeling, committed. Your challenge is not love. It is maintaining yourself within love. The relationship that works for you is the one where you do not have to disappear to be accepted. Look for that. Build for that.`,

    bodyPattern: `Your body responds to gentleness and rhythm. Aggressive training programs often feel violent to your system. Yoga, pilates, swimming, walking, dance — these allow you to access your body as a sensory instrument rather than a machine to be managed. Breathwork is particularly powerful for clearing emotional accumulation.`,

    spiritualAssignment: `Your spiritual assignment is to learn that your needs are not an imposition. This is the deepest cut for the 2: the belief that the highest expression of love is self-sacrifice. The truth is that the most sustainable version of your gift is one that includes you in its care.`,

    currentSeason: `You are in a season of reclamation — recovering your own voice within environments that have learned to count on your silence. This does not require drama. It requires one honest act of self-representation at a time.`,

    recommendedColors: ['Soft Silver', 'Pale Blue', 'Dusty Rose'],
    recommendedFrequency: '528 Hz — Love frequency · DNA repair · Emotional restoration',

    morningRoutine: [
      'Begin with stillness — before absorbing anyone else\'s energy',
      'Set a clear energetic intention for who you are today',
      'Gentle movement — yoga, stretching, or a quiet walk',
      'One moment of beauty — music, a poem, something that opens your chest',
      'Write your needs for today, before the day writes them for you',
    ],

    eveningRoutine: [
      'Decompress from the emotional weight of the day',
      'Identify one moment where you stayed true to yourself',
      'Release what you absorbed from others that was not yours to keep',
      'Note one thing you want to say that you did not say today',
      'Sleep with intention — the 2 processes enormously at night',
    ],

    thirtyDayThemes: [
      { week: 1, theme: 'Presence', focus: 'Practice arriving fully in each interaction — not managing it', practice: 'Notice when you disappear to make room for others' },
      { week: 2, theme: 'Voice', focus: 'Say one true thing each day that you would normally soften', practice: 'Your perspective is the contribution, not an imposition' },
      { week: 3, theme: 'Boundaries', focus: 'Identify one pattern of over-accommodation and interrupt it', practice: 'No is a complete sentence' },
      { week: 4, theme: 'Receiving', focus: 'Accept one offer of care or help each day without deflecting', practice: 'Let yourself be given to' },
    ],

    closingAffirmation: `I am the bridge — between people, between possibilities, between what is and what could be. I build from wholeness, not from fear. My needs are not an imposition. They are part of the exchange.`,

    affirmations: [
      'My sensitivity is my precision instrument.',
      'I hold space for others without losing my own.',
      'Harmony that includes me is the only harmony worth building.',
      'My "no" protects the integrity of my "yes."',
      'I receive care with the same openness I give it.',
    ],

    snapshotStrength: 'Emotional intelligence — you read rooms, people, and dynamics with rare precision.',
    snapshotShadow:   'The habit of making yourself invisible to preserve other people\'s comfort.',
  },

  3: {
    openingMessage: `You carry the frequency of expression — the word, the idea, the creative act that makes the invisible visible. There is something in you that was built to communicate, and when you are doing it well, people feel it as a kind of electricity. The question your scroll returns to is whether you are creating from your genuine self or performing for approval. The answer determines whether your gift becomes a life or a career.`,
    birthCodeSummary: `Life Path 3 · Creator Frequency · Living Expression · Communication Architect`,
    fullBreakdown: `The 3 is the number of creation — the synthesis of 1 and 2, the child of initiation and relationship, born into expression. You are made to communicate. Your words, your art, your ideas — these are not hobbies. They are your primary instrument for being alive. When you are in alignment with this, creativity feels like breathing. When you are not, you feel a specific kind of suffocation.

The 3 carries enormous creative power and the particular shadow of that power: self-doubt disguised as perfectionism, and performance disguised as presence. The work is to create from the interior, not for the exterior — to make things because they are true, not because they will be approved of.`,
    strengthPattern: `You communicate what others cannot yet say. Your ability to take the formless and give it shape — in words, visuals, sound, story — is a genuine gift. When you own this without apology, you become the kind of voice that opens things up for everyone in the room.`,
    shadowPattern: `The shadow of the 3 is the gap between potential and output — the unfinished creative projects, the half-written books, the ideas that dissolve under the pressure of self-criticism. The inner critic of the 3 is fierce, and it is sophisticated enough to disguise itself as discernment. Watch for when "not ready" means "afraid."`,
    businessPattern: `You build through communication — through writing, speaking, teaching, or creating. The businesses that suit you are ones built on your authentic voice. Your weakness is visibility: you can create brilliantly in private and struggle to put it out. The practice is to release before perfect, because perfect is where the 3 hides.`,
    moneyPattern: `Your income follows your creative output. When you are creating and sharing, doors open. When you are in your head, they close. The financial practice for the 3 is to monetize the thing you would do anyway, and to stop treating creative work as less serious than conventional work.`,
    relationshipPattern: `You are drawn to people who can match your depth of feeling and your speed of thought. Relationships that cannot hold your full range — your humor, your intensity, your need for creative stimulation — eventually become small rooms. Look for people who want more of you, not a quieter version.`,
    bodyPattern: `Your body needs movement that involves expression — dance, martial arts, voice work, breathwork that connects to emotion. Purely mechanical exercise bores you quickly. Find movement that feels like creation.`,
    spiritualAssignment: `Your spiritual assignment is to create without an audience in mind. To make something purely because it is true. The 3's deepest practice is to return to the creative act before it was meant for anyone — before it had to justify itself.`,
    currentSeason: `You are in a season of creative emergence — something that has been forming internally is ready to come forward. The resistance you feel is not a sign that it's wrong. It's the friction before the release.`,
    recommendedColors: ['Amber', 'Cobalt Blue', 'Rich Violet'],
    recommendedFrequency: '741 Hz — Expression, intuition, problem-solving',
    morningRoutine: ['Begin with a creative act before anything else — write, draw, play', 'Read something that uses language beautifully', 'Speak your intention aloud — the 3 activates through voice', 'Move your body in a way that has rhythm', 'Name one thing you want to create or express today'],
    eveningRoutine: ['Review what you created or contributed today', 'Note one moment of genuine expression', 'Release the self-criticism — it is not discernment', 'Free-write for 5 minutes with no audience', 'Sleep is where the 3 integrates its creative processing'],
    thirtyDayThemes: [
      { week: 1, theme: 'Output', focus: 'Create something small every day and release it', practice: 'The practice is release, not perfection' },
      { week: 2, theme: 'Voice', focus: 'Identify the thing you have been waiting to say', practice: 'Say it in writing first, then aloud' },
      { week: 3, theme: 'Completion', focus: 'Finish one creative project you have left incomplete', practice: 'Done is more powerful than perfect' },
      { week: 4, theme: 'Visibility', focus: 'Share something real with someone who can receive it', practice: 'Creative courage is built in small acts of exposure' },
    ],
    closingAffirmation: `I create because it is true, not because it will be approved. My voice is the gift. I release it without waiting for permission.`,
    affirmations: ['I create before I am ready.', 'My expression is my service.', 'Done is more powerful than perfect.', 'I share what is real, not what is safe.', 'My creative frequency opens doors I cannot see from here.'],
    snapshotStrength: 'The ability to make the invisible visible — through words, ideas, and creative expression.',
    snapshotShadow:   'Perfectionism that functions as procrastination — the creative block dressed as discernment.',
  },

  4: {
    openingMessage: `You carry the frequency of the foundation — the invisible structure that makes everything else possible. Without you, the visionary's ideas remain unbuilt. You understand what it takes to make something real, and that understanding is one of the rarest things in the world. Your scroll keeps returning you to a single question: are you building something that actually reflects your values, or have you been disciplined in service of someone else's vision?`,
    birthCodeSummary: `Life Path 4 · Builder Frequency · Foundation Keeper · Architecture of the Real`,
    fullBreakdown: `The 4 is the number of structure — the earth beneath the feet of everything that grows. You build not because you have to, but because you understand that without foundation, nothing stands. Your instinct for process, order, and reliability is not rigidity. It is craftsmanship.

The 4's challenge is flexibility: learning to hold structure as a tool rather than an identity. When the plan needs to change, the 4 often resists — not from stubbornness but from a deep knowing that stability is sacred. The work is to build systems that are strong enough to hold but flexible enough to grow.`,
    strengthPattern: `You execute what others can only imagine. Your capacity for disciplined work, for showing up consistently, for seeing a project through its most difficult phase — this is the infrastructure of every great thing. When you commit to something, it gets built.`,
    shadowPattern: `The shadow of the 4 is rigidity — the tendency to mistake the plan for the purpose. When the situation changes and the 4 holds the original structure past its usefulness, the structure becomes a cage. Watch for when discipline becomes avoidance of what needs to be reconsidered.`,
    businessPattern: `You are the builder that every business needs and rarely has. Your weakness is taking on operational weight that belongs to others. The business that suits you is one where your systems and processes are valued at their actual worth — not taken for granted because they function invisibly.`,
    moneyPattern: `You understand money as a function of consistent effort — and you are right. The practice is to build financial systems with the same care you bring to your other work. Automate, structure, and review. Money responds to the 4's methodical energy better than any other number.`,
    relationshipPattern: `You are the most reliable partner in the room — and sometimes the most underappreciated for it. Your presence, your consistency, your follow-through — these are acts of love that can be easy to take for granted. Look for partners who actively celebrate your reliability rather than simply counting on it.`,
    bodyPattern: `Your body needs consistent routine and measurable progress. You thrive with structure: the same gym time, the same movement practice, the same sleep window. When the routine slips, everything else begins to feel unstable. Protect the physical structure first.`,
    spiritualAssignment: `Your spiritual assignment is to build something that will outlast you — and to find meaning in the process of building it, not just the completion. The 4 often delays satisfaction until the project is done. The practice is to find the sacred in the act of laying the next brick.`,
    currentSeason: `You are in a season of consolidation — reviewing the structures you have built to determine which ones are still load-bearing and which ones have become habit. This is the audit that allows the next phase of growth.`,
    recommendedColors: ['Forest Green', 'Dark Earth Brown', 'Slate Blue'],
    recommendedFrequency: '285 Hz — Energy field, tissue restoration, safety and security',
    morningRoutine: ['Wake at the same time — consistency is your power source', 'Physical movement first — the body is your primary structure', 'Review your priority list — know the one thing before the day begins', 'Brief stillness — let the structure settle before you enter it', 'Eat with intention — fuel the machine that builds the foundation'],
    eveningRoutine: ['Review: what did you build today?', 'Clear your workspace — external order supports internal order', 'Note what needs to carry forward', 'Release what did not get done — tomorrow\'s structure holds it', 'Consistent sleep window — the 4 regenerates in rhythm'],
    thirtyDayThemes: [
      { week: 1, theme: 'Systems', focus: 'Audit the structures in your life — what is load-bearing, what is just habit?', practice: 'Remove one system that is costing more than it produces' },
      { week: 2, theme: 'Flexibility', focus: 'Allow one plan to change without resistance', practice: 'The foundation is not the blueprint — it is the intention' },
      { week: 3, theme: 'Value', focus: 'Price one thing at what it is actually worth to build', practice: 'Your labor has a real cost. Account for it.' },
      { week: 4, theme: 'Legacy', focus: 'Identify the thing you are building that will outlast you', practice: 'Work on it for one hour this week with no deadline attached' },
    ],
    closingAffirmation: `I build what lasts. My discipline is not a burden — it is the architecture of my power. I lay the foundation with care and trust that what is built on solid ground cannot be easily moved.`,
    affirmations: ['I build with precision and purpose.', 'My consistency is my compound interest.', 'Structure is not rigidity — it is freedom with a frame.', 'I complete what I commit to.', 'What I build outlasts the moment it was built in.'],
    snapshotStrength: 'Unmatched capacity for disciplined, consistent execution — you build what others only imagine.',
    snapshotShadow:   'The tendency to hold the original plan past its usefulness — when discipline becomes inflexibility.',
  },

  5: {
    openingMessage: `You carry the frequency of movement — of aliveness, of the next horizon, of the thing that hasn't been tried yet. You are built for change in a world that often resists it. The question your scroll keeps returning to is not how to settle down, but how to channel your expansive energy into things that accumulate rather than scatter. Freedom is your highest value. The discipline of focused freedom is your highest work.`,
    birthCodeSummary: `Life Path 5 · Explorer Frequency · Freedom Current · Catalyst of the New`,
    fullBreakdown: `The 5 is the number of experience — the number at the center of the single digits, pulling in every direction at once. You were not built for one thing. You were built for everything — sequentially, deeply, and on your own terms.

Your relationship with freedom is your most important relationship. When you feel constrained — by routine, by commitment, by other people's expectations — you contract. When you feel free, you expand into the most alive version of yourself. The work is not to limit this but to direct it.`,
    strengthPattern: `You adapt faster than anyone in the room. Your ability to read shifting conditions, pivot without losing momentum, and find opportunity inside chaos is a genuine strategic advantage. You are at your best when the environment is uncertain and the path is not yet clear.`,
    shadowPattern: `The shadow of the 5 is dispersal — starting more than finishing, accumulating experiences without allowing them to compound, and using "freedom" as a reason to avoid the deeper work that requires sustained attention. Watch for when movement becomes a way of avoiding depth.`,
    businessPattern: `You are built for ventures that require agility, creativity, and the ability to work across multiple domains. The businesses that suit you are non-linear: consulting, media, travel, speaking, anything that rewards versatility. Your challenge is to build enough structure to capture the value of your movement.`,
    moneyPattern: `Your income is variable by nature — high when your energy is high and directed, low when it is scattered. The financial practice for the 5 is to create automated systems that save and protect during high-income periods so that the inevitable cycles of exploration don't create financial instability.`,
    relationshipPattern: `You need a partner who does not require you to be still. Relationships that try to contain your nature will eventually fail — not because you are uncommittable, but because containment is not love. Look for partners who are energized by your aliveness rather than threatened by it.`,
    bodyPattern: `Variety is the only thing that keeps the 5 in a body practice. Alternate between modalities — run one week, swim the next, rock climb, martial arts, dance. The practice that remains interesting is the one that gets done. Monotonous routines are the fastest way to ensure the 5 stops moving entirely.`,
    spiritualAssignment: `Your spiritual assignment is to go deep in one direction long enough to find what is there. The 5 is drawn to the breadth of experience — the next place, the next teacher, the next idea. The practice is to stay when the staying gets uncomfortable, and to discover that depth is its own form of freedom.`,
    currentSeason: `You are in a season of focused expansion — the invitation is not to stop moving, but to move in one primary direction long enough to see what accumulates. This is not limitation. This is the difference between a scattered light and a laser.`,
    recommendedColors: ['Electric Blue', 'Copper', 'Turquoise'],
    recommendedFrequency: '528 Hz — Transformation, freedom, positive change',
    morningRoutine: ['Vary your mornings to prevent routine resistance', 'Physical movement — high intensity, short duration', 'One piece of content that sparks a new idea', 'Name your focus for the day — the ONE thing', 'Decide what adventure this day contains, however small'],
    eveningRoutine: ['What did you learn today that you did not know yesterday?', 'Did your movement serve your direction or replace it?', 'Note one thing you want to go deeper on', 'Release the day\'s unfinished threads — they will find their moment', 'Brief stillness — the 5 needs to practice landing'],
    thirtyDayThemes: [
      { week: 1, theme: 'Direction', focus: 'Name the one direction you are moving in this month', practice: 'Everything else is secondary this month' },
      { week: 2, theme: 'Depth', focus: 'Stay with one topic, one project, or one relationship longer than feels comfortable', practice: 'What is beneath the surface when you stop moving?' },
      { week: 3, theme: 'Accumulation', focus: 'Review what the last year of movement has built', practice: 'What compounds if you keep going in this direction?' },
      { week: 4, theme: 'Integration', focus: 'Connect three seemingly unrelated experiences into a single insight', practice: 'Your breadth becomes your expertise when you synthesize it' },
    ],
    closingAffirmation: `I move with purpose and depth. My freedom is directed, not scattered. I accumulate what matters and release what does not. The horizon I am moving toward is worth the sustained attention.`,
    affirmations: ['My freedom is my power when it is directed.', 'I go deep before I go wide.', 'Movement and depth are not opposites.', 'I accumulate what matters.', 'My aliveness is an asset, not a liability.'],
    snapshotStrength: 'Adaptive intelligence — you pivot, read changing conditions, and find opportunity where others see only disruption.',
    snapshotShadow:   'Dispersal — the pattern of beginning more than completing, and using movement to avoid depth.',
  },

  6: {
    openingMessage: `You carry the frequency of care — of home, of beauty, of the invisible labor that holds everything together. Your gift is profound and often taken for granted precisely because it functions so quietly. The question your scroll returns to is whether you are caring from fullness or from depletion. The version of you that gives from a full place changes lives. The version that gives from an empty one loses itself.`,
    birthCodeSummary: `Life Path 6 · Nurturer Frequency · Sacred Keeper · The One Who Holds`,
    fullBreakdown: `The 6 is the number of responsibility — of love made practical, of care made structural. You feel the needs of the people around you before they feel them themselves. This is not a burden. It is a frequency. The challenge is to use it consciously rather than reactively.

You are built for relationships, for community, for the creation of environments where others can thrive. Your gift is the ability to hold a situation with both love and pragmatism — to care deeply and still see clearly. The work is to include yourself in the care you so naturally extend to others.`,
    strengthPattern: `You create conditions where others can become their best selves. Your presence is stabilizing, your care is practical, and your commitment runs deeper than most. When you are aligned, you are the kind of person whose involvement makes everything better — not louder, but truer.`,
    shadowPattern: `The shadow of the 6 is martyrdom — the accumulation of unmet needs that eventually becomes resentment. It does not arrive dramatically. It arrives as a slow erosion: the yes that should have been a no, the standard you held for others that you never applied to yourself. Watch for when your care becomes a way of controlling outcomes.`,
    businessPattern: `You build through relationships and reputation. The businesses that suit you are service-oriented, values-driven, and built on trust. Your weakness is undercharging for the invisible labor — the emotional attunement, the care in the detail, the reliability that others simply count on. Name that value. Price it.`,
    moneyPattern: `Money is complicated for the 6 because it requires self-advocacy in contexts that feel transactional. The breakthrough is understanding that financial stability is also an act of care — for yourself, for your family, for the people who depend on you. Prosperity is not self-indulgent. It is what allows you to keep giving.`,
    relationshipPattern: `You are one of the most naturally devoted partners in the system — but your devotion can become a way of avoiding your own needs. The relationship that is right for you is not the one that needs you most. It is the one that sees you most clearly and actively cares for you in return.`,
    bodyPattern: `Your body holds the emotional weight of the people you care for. Regular practices that release that accumulation are essential: massage, yoga, swimming, time in nature. Practices that bring you back into your own body — rather than constantly in service of others\' — are non-negotiable maintenance.`,
    spiritualAssignment: `Your spiritual assignment is to learn that the most loving thing you can do for others is to be genuinely well. Not performing wellness — actually attending to your own restoration. The 6 that is full gives something fundamentally different from the 6 that is running on depletion.`,
    currentSeason: `You are in a season of reclamation — recovering your own needs within relationships and responsibilities that have learned to overlook them. This is not selfish. This is structural repair.`,
    recommendedColors: ['Rose Gold', 'Sage Green', 'Warm Ivory'],
    recommendedFrequency: '639 Hz — Harmonizing relationships, connection, love',
    morningRoutine: ['Begin the morning for yourself — before the needs of the household begin', 'Identify what YOU need today before you tend to others', 'Gentle movement — something that feels like care, not punishment', 'A moment of beauty — flowers, music, light', 'Set one boundary or intention for how you will protect your energy today'],
    eveningRoutine: ['Release the emotional weight of the day — it is not yours to sleep with', 'Identify one moment where you cared for yourself', 'Note what you gave today that deserves to be acknowledged', 'What do you need tomorrow that you can arrange tonight?', 'Rest without guilt — restoration is part of the work'],
    thirtyDayThemes: [
      { week: 1, theme: 'Self-Inventory', focus: 'Identify your three most unmet needs right now', practice: 'Write them without judgment or justification' },
      { week: 2, theme: 'Boundaries', focus: 'Say no to one request that you would normally absorb', practice: 'Notice what the boundary protects' },
      { week: 3, theme: 'Receiving', focus: 'Ask for help with something you have been carrying alone', practice: 'Allow someone to care for you in return' },
      { week: 4, theme: 'Fullness', focus: 'Do one thing this week that is purely for your own joy', practice: 'Not useful to anyone — purely for you' },
    ],
    closingAffirmation: `I give from fullness, not from depletion. My care for others begins with care for myself. I include myself in the love I so naturally extend to the world.`,
    affirmations: ['My needs are not an imposition.', 'I care most effectively when I am genuinely well.', 'Receiving is part of the exchange.', 'My love is not diminished by my boundaries — it is protected by them.', 'I am allowed to be cared for.'],
    snapshotStrength: 'The ability to hold others with both love and clarity — practical care that builds environments where people thrive.',
    snapshotShadow:   'The pattern of giving past your own capacity, until care becomes depletion and devotion becomes resentment.',
  },

  7: {
    openingMessage: `You carry the frequency of the depth seeker — the one who cannot settle for the surface answer, who knows that what is visible is rarely the whole story. Your mind is one of your most powerful instruments. The question your scroll returns to is whether you are using your depth to live more fully or to withdraw from the discomfort of being seen. The seeker who stays in the cave eventually has no one to teach.`,
    birthCodeSummary: `Life Path 7 · Seeker Frequency · Inner Oracle · The One Who Knows`,
    fullBreakdown: `The 7 is the number of inner knowing — of research, solitude, and the kind of intelligence that requires stillness to function. You are built for depth. Surface conversations feel like noise. Small talk feels like energy expenditure with no return. You want to know what is actually happening underneath what people present.

Your gift is the ability to synthesize disparate information into rare insight. Your challenge is bringing that insight back from the interior and making it available to the world — which requires a kind of vulnerability that does not come naturally to the 7.`,
    strengthPattern: `You see beneath the surface of things. Your analytical intelligence is matched by your intuitive intelligence — you process on multiple levels simultaneously. When you trust this and express it, you produce insight that cannot be generated by people who stay at the level of the obvious.`,
    shadowPattern: `The shadow of the 7 is isolation — using depth as a reason to remain unavailable, using intelligence as a defense against intimacy. The 7 can construct elaborate inner worlds that become more real than the outer one. Watch for when your interiority becomes a hiding place rather than a laboratory.`,
    businessPattern: `You are built for research, strategy, spiritual leadership, technology, writing, or any domain where depth thinking is the primary value. Your challenge is execution and partnership — you need people around you who can take your insights into form. Build relationships with strong executors.`,
    moneyPattern: `Your relationship to money is ambivalent — you understand it intellectually but can find the exchange of money for spiritual or intellectual work uncomfortable. The breakthrough is understanding that charging for depth is an act of respect: for your work, for the receiver, and for the integrity of the exchange.`,
    relationshipPattern: `You need a partner who does not require constant access to you. Your solitude is not absence — it is where you regenerate and generate. The relationship that works is one where your inner life is respected, your silences are not taken personally, and genuine depth of connection is valued over quantity of interaction.`,
    bodyPattern: `Your body is often the last thing on the 7\'s list, and this is a significant pattern to interrupt. Grounding practices — walking in nature, swimming, barefoot contact with the earth — are particularly effective. The 7 needs to regularly come back into the body after extended periods of mental or spiritual work.`,
    spiritualAssignment: `Your spiritual assignment is to bring what you know back from the depths and make it usable for others. The wisdom gathered in solitude is not meant to stay there. The 7\'s deepest work is the translation — taking the interior knowing and finding the language that brings others into it.`,
    currentSeason: `You are in a season of emergence — after a period of inward work, something is ready to come forward. The resistance you feel about sharing is not a sign that you're not ready. It is the friction before the release.`,
    recommendedColors: ['Indigo', 'Silver', 'Forest Green'],
    recommendedFrequency: '852 Hz — Awakening intuition, returning to spiritual order',
    morningRoutine: ['Protect the first hour from external input — your morning mind is most clear', 'Meditation or contemplative practice — minimum 10 minutes', 'Write before you read — capture what your mind generated overnight', 'Brief physical grounding — walking outside, even briefly', 'Set an intention for what you want to understand today'],
    eveningRoutine: ['Review what you discovered or understood today', 'Release the overstimulation of the day — the 7 accumulates input', 'Write one insight worth keeping', 'Extended stillness before sleep — the 7 processes most during rest', 'Set an internal question for overnight processing'],
    thirtyDayThemes: [
      { week: 1, theme: 'Synthesis', focus: 'Take three things you know deeply and find the connection between them', practice: 'The 7\'s gift is the insight that lives at the intersection' },
      { week: 2, theme: 'Expression', focus: 'Share one piece of your interior knowing with someone who can receive it', practice: 'Start with writing — the 7 often thinks most clearly on the page' },
      { week: 3, theme: 'Embodiment', focus: 'Increase your physical practice this week', practice: 'The insight you have been carrying needs a body to move through the world' },
      { week: 4, theme: 'Teaching', focus: 'Teach one thing you know to one person who could use it', practice: 'Teaching clarifies what you know. It does not require you to know everything.' },
    ],
    closingAffirmation: `I bring what I know back from the depths. My interiority is a laboratory, not a hiding place. What I have gathered in solitude belongs to the world.`,
    affirmations: ['My depth is a contribution, not a withdrawal.', 'I trust my knowing before the evidence arrives.', 'Sharing what I know is an act of service.', 'Solitude restores me. Isolation diminishes me. I know the difference.', 'I translate the interior and bring it forward.'],
    snapshotStrength: 'Rare depth of insight — the ability to synthesize complex information into truth that others cannot reach at the surface level.',
    snapshotShadow:   'The withdrawal reflex — using depth and solitude as protection from the vulnerability of being seen.',
  },

  8: {
    openingMessage: `You carry the frequency of power made real — of abundance, authority, and the understanding that significant work requires significant resources. Your life keeps returning you to the question of how you relate to power: do you pursue it from a place of wholeness or from a wound? The 8 that builds from wholeness changes industries. The 8 that builds from fear of scarcity or unworthiness builds things that collapse under their own weight.`,
    birthCodeSummary: `Life Path 8 · Authority Frequency · Power in Form · Master of Abundance`,
    fullBreakdown: `The 8 is the number of power — material, spiritual, and organizational. You are built for significant impact, significant resources, and significant leadership. The infinity symbol of your number is not accidental: you are meant to cycle between accumulation and distribution, between receiving and giving, in a way that continuously generates more.

The 8\'s deepest challenge is the relationship between power and worth. If you believe, at a deep level, that you are not worthy of abundance, you will unconsciously sabotage the structures you build. If you believe power is inherently corrupt, you will avoid reaching the scale at which your actual impact lives. The work is to claim your power cleanly, in alignment with your values.`,
    strengthPattern: `You understand how systems work — how power moves, how resources flow, how organizations succeed or fail. When you are aligned, you make things that work at scale. Your strategic intelligence, your willingness to operate at significant scope, and your ability to make hard decisions are the architecture of your gift.`,
    shadowPattern: `The shadow of the 8 is the confusion of worth with net worth — measuring your value by external metrics of success. When this pattern runs, the 8 can build impressively and feel perpetually insufficient. The accumulation never reaches the feeling it was supposed to produce. Watch for when achievement is being used to address something that achievement cannot solve.`,
    businessPattern: `You are built to operate at significant scale. The businesses that suit you are ones where the stakes are real, the scope is large, and the impact is measurable. Your challenge is delegation — the 8 often holds more operational control than is wise because releasing control feels like releasing power. The practice is to understand that leverage is the highest form of power.`,
    moneyPattern: `Money is your primary feedback loop — not because you are materialistic, but because it is the domain where your power is most legible to you. Your relationship to money is healthy when it is a tool for impact rather than a scorecard. The 8 that builds for impact creates abundance as a byproduct. The 8 that chases abundance as a goal often finds it hollow.`,
    relationshipPattern: `You need a partner who is not intimidated by your ambition and not dependent on your approval. The 8 in relationship can unconsciously dominate — not from malice but from the momentum of natural authority. The most generative partnerships for the 8 are those where the other person can hold their own ground, push back, and call you on your patterns.`,
    bodyPattern: `Power training is natural for the 8 — weightlifting, competitive sport, high-intensity work. Your body responds to the same discipline you bring to your professional life. The practice is consistency: the 8 often trains hard in cycles and neglects the body entirely between them. Find the sustainable rhythm.`,
    spiritualAssignment: `Your spiritual assignment is to learn that true power is not something you acquire — it is something you embody. The 8 that has done the inner work leads differently from the one still running from scarcity. The practice is to develop your interior authority at the same rate as your exterior influence.`,
    currentSeason: `You are in a season of harvest — the work of previous cycles is producing results. The invitation is to receive what has been built rather than immediately redirecting it into the next initiative. Let yourself experience the abundance of this moment before launching the next chapter.`,
    recommendedColors: ['Deep Gold', 'Black', 'Royal Blue'],
    recommendedFrequency: '432 Hz — Universal harmony, power in alignment',
    morningRoutine: ['Physical power practice — the 8 leads with the body', 'Review your key metrics — know where you stand', 'Set your power intention for the day — what significant thing will move?', 'Gratitude practice — the 8 needs to consciously counter the "never enough" loop', 'Identify the one decision today that has the most leverage'],
    eveningRoutine: ['What power did you exercise today in alignment with your values?', 'What did you build today that compounds?', 'Release the control you are trying to maintain overnight', 'Gratitude — not as performance, as genuine inventory', 'Rest is how the 8 recovers its power for tomorrow'],
    thirtyDayThemes: [
      { week: 1, theme: 'Alignment', focus: 'Audit your current work — is it building what actually matters to you?', practice: 'Separate what you do for external validation from what you do for genuine impact' },
      { week: 2, theme: 'Delegation', focus: 'Release one thing you have been holding that belongs to someone else', practice: 'Your power multiplies through other people\'s excellence' },
      { week: 3, theme: 'Receiving', focus: 'Accept abundance in one form this week without immediately redirecting it', practice: 'The 8 that cannot receive is always running empty' },
      { week: 4, theme: 'Legacy', focus: 'Define what you are building that goes beyond personal accumulation', practice: 'This is where the 8\'s power finds its fullest expression' },
    ],
    closingAffirmation: `I claim my power cleanly and use it in service of what matters. I build at scale without losing sight of purpose. Abundance is the byproduct of aligned impact.`,
    affirmations: ['My power is aligned with my purpose.', 'I receive abundance without guilt.', 'I build at scale — this is not ego, it is my assignment.', 'Delegation is the highest form of power.', 'My worth is not a function of my net worth.'],
    snapshotStrength: 'Strategic authority — the ability to understand how power moves and to direct it toward significant, lasting impact.',
    snapshotShadow:   'The confusion of worth with achievement — using external success to address something that external success cannot solve.',
  },

  9: {
    openingMessage: `You carry the frequency of completion — of all nine numbers, the full range of human experience compressed into a single point. You have lived enough, seen enough, and felt enough to know that the simplest truths are the deepest ones. Your scroll returns you, season after season, to the question of service: not what you can get, but what you came here to give — and whether you are giving it from genuine wisdom or from a wound that has not yet been named.`,
    birthCodeSummary: `Life Path 9 · Humanitarian Frequency · Sage of the Age · The One Who Completes`,
    fullBreakdown: `The 9 is the number of completion — of universal love, of the wisdom that comes from having traveled the full range of experience. You carry within you a frequency that transcends personal agenda: you are built to serve something larger than yourself, and you feel it most acutely when you are not.

The 9\'s challenge is that the very expansiveness of your nature can become an avoidance of the personal work. When everything is about the collective, nothing is asked of the individual. The work is to bring your universal love down to the level of the specific — specific commitments, specific relationships, specific acts of care that require you to show up as a particular person, not just a frequency.`,
    strengthPattern: `You hold complexity without being broken by it. Your capacity for compassion — including for people and situations that others have given up on — is one of the rarest qualities in the room. When you bring this forward in service of something real, you produce a kind of presence that cannot be manufactured.`,
    shadowPattern: `The shadow of the 9 is the universal that avoids the personal — the person who loves humanity but struggles with specific humans, who has wisdom for everyone else\'s journey but resists the particular work of their own. Watch for when "service" is being used as an exit from intimacy.`,
    businessPattern: `You are built for work that carries purpose — social impact, education, healing, the arts, spiritual leadership. The businesses that suit you are ones that serve something beyond profit. Your challenge is sustainability: the 9 often gives so much that the financial structure of the business becomes precarious. Your gift requires a container that keeps it viable.`,
    moneyPattern: `The 9\'s most common money pattern is giving it away before it accumulates — to causes, to people, to the next need that appears. The financial practice is to build a structure that gives sustainably: a percentage system, an endowment mindset, a reserve that allows the giving to continue without periodic collapse.`,
    relationshipPattern: `You love with an unusual breadth — you genuinely care about the people in your life at a level that does not diminish easily. Your challenge is the particular: being present to this specific person, in this specific moment, with this specific need, without retreating into the universal. Real intimacy requires specificity.`,
    bodyPattern: `Your body is often the recipient of what you carry for others. Regular practices that clear emotional residue are essential: extended breathwork, sound healing, time in natural water, restorative yoga. The 9 that does not clear regularly eventually saturates, and what was compassion becomes overwhelm.`,
    spiritualAssignment: `Your spiritual assignment is completion — finishing what you have started, releasing what has run its course, and making peace with the chapters that are closing. The 9 is here to model graceful completion. This is its own form of leadership.`,
    currentSeason: `You are in a season of release — letting go of something that has served its purpose. This is not loss. It is graduation. What you release creates the space for what is next.`,
    recommendedColors: ['Deep Violet', 'Burgundy', 'Gold'],
    recommendedFrequency: '963 Hz — Return to oneness, crown activation, universal connection',
    morningRoutine: ['Begin with a moment of connection to something larger than today\'s tasks', 'Set an intention for service — what will you give today?', 'Body clearing practice — shake, stretch, breathe deeply', 'Read or listen to something that expands your understanding', 'Name one specific thing you will do for one specific person today'],
    eveningRoutine: ['What did you complete today — fully, without residue?', 'What did you give that felt genuinely aligned?', 'Clear what you absorbed from the collective today', 'Name one thing you are releasing that is no longer yours to carry', 'Rest in the knowledge that completion is its own form of love'],
    thirtyDayThemes: [
      { week: 1, theme: 'Completion', focus: 'Identify three things in your life that are overdue for completion', practice: 'Complete one this week — fully, with intention' },
      { week: 2, theme: 'Specificity', focus: 'Practice being fully present to one specific person each day', practice: 'Your universal love becomes most powerful at the particular level' },
      { week: 3, theme: 'Sustainability', focus: 'Audit your giving — where are you giving past your capacity?', practice: 'Build a sustainable structure for your generosity' },
      { week: 4, theme: 'Release', focus: 'Identify what you are ready to graduate from', practice: 'Ending something with full presence is one of the highest acts' },
    ],
    closingAffirmation: `I serve from wisdom, not from wound. I complete what I begin, release what has run its course, and trust that my universal love is most powerful when it is made specific.`,
    affirmations: ['I serve what is real, not what is comfortable.', 'My compassion includes myself.', 'I complete with the same care I begin.', 'Release is not loss — it is graduation.', 'I love specifically, not just universally.'],
    snapshotStrength: 'The capacity to hold complexity and human contradiction without being destroyed by it — compassion as a strategic instrument.',
    snapshotShadow:   'The universal that avoids the personal — loving humanity while struggling with the particular work of specific relationships.',
  },

  11: {
    openingMessage: `You carry one of the rarest frequencies in the numerological system — the 11, the master number of illumination. You feel things at a register that others do not have access to. You sense what is coming before it arrives. You see what is hidden in the plain sight of a room. This is not imagination. It is perception operating at a higher sensitivity than the average. The question your scroll returns to is whether you are managing that sensitivity or developing it.`,
    birthCodeSummary: `Life Path 11 ✦ · Master Illuminator · Frequency Carrier · Sacred Visionary`,
    fullBreakdown: `The 11 is a master number — it carries both the intensity of the 11 and the shadow of the 2. You are simultaneously called to a level of spiritual insight and intimacy that most people never approach, and pulled toward the 2\'s challenges of self-erasure and over-accommodation. The master number does not reduce to the single digit without cost.

Your gift is the ability to transmit something — a frequency, an insight, a way of seeing — that genuinely changes the people who receive it. This is not metaphor. People leave conversations with you different than they arrived. The challenge is developing the container for that gift: the emotional regulation, the boundary structures, and the self-knowledge required to transmit without burning out.`,
    strengthPattern: `You carry insight that arrives fully formed — not assembled from analysis, but received. When you trust this and give it form, you produce something that cannot be replicated by those who work only at the analytical level. Your intuition is your most powerful instrument. Your challenge is learning to trust it before the evidence arrives.`,
    shadowPattern: `The shadow of the 11 is the high sensitivity without the management: absorbing others\' emotional states as your own, feeling the weight of collective pain as a personal burden, or retreating from the intensity of your own frequency because it is overwhelming. The 11 must develop the emotional infrastructure to match its perceptual capacity.`,
    businessPattern: `You are built for visionary work — spiritual leadership, creative direction, healing arts, media, thought leadership. The businesses that suit you are ones where your ability to see beyond the current frame is the primary value. Your challenge is the operational: you may need strong partners who manage what your vision generates.`,
    moneyPattern: `The 11 often has a complicated relationship with money because the frequency of the number is fundamentally non-transactional. The breakthrough is understanding that financial stability is what creates the conditions for your gifts to operate freely. Scarcity contracts the 11\'s field. Prosperity expands it.`,
    relationshipPattern: `You need a partner who is spiritually developed enough to understand your frequency without requiring you to explain it constantly. The 11 in relationship with someone who cannot hold depth will perpetually feel alone. Look for depth — not credentials, but genuine interiority.`,
    bodyPattern: `Grounding is essential for the 11. The higher the frequency, the more critical the physical anchoring: regular vigorous movement, time in nature, barefoot contact with earth, cold water. These are not optional wellness practices — they are structural requirements for the 11 to function at capacity.`,
    spiritualAssignment: `Your spiritual assignment is to develop mastery over your own frequency — to become the kind of vessel that can carry the light you were designed to transmit without breaking from its intensity. This requires the same rigor as any other mastery: sustained practice, deep self-knowledge, and the willingness to be in the process long enough to complete it.`,
    currentSeason: `You are in a season of activation — your frequency is being called to a higher register. This will feel like acceleration, heightened sensitivity, and an urgency you may not yet be able to name. Trust the intensification. It is the signal that the next level of your work is near.`,
    recommendedColors: ['White', 'Silver', 'Electric Blue'],
    recommendedFrequency: '111 Hz — Intuitive activation, cellular harmony, divine connection',
    morningRoutine: ['Grounding before anything else — physical contact with the floor or earth', 'Meditation — minimum 20 minutes for the 11', 'Set an energetic intention, not just a task list', 'Body activation — something that moves the energy through you', 'One conscious breath before each significant interaction today'],
    eveningRoutine: ['Clear what you absorbed from the collective today', 'Ground the day\'s activations into the body', 'Write what arrived — the 11 receives most during the day but processes at night', 'Protect the sleep environment — light, sound, energy field', 'Rest as a practice of restoration for the next transmission'],
    thirtyDayThemes: [
      { week: 1, theme: 'Grounding', focus: 'Build a physical anchoring practice and do it every day this month', practice: 'The higher the frequency, the deeper the root must go' },
      { week: 2, theme: 'Transmission', focus: 'Share one insight this week that arrived intuitively, before you could justify it', practice: 'Trust what you know before the evidence' },
      { week: 3, theme: 'Boundaries', focus: 'Identify where you are absorbing what is not yours', practice: 'Your sensitivity is not your responsibility to carry alone' },
      { week: 4, theme: 'Mastery', focus: 'Identify one area of your life where you are ready for a higher level of discipline', practice: 'The 11\'s gift requires the 2\'s foundation' },
    ],
    closingAffirmation: `I carry a rare frequency and I am developing the mastery to sustain it. My sensitivity is not a liability. It is the precision instrument of my gift. I transmit clearly when I am grounded fully.`,
    affirmations: ['My intuition arrives before the evidence. I trust it.', 'I ground as deeply as I reach high.', 'My sensitivity is my precision — not my vulnerability.', 'I transmit clearly when I am grounded fully.', 'I am developing the mastery my gift requires.'],
    snapshotStrength: 'Master intuition — the ability to receive and transmit insight that operates beyond the analytical level.',
    snapshotShadow:   'Unmanaged sensitivity — absorbing collective energy as personal burden without the grounding infrastructure to process it.',
  },

  22: {
    openingMessage: `You carry the most architecturally powerful number in the system — the 22, the master builder. You are built to construct things at a scale that most people will never attempt. Not because you are more ambitious, but because you carry a blueprint that requires more space than a single life to fully express. The question your scroll returns to is whether you are operating at the level your number requires, or whether you have been playing a smaller game because the larger one is too exposed.`,
    birthCodeSummary: `Life Path 22 ✦ · Master Builder · Architecture of the Possible · World Architect`,
    fullBreakdown: `The 22 bridges the visionary intelligence of the 11 and the practical construction power of the 4. You can see the entire architecture of what needs to be built, and you have the discipline to build it. This is extraordinarily rare. The challenge is that the scope of your vision can be paralyzing — when what you see requires so much more than what currently exists, the gap between vision and reality can produce either tremendous urgency or complete shutdown.

The 22 is not here to build small. If you are building small, either you are in a preparation phase or you are contracting against the size of what is actually possible for you. The work is to determine which.`,
    strengthPattern: `You build what others cannot hold in mind long enough to construct. Your capacity for large-scale vision, combined with the discipline required to materialize it, makes you one of the rarest builders in the room. When you are fully activated, what you create has the potential to genuinely reshape how things work.`,
    shadowPattern: `The shadow of the 22 is the weight of the vision — the sense that the gap between where you are and where you need to be is too large to cross. This can produce overwhelm, perfectionism, and paralysis dressed as patience. Watch for when you are waiting for conditions that will never be exactly right before you begin.`,
    businessPattern: `You are built to create systems and structures that outlast you and operate at significant scale. The businesses that suit you are institutional: platforms, organizations, movements, infrastructure. Your challenge is that the scope of your work requires support — you cannot build at 22 scale alone.`,
    moneyPattern: `Money flows toward your work at the rate that your vision is clear and your commitment is total. The 22 that is hedging, that has one foot in and one foot out, will find funding elusive. When you are fully committed, resources tend to find you — because the work is too important not to be supported.`,
    relationshipPattern: `Your relationships require a partner who can hold the weight of your vision without being crushed by it. Not someone who serves the vision — someone who sees it clearly, supports it genuinely, and maintains their own sovereignty within it. The 22 without this is lonely in a specific way that has nothing to do with being alone.`,
    bodyPattern: `Your body needs the same systematic care you bring to everything else you build. The 22 that neglects the physical foundation will eventually find the vision unsustainable. Build the body with the same intentionality as the business.`,
    spiritualAssignment: `Your spiritual assignment is to build something that serves more people than you will ever personally meet. This is the scale your number requires. The practice is to begin — even before the full blueprint is visible — because the blueprint reveals itself in the building.`,
    currentSeason: `You are in a season of foundation-laying — the work that is happening now is not yet visible in its full significance. Trust the process. What you are building at the foundational level will carry significant weight when the structure rises.`,
    recommendedColors: ['Midnight Blue', 'Gold', 'Concrete Gray'],
    recommendedFrequency: '222 Hz — Structural alignment, master builder activation',
    morningRoutine: ['Review the vision — the full vision, not just today\'s tasks', 'Physical power practice — the 22 needs a body that can carry significant work', 'Identify the one action today that moves the largest stone', 'Connect with a key collaborator — the 22 builds in relationship', 'Commit to today\'s work as a contribution to the larger structure'],
    eveningRoutine: ['What did you build today that is load-bearing for the larger vision?', 'Where did you play small when the situation called for more?', 'Review your systems — what needs adjustment?', 'Rest as part of the build cycle — not as interruption of it', 'Name tomorrow\'s most significant move before you sleep'],
    thirtyDayThemes: [
      { week: 1, theme: 'Vision', focus: 'Write the full scope of what you are here to build — no editing', practice: 'Begin with what you would build if you knew it couldn\'t fail' },
      { week: 2, theme: 'Foundation', focus: 'Identify the one structural element of your vision that needs to be built first', practice: 'Begin it this week, regardless of scale' },
      { week: 3, theme: 'Team', focus: 'Identify one person who could multiply your impact if brought closer', practice: 'The 22 cannot build at scale alone' },
      { week: 4, theme: 'Commitment', focus: 'Make one full commitment to the vision — no more hedging', practice: 'Full commitment is what unlocks the 22\'s full power' },
    ],
    closingAffirmation: `I build at the scale my vision requires. I commit fully to what I am here to construct. The blueprint reveals itself in the building — I do not wait for complete certainty before I begin.`,
    affirmations: ['I build at scale — this is my assignment.', 'Full commitment unlocks what hedging never will.', 'The vision reveals itself in the doing.', 'I partner with excellence — the 22 multiplies through great people.', 'What I build will outlast me. I build accordingly.'],
    snapshotStrength: 'Large-scale architectural vision combined with the discipline to actually build it — the rarest combination in the room.',
    snapshotShadow:   'The paralysis of the gap — using the size of the vision as a reason to delay beginning, disguised as preparation.',
  },

  33: {
    openingMessage: `You carry the highest frequency in the master number system — the 33, the master teacher. You are here to embody what you teach. Not to speak about it from a distance, but to live it — completely, particularly, with the full weight of your humanity intact. Your scroll returns you, every season, to the same question: are you teaching from where you have been, or are you teaching from where you actually are? The difference is the difference between wisdom and performance.`,
    birthCodeSummary: `Life Path 33 ✦ · Master Teacher · Embodied Wisdom · Love Made Practical`,
    fullBreakdown: `The 33 is the master teacher number — but the teaching is not primarily verbal. You teach by becoming. The way you live your life, the quality of your presence, the choices you make under pressure — these are the curriculum. The people who learn the most from you are often not in formal teaching relationships with you. They are simply watching how you move through the world.

Your challenge is the very high standard you apply to yourself before you will consider teaching anything. The 33 often waits until mastery is complete. But teaching is part of how mastery completes itself. The practice is to teach from where you are, not from where you plan to arrive.`,
    strengthPattern: `Your presence transmits something that your words often don\'t need to complete. People feel changed in your company without always being able to articulate what shifted. This is the master teacher frequency — it operates below the level of content. When you are fully embodied, you are one of the most transformative presences available.`,
    shadowPattern: `The shadow of the 33 is self-sacrifice mistaken for spiritual attainment — giving beyond your capacity, holding a standard for yourself that you would never apply to those you teach, and postponing your own needs in the belief that this is what love requires. Watch for when self-transcendence is being used to avoid self-care.`,
    businessPattern: `You are built for teaching, healing, spiritual leadership, and mentorship at the highest level. The businesses that suit you are those where your embodied wisdom is the product. Your challenge is receiving the value of that wisdom in material form — which can feel incongruent with the 33\'s spiritual orientation. The practice is to understand that sustainable teaching requires sustainable living.`,
    moneyPattern: `The 33 must make peace with receiving in order to continue giving. The pattern of under-charging for wisdom, of giving more than is sustainable, of being uncomfortable with prosperity — these must be addressed directly. The most loving act the 33 can take toward its students is to model a well-resourced life.`,
    relationshipPattern: `You need a relationship of genuine mutuality — where both people are growing, where both are teachers and students. The 33 in a relationship where they are only the giver, only the wise one, only the anchor — eventually cannot sustain it. Real intimacy for the 33 is the relationship that asks something of you, not only from you.`,
    bodyPattern: `Your body needs as much care as your spiritual practice. The 33 often prioritizes inner work to the exclusion of physical maintenance. Both are required. The body that is well-rested, well-nourished, and regularly moved can sustain a level of presence that the depleted one cannot.`,
    spiritualAssignment: `Your spiritual assignment is to teach by embodying — to live the wisdom so completely that those around you absorb it through proximity. This requires that you actually live it, not merely teach it. The gap between what you transmit and how you live is what your next chapter of growth is addressing.`,
    currentSeason: `You are in a season of integration — bringing together the many threads of your experience into a coherent expression. What you have learned across many seasons is beginning to consolidate into something teachable, livable, and transferable.`,
    recommendedColors: ['White Gold', 'Soft Pink', 'Deep Violet'],
    recommendedFrequency: '528 Hz — Unconditional love, healing, transformation',
    morningRoutine: ['Begin with a practice of receiving — let something good in before you give anything out', 'Physical care first — the body that will teach needs to be prepared', 'Connect with your own wisdom — what do you know today that you did not know a year ago?', 'Set an intention for how you want to embody your teaching today', 'Name one person you will serve genuinely and specifically today'],
    eveningRoutine: ['What did you teach today by how you lived?', 'Where did the gap between what you teach and how you live show itself?', 'Receive the goodness of the day — let it land', 'Practice self-compassion — the 33 is often its own harshest critic', 'Rest as an act of love for the students tomorrow\'s you will serve'],
    thirtyDayThemes: [
      { week: 1, theme: 'Embodiment', focus: 'Identify the gap between what you teach and how you live', practice: 'Close one gap this month with a concrete practice' },
      { week: 2, theme: 'Receiving', focus: 'Practice receiving care, money, and appreciation without deflecting', practice: 'What you receive is what allows you to keep giving' },
      { week: 3, theme: 'Teaching', focus: 'Teach one thing you know from your actual lived experience', practice: 'Not from your aspirational self — from where you actually are' },
      { week: 4, theme: 'Integration', focus: 'Find the single through-line of everything you have been learning', practice: 'This is the teaching that is uniquely yours to give' },
    ],
    closingAffirmation: `I teach by becoming. I live what I give. My wisdom deepens in the living, and my receiving is what makes my giving sustainable. I am the curriculum.`,
    affirmations: ['I teach by becoming, not by performing.', 'Receiving is not selfishness — it is the source of sustainable giving.', 'My humanity is not a flaw in my teaching. It is the teaching.', 'I close the gap between what I know and how I live.', 'Love made practical is the highest teaching.'],
    snapshotStrength: 'Embodied wisdom — the ability to transform others through presence and lived example rather than mere instruction.',
    snapshotShadow:   'Self-sacrifice disguised as spiritual attainment — depleting yourself in the belief that this is what service requires.',
  },
}

// ─── Focus Area Messages ──────────────────────────────────────

export const FOCUS_MESSAGES: Record<FocusArea, { message: string; affirmation: string; actionStep: string }> = {
  Purpose: {
    message: `You are in active inquiry about your assignment — not your job title, but the deeper function you were built for. The work right now is not to find the answer but to pay careful attention to what consistently pulls you, what you cannot stop returning to, and what lights something up in you that has no practical justification. Purpose is not found. It is recognized.`,
    affirmation: `I am already oriented toward my purpose. I pay attention to what keeps calling me back.`,
    actionStep: `Write a list of everything you have done in the last year that made time disappear. Look for the pattern.`,
  },
  Business: {
    message: `Your business frequency is active — something is building, and the clarity of your next move is more important than the speed of it. Before you launch the next thing, complete one audit: what is already working that you have been overlooking in the push for the new? Your next breakthrough may be inside the thing you are already doing.`,
    affirmation: `I build with intention. My business reflects my deepest values and delivers real value to real people.`,
    actionStep: `Identify the one thing in your business that, if you doubled down on it for the next 30 days, would produce disproportionate results.`,
  },
  Love: {
    message: `Love is asking something of you right now — not necessarily more of it, but a different quality of it. What this season requires is not a new relationship but a new level of honesty within the relationships you already have. The clarity you are seeking in love begins with the clarity you are willing to have about yourself.`,
    affirmation: `I love clearly, not just deeply. I bring my honest self to the people who matter most.`,
    actionStep: `Say one true thing this week in a relationship that you have been holding back. Start small. Build from there.`,
  },
  Healing: {
    message: `You are in active healing — not the kind that ends, but the kind that deepens. What this season is asking of you is not resolution but integration: the ability to hold the wound and the growth in the same hand without requiring one to eliminate the other. Healing is not the absence of the difficult. It is the presence of a self that can hold the difficult without being dismantled by it.`,
    affirmation: `I heal by becoming more of myself, not less. The wound and the gift come from the same source.`,
    actionStep: `Identify one old story you are still living inside that is not true anymore. Write what is true instead.`,
  },
  Discipline: {
    message: `Discipline is calling you toward something specific right now — not general self-improvement, but the particular practice that, if maintained consistently, would change the most important thing. The question is not whether you can be disciplined. You can. The question is whether you are applying your discipline to the thing that actually matters most, or to the thing that feels most manageable.`,
    affirmation: `I direct my discipline where it counts. Small consistent actions build the life I am becoming.`,
    actionStep: `Identify the one discipline that has the most leverage in your current season. Do it today. Then again tomorrow.`,
  },
  Fitness: {
    message: `Your body is asking for a different quality of attention — not punishment, not performance, but genuine care. The body that is well-tended thinks more clearly, feels more accurately, and generates the energy that every other area of your life runs on. Today asks you to move in a way that you would choose if no one were watching. That is the movement that actually serves you.`,
    affirmation: `I care for my body as the primary instrument of my life's work. It deserves the same attention I give to everything else.`,
    actionStep: `Choose one physical practice and do it today without tracking it, posting it, or reporting it to anyone. Just move.`,
  },
  Money: {
    message: `Money is reflecting something back to you right now about what you believe you are worth and what you believe is possible for you. The practical is important — the numbers, the systems, the structure — but underneath the practical is always the belief that the practical is built on. What do you actually believe about your capacity to generate, receive, and hold abundance?`,
    affirmation: `I am expanding my capacity to generate, receive, and hold abundance — in alignment with my values and my work.`,
    actionStep: `Build or review your financial system today. Automate one thing. Create one structure. Clarity and structure are the 8\'s invitation to abundance.`,
  },
  Creativity: {
    message: `Your creative frequency is activated and something is pushing to come through. The obstacle is not talent, not time, and not resources. It is the inner critic that has learned to arrive before the creative act and declare it insufficient before it begins. Today asks you to create before the critic gets a vote. Make something rough, unfinished, and real — then release it without editorial review.`,
    affirmation: `I create because it is true. My expression is the offering. It does not require perfection to have value.`,
    actionStep: `Spend 20 uninterrupted minutes creating something today. No phone. No plan. Just start and see what arrives.`,
  },
  'Spiritual Growth': {
    message: `Your spiritual development is entering a new phase — not of learning new frameworks, but of integrating what you already know into the texture of how you live. The question is not what you believe. It is how those beliefs show up in your daily choices, relationships, and responses to difficulty. The practice now is embodiment, not accumulation.`,
    affirmation: `I live what I know. My spiritual practice is not separate from my life — it is how I live it.`,
    actionStep: `Identify one spiritual insight you hold that you are not yet living. Choose one specific way to embody it today.`,
  },
  'Shadow Work': {
    message: `You are in active shadow work — the most courageous and most transformative work available. What is being invited right now is not to understand your shadow intellectually (you have already done that), but to encounter it in real time — to catch the pattern as it is happening and make a different choice. That is where the integration lives.`,
    affirmation: `I meet my shadow with curiosity, not condemnation. What I can see, I can choose. What I cannot see, I am run by.`,
    actionStep: `Identify one behavior pattern you repeat that you do not consciously choose. Write down what it is protecting you from. That is the real work.`,
  },
  Leadership: {
    message: `Your leadership is being asked to evolve — not in title, but in quality. What this season requires is a different kind of authority: not the kind that comes from a position, but the kind that comes from having done the work. The people around you can tell the difference. So can you. The invitation is to lead from where you actually are, not from where you think you should be.`,
    affirmation: `I lead from genuine authority — grounded in what I have lived, not in what I perform.`,
    actionStep: `Identify one place where you are managing rather than leading. Choose one act of genuine leadership there this week.`,
  },
  Family: {
    message: `Family is asking something of you right now — a deeper presence, a clearer honesty, or a genuine release of an old role that no longer fits. The most powerful thing you can do for your family in this season is not to do more, but to show up more truly. The version of you that is present and honest serves them better than the version that is busy and performing.`,
    affirmation: `I show up for my family as my genuine self. My presence is more valuable than my performance.`,
    actionStep: `Choose one relationship in your family and give it one hour of undivided, phone-free attention this week.`,
  },
  'Career Transition': {
    message: `You are in transition — between what was and what is becoming. The discomfort of this space is real, but it is not a sign that something is wrong. It is the sign that something is moving. The work right now is not to resolve the uncertainty but to stay present in it long enough to let the next direction reveal itself clearly rather than jumping to the first available exit.`,
    affirmation: `I am in the threshold — between what I was and what I am becoming. I stay present here. The direction is revealing itself.`,
    actionStep: `Write down the three things you know you do not want in the next chapter. The negative space often reveals the shape of what is next.`,
  },
}

// ─── Daily Themes by Day of Week ──────────────────────────────

export interface DayTheme {
  theme: string
  energy: string
  spiritualAssignment: string
  businessAssignment: string
  bodyAssignment: string
  shadowToWatch: string
  powerMove: string
  frequency: string
  journalPrompt: string
  actionWindow: string
  eveningReflection: string
  affirmation: string
  emotionalCheckIn: string
}

export const DAY_THEMES: Record<number, DayTheme> = {
  0: { // Sunday
    theme: 'Integration & Rest',
    energy: 'Expansive, restorative, inward. Today is not for doing — it is for receiving what the week produced.',
    spiritualAssignment: 'Spend 20 minutes in genuine stillness. No agenda. No output. Let what is complete settle.',
    businessAssignment: 'Review the week\'s work from a distance — what moved, what stalled, what surprised you? Do not problem-solve today. Observe.',
    bodyAssignment: 'Restorative movement only — gentle yoga, walking, stretching. Give the body the ease it earned this week.',
    shadowToWatch: 'Productivity guilt — the voice that says rest is waste. It is not. Rest is structural.',
    powerMove: 'Do one thing today that has nothing to do with any goal. Not to recharge for more work — just because it is good.',
    frequency: '396 Hz — Root chakra, release of guilt',
    journalPrompt: 'What did this week teach me that I wasn\'t expecting to learn?',
    actionWindow: '10am – 1pm · Light review and integration only',
    eveningReflection: 'What would I do differently this week if I had it again? What would I protect?',
    affirmation: 'Rest is not the absence of ambition. It is the preparation for what is next.',
    emotionalCheckIn: 'What is the emotional residue of the week? Name it. You don\'t have to resolve it today — just see it.',
  },
  1: { // Monday
    theme: 'Initiation & Direction',
    energy: 'Focused, forward-moving, intentional. Monday is a portal — how you enter it shapes the entire week.',
    spiritualAssignment: 'Set a spiritual intention for the week — not a task, a quality of presence you want to embody.',
    businessAssignment: 'Before you touch your inbox, identify the one thing that, if completed this week, makes everything else secondary. Begin with that.',
    bodyAssignment: 'High-intensity movement today — activate the body as your primary instrument before the week asks too much of it.',
    shadowToWatch: 'Reactive start — jumping into other people\'s urgency before setting your own direction. The inbox can wait 90 minutes.',
    powerMove: 'Make the one call or send the one message you have been delaying. Monday is the day of first moves.',
    frequency: '528 Hz — Transformation, DNA repair, positive change',
    journalPrompt: 'What is the one thing I am committed to completing this week — regardless of what else happens?',
    actionWindow: '8am – 12pm · Your highest focus work first',
    eveningReflection: 'Did I lead today or react? What would the leading version of me have done differently?',
    affirmation: 'I set the direction. I do not wait for the week to tell me where to go.',
    emotionalCheckIn: 'What emotional state am I bringing into this week? Is it one I am choosing, or one I inherited from last week?',
  },
  2: { // Tuesday
    theme: 'Deep Work & Execution',
    energy: 'Precise, sustained, focused. Tuesday is the day for the work that requires your full mind — not meetings, not admin, not email.',
    spiritualAssignment: 'Practice single-pointed focus for 90 minutes. One task. No switching. This is a spiritual practice as much as a productivity one.',
    businessAssignment: 'Identify the highest-leverage, most cognitively demanding task on your list and protect 3 hours for it. Nothing interrupts it.',
    bodyAssignment: 'Functional strength training or a practice that builds capacity — not just cardio, but something that makes you stronger.',
    shadowToWatch: 'Busywork disguised as productivity — the tendency to stay in motion without moving toward anything significant.',
    powerMove: 'Complete one deliverable today from start to finish. No half-measures. Done.',
    frequency: '741 Hz — Solving problems, expression, cleansing',
    journalPrompt: 'What is the task I keep moving to tomorrow that actually belongs today?',
    actionWindow: '9am – 1pm · Protected deep work block',
    eveningReflection: 'What did I complete today? What did I avoid? Which of these matters more?',
    affirmation: 'I direct my full attention at what matters most. This is where my power compounds.',
    emotionalCheckIn: 'Am I creating from energy or from pressure today? How do I adjust?',
  },
  3: { // Wednesday
    theme: 'Connection & Collaboration',
    energy: 'Social, communicative, relational. Wednesday is the center of the week — use it to strengthen the connections that the work depends on.',
    spiritualAssignment: 'Make one genuine connection today — not a transaction, but a real moment of being seen or seeing someone else.',
    businessAssignment: 'Reach out to one collaborator, client, or peer with something of value — a resource, a referral, a genuine acknowledgment.',
    bodyAssignment: 'Group exercise, a walk with someone who energizes you, or partner training. Use the social quality of the day.',
    shadowToWatch: 'People-pleasing — the tendency to agree with the room instead of contributing your actual perspective.',
    powerMove: 'Have one honest conversation that you have been softening. Say the true thing with care.',
    frequency: '639 Hz — Connection, relationships, harmony',
    journalPrompt: 'Who in my life deserves more of my genuine attention? What would that look like?',
    actionWindow: '10am – 3pm · Best window for calls, meetings, and collaborative work',
    eveningReflection: 'What did I contribute to my relationships today? What did I receive?',
    affirmation: 'I connect genuinely. My perspective is a contribution, not a disruption.',
    emotionalCheckIn: 'How are my most important relationships right now — honestly? What do they need from me?',
  },
  4: { // Thursday
    theme: 'Refinement & Problem-Solving',
    energy: 'Analytical, detail-oriented, precise. Thursday is the day to audit, refine, and solve — to find what is not working and fix it.',
    spiritualAssignment: 'Practice honest self-assessment today. Not criticism — assessment. What is working? What is not? Be specific.',
    businessAssignment: 'Audit one system, process, or deliverable that has been producing friction. Find the single adjustment that removes the most drag.',
    bodyAssignment: 'Precision training — technique-focused movement, form refinement, yoga, or martial arts. Quality over quantity.',
    shadowToWatch: 'Perfectionism — spending Thursday refining what does not need refinement instead of advancing what does.',
    powerMove: 'Fix the one thing that has been creating friction for more than two weeks. Today. In one hour.',
    frequency: '285 Hz — Energy fields, healing, regeneration',
    journalPrompt: 'What is the one thing in my work or life that keeps not working? What is the actual root cause?',
    actionWindow: '11am – 3pm · Best window for analysis, refinement, and problem-solving',
    eveningReflection: 'What did I improve today? What did I refuse to look at honestly?',
    affirmation: 'I audit without judgment and adjust without drama. Precision is a form of power.',
    emotionalCheckIn: 'What pattern in my behavior has been showing up repeatedly this week? What is it telling me?',
  },
  5: { // Friday
    theme: 'Momentum & Completion',
    energy: 'Accelerating, completion-oriented, energetic. Friday is the day to finish — to close loops, complete projects, and create the clean break that makes the weekend truly restorative.',
    spiritualAssignment: 'Complete one thing with full presence — not rushing, not half-attending, but consciously closing this loop as an act of integrity.',
    businessAssignment: 'Clear your open loops — emails, decisions, deliverables that have been waiting. Do not carry them into the weekend.',
    bodyAssignment: 'High-energy movement — run, train, do something that matches the week\'s accumulated energy. Release it fully.',
    shadowToWatch: 'The Friday decline — the subtle drop in quality and intensity as the weekend approaches. Today still counts. Do it well.',
    powerMove: 'Complete the thing you have been moving to next week for three Fridays in a row. Today. It\'s ready.',
    frequency: '432 Hz — Universal harmony, balance, truth',
    journalPrompt: 'What am I completing this week? What am I carrying forward — and is that carry intentional?',
    actionWindow: '8am – 12pm · Best window for completion before energy shifts toward weekend',
    eveningReflection: 'What loops did I close this week? What did I carry that I should have put down?',
    affirmation: 'I finish what I begin. Completion is where my power is realized.',
    emotionalCheckIn: 'How am I feeling as this week closes? What does my body need going into the weekend?',
  },
  6: { // Saturday
    theme: 'Expansion & Renewal',
    energy: 'Open, exploratory, alive. Saturday is for the things that make your life more than a schedule — the experiences, connections, and inputs that feed everything else.',
    spiritualAssignment: 'Do one thing today that feeds your soul with no productivity justification whatsoever.',
    businessAssignment: 'If you work today, work on the thing that excites you — the vision, the future, the thing you never have enough time for during the week.',
    bodyAssignment: 'Outdoor movement — nature, open air, and the body in motion without walls. This is essential.',
    shadowToWatch: 'Inability to be present — using the weekend to plan the next work week instead of actually being in the day.',
    powerMove: 'Have one experience today that is new, expansive, or memorable. Do not let the day be simply a rest day — let it be an alive day.',
    frequency: '852 Hz — Intuition, awakening, spiritual insight',
    journalPrompt: 'When was the last time I did something that made me feel genuinely alive? What was it?',
    actionWindow: 'Morning hours only, if working · Afternoons are for living',
    eveningReflection: 'What expanded me today? What opened? What am I taking into next week that I discovered today?',
    affirmation: 'My life is not only what I produce. It is who I become in the living of it.',
    emotionalCheckIn: 'Am I genuinely present today, or am I already living in next week? Which experience is better?',
  },
}

// ─── Monthly Numerology Themes ────────────────────────────────

export const MONTHLY_THEMES: Record<number, { theme: string; message: string }> = {
  1: { theme: 'New Beginnings', message: 'January carries the frequency of initiation. What you begin now has unusual momentum behind it. Start before you are ready.' },
  2: { theme: 'Relationship & Balance', message: 'February calls for attention to the relational architecture of your life. Who needs more of your presence? What needs to come into balance?' },
  3: { theme: 'Expression & Creativity', message: 'March activates creative energy. What wants to come through you? This is the month to create, share, and speak.' },
  4: { theme: 'Foundation & Structure', message: 'April asks you to build the structure that will hold what is growing. Systems, habits, and foundations — this is foundational month.' },
  5: { theme: 'Movement & Freedom', message: 'May carries the energy of change and expansion. Expect shifts. Embrace the new.' },
  6: { theme: 'Care & Responsibility', message: 'June calls for attention to what and who you care for — including yourself. Service and love are this month\'s currency.' },
  7: { theme: 'Reflection & Mastery', message: 'July is for depth. Go inward. Study, reflect, refine. What you develop this month compounds for years.' },
  8: { theme: 'Power & Abundance', message: 'August activates the power frequency. What are you building? What are you claiming? This is a month for decisive action on significant goals.' },
  9: { theme: 'Completion & Release', message: 'September asks you to complete and release. What chapter is closing? Let it close fully. What you release now creates space for what is next.' },
  10: { theme: 'Leadership & Initiative', message: 'October (reduces to 1) returns to the frequency of initiation. The year\'s final quarter begins with a call for courageous action.' },
  11: { theme: 'Intuition & Vision', message: 'November (reduces to 2) calls for attunement — to the relationships and the inner life. Slow down enough to hear what is beneath the surface.' },
  12: { theme: 'Gratitude & Harvest', message: 'December (reduces to 3) closes the year in expression and celebration. What has been built? Name it. Honor it.' },
}
