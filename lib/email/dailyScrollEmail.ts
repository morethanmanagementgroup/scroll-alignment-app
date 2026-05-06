// ============================================================
// SCROLL ALIGNMENT — Daily Email Template
// Dark, gold-accented HTML email matching the app aesthetic.
// Uses inline CSS for email client compatibility.
// ============================================================

import type { DailyScroll, User } from '@/lib/types'
import { getArchetype } from '@/lib/archetypes'

function formatEmailDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

const SCROLL_MARK_SVG = `
<svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="37" stroke="#C9A96E" stroke-width="0.75" opacity="0.5"/>
  <circle cx="40" cy="40" r="28" stroke="#C9A96E" stroke-width="0.5" opacity="0.25"/>
  <path d="M40 8 C40 8 41.8 28 52.5 40 C41.8 52 40 72 40 72 C40 72 38.2 52 27.5 40 C38.2 28 40 8 40 8Z" fill="#C9A96E" opacity="0.9"/>
  <path d="M8 40 C8 40 28 38.2 40 27.5 C52 38.2 72 40 72 40 C72 40 52 41.8 40 52.5 C28 41.8 8 40 8 40Z" fill="#C9A96E" opacity="0.9"/>
  <circle cx="40" cy="40" r="2.5" fill="#C9A96E"/>
</svg>`

function assignmentBlock(label: string, icon: string, content: string): string {
  return `
    <td width="50%" style="padding: 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#161624;border:1px solid #232338;border-radius:10px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 8px 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A96E;opacity:0.6;font-family:Georgia,serif;">
            ${icon}&nbsp; ${label}
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#B8B0A4;font-family:Georgia,serif;">${content}</p>
        </td></tr>
      </table>
    </td>`
}

export function buildDailyScrollEmail(user: User, scroll: DailyScroll, appUrl: string): string {
  const archetype = getArchetype(user.lifePathNumber)
  const dateFormatted = formatEmailDate(scroll.date)
  const dashboardUrl = `${appUrl}/dashboard`
  const journalUrl   = `${appUrl}/journal`
  const unsubUrl     = `${appUrl}/settings`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Your Daily Scroll — ${dateFormatted}</title>
</head>
<body style="margin:0;padding:0;background-color:#080810;font-family:Georgia,serif;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;color:#080810;font-size:1px;">
    ${scroll.theme} · ${scroll.affirmation.slice(0, 80)}...
  </div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;">
    <tr><td align="center" style="padding:40px 16px;">

      <!-- Card container -->
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0D0D1A;border:1px solid #232338;border-radius:16px;overflow:hidden;">

        <!-- Top gold line -->
        <tr><td height="2" style="background:linear-gradient(90deg,transparent,#C9A96E,transparent);"></td></tr>

        <!-- Header -->
        <tr><td align="center" style="padding:40px 40px 24px;">
          <!-- Mark -->
          <div style="margin-bottom:16px;">${SCROLL_MARK_SVG}</div>
          <p style="margin:0;font-size:11px;letter-spacing:0.45em;text-transform:uppercase;color:#C9A96E;opacity:0.7;">SCROLL ALIGNMENT</p>
        </td></tr>

        <!-- Date & theme -->
        <tr><td align="center" style="padding:0 40px 8px;">
          <p style="margin:0;font-size:13px;color:#B8B0A4;opacity:0.6;text-transform:uppercase;letter-spacing:0.1em;">
            ${dateFormatted}
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 8px;">
          <p style="margin:0;font-size:14px;color:#C9A96E;opacity:0.8;font-style:italic;">${scroll.theme}</p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:16px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td height="1" style="background:linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent);"></td></tr>
          </table>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:0 40px 8px;">
          <p style="margin:0;font-size:14px;color:#B8B0A4;">Good morning, ${user.firstName}.</p>
        </td></tr>

        <!-- Energy -->
        <tr><td style="padding:8px 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#161624,#1A1730);border:1px solid rgba(201,169,110,0.25);border-radius:12px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 8px 0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A96E;opacity:0.6;">Today's Energy</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#F0EBE1;">${scroll.energy}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Affirmation -->
        <tr><td align="center" style="padding:0 40px 32px;">
          <p style="margin:0 0 10px 0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A96E;opacity:0.5;">Today's Affirmation</p>
          <p style="margin:0;font-size:24px;line-height:1.5;color:#F0EBE1;font-style:italic;font-weight:400;">
            &ldquo;${scroll.affirmation}&rdquo;
          </p>
        </td></tr>

        <!-- Assignments 2x2 -->
        <tr><td style="padding:0 32px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${assignmentBlock('Spiritual Assignment', '◉', scroll.spiritualAssignment)}
              ${assignmentBlock('Business Assignment', '◆', scroll.businessAssignment)}
            </tr>
            <tr>
              ${assignmentBlock('Body Assignment', '○', scroll.bodyAssignment)}
              ${assignmentBlock('Emotional Check-In', '◇', scroll.emotionalCheckIn)}
            </tr>
          </table>
        </td></tr>

        <!-- Power Move -->
        <tr><td style="padding:16px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#161624,#1A1730);border:1px solid rgba(201,169,110,0.35);border-radius:12px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 8px 0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A96E;opacity:0.6;">Power Move</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#F0EBE1;font-weight:600;">${scroll.powerMove}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Journal Prompt -->
        <tr><td style="padding:16px 40px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#12121F;border:1px solid #232338;border-radius:12px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 8px 0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A96E;opacity:0.6;">Journal Prompt</p>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#B8B0A4;font-style:italic;">&ldquo;${scroll.journalPrompt}&rdquo;</p>
              <a href="${journalUrl}" style="display:inline-block;font-size:11px;color:#C9A96E;text-decoration:none;border:1px solid rgba(201,169,110,0.3);padding:6px 14px;border-radius:6px;">
                Open Journal →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA button -->
        <tr><td align="center" style="padding:32px 40px 16px;">
          <a href="${dashboardUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#C9A96E,#E2C98A,#C9A96E);color:#080810;font-family:Georgia,serif;font-size:15px;font-weight:700;padding:14px 40px;border-radius:10px;text-decoration:none;letter-spacing:0.05em;">
            Open My Full Scroll ✦
          </a>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:8px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td height="1" style="background:linear-gradient(90deg,transparent,rgba(201,169,110,0.15),transparent);"></td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:24px 40px 36px;">
          <p style="margin:0 0 6px 0;font-size:13px;color:#C9A96E;font-family:Georgia,serif;">
            ${archetype.glyph} ${archetype.name} · Life Path ${user.lifePathNumber}
          </p>
          <p style="margin:0 0 12px 0;font-size:11px;color:#B8B0A4;opacity:0.4;">
            ${user.chineseElement} ${user.chineseZodiac}
          </p>
          <p style="margin:0;font-size:10px;color:#B8B0A4;opacity:0.3;">
            <a href="${unsubUrl}" style="color:#B8B0A4;text-decoration:underline;">Manage email preferences</a>
            &nbsp;·&nbsp; Scroll Alignment
          </p>
        </td></tr>

        <!-- Bottom gold line -->
        <tr><td height="2" style="background:linear-gradient(90deg,transparent,#C9A96E,transparent);"></td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
