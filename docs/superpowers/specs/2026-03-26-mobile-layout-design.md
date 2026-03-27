# Mobile Layout — Design Spec

**Date:** 2026-03-26
**Scope:** Mobile responsive layout for `app/page.tsx` hero section and navbar only. All other sections already have mobile rules in the `@media (max-width: 640px)` block and are untouched.

---

## Problem

The hero on mobile (≤768px) currently hides the phone mockup entirely and has no intentional layout — the pitcher image and text block are unstyled at small widths. The navbar hides the "Log in" button on mobile. The result is a weak first fold on phones with no product preview.

## Goal

A clean stacked mobile hero that shows the pitcher image, headline, CTAs, and the phone mockup as a scroll teaser — all without anything overlapping or crowding. Navbar shows both auth options on mobile.

---

## Design

### Navbar (≤768px)

- Logo icon: top left (unchanged)
- "ArmTrack" text: absolutely centered (unchanged)
- Right side: both "Log in" and "Get Started Free" visible
- Button padding reduced to `6px 10px` (from `8px 16px`) so both fit without wrapping at 390px
- Font size stays at 13px

### Hero (≤768px)

**Stack order (top to bottom):**
1. Pitcher image — full width, `40vh` tall, `objectFit: cover`, fades to black at bottom via gradient overlay
2. Headline — centered, `36px`, `fontWeight: 350`, `letterSpacing: -0.03em`
3. Subtext — centered, `16px`, `color: #888888`, `padding: 0 24px`
4. CTA row — stacked vertically (`flex-direction: column`), full width buttons, `padding: 0 24px`
5. Phone mockup — centered, `220px` wide, `marginBottom: -30px` so bottom 30px bleeds below viewport as scroll teaser
6. Blue glow — same radial gradient as desktop, centered behind phone, scaled proportionally

**No absolute positioning on mobile** — everything is normal document flow.

**Phone frame:** same inline iPhone 15 Pro frame as desktop, just `width: 220px` instead of `280px`. Corner radius scales proportionally (`borderRadius: 41px`, inner screen `borderRadius: 34px`).

**Hero section:** `paddingBottom: 0` so phone bleed works naturally.

### Responsive breakpoints

All changes scoped to `@media (max-width: 768px)` inside the existing `<style>` block in `app/page.tsx`.

New classes needed:
- `.hero-phone-float` — currently `display: none` at ≤768px, needs to become visible and repositioned for mobile stack
- `.hero-phone-mobile` — new class for mobile phone sizing/centering

---

## Constraints

- Only modify: navbar right-side buttons, hero section mobile CSS, phone mockup sizing
- Do NOT touch: any section below the hero (problem, features, how-it-works, coach/player, stats, CTA, footer)
- `npm run build` must pass before done
- All changes via the existing inline `<style>` block + targeted inline style adjustments — no new files

---

## Verification

1. Set browser devtools to 390×844 (iPhone 14)
2. Confirm: logo left, ArmTrack centered, both buttons visible in navbar
3. Confirm: pitcher image → headline → subtext → CTAs → phone, all stacked, no overlap
4. Confirm: bottom ~30px of phone is clipped by viewport edge
5. Confirm: no horizontal scroll bar
6. Run `npm run build` — zero errors
