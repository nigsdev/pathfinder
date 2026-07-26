# PathFinder — Design System

**Product:** college discovery + career guidance for Class 12 students and their parents (India).
**Feeling:** trustworthy and calm · warm and encouraging · plainly legible.
**Why:** the audience is 17–18-year-olds *and* parents, often on modest devices, and the positioning is honesty over hype. The design should reassure, not dazzle.

---

## 1. Principles

1. **Clarity over cleverness** — a parent should understand every screen at a glance. Plain language, big legible type, obvious next action.
2. **Calm trust** — deep, steady colour and soft depth. No neon, no aggressive gradients, no ed-tech hype.
3. **One clear path** — every screen has a single obvious next step, echoing the wayfinding metaphor in the name.
4. **Warm, not childish** — encouraging and human, but serious enough that a parent trusts it with a life decision.

---

## 2. Colour

Indigo carries trust and direction (the "path"); amber marks the highlighted next step; teal signals positive/verified; warm greys keep it approachable.

| Token | Hex | Use |
|-------|-----|-----|
| Primary 700 | `#2540A8` | Primary text-on-white, strong emphasis |
| Primary 600 | `#3B5BDB` | Primary buttons, links, active states |
| Primary 300 | `#9FB0F0` | Focus rings, subtle accents |
| Primary 100 | `#E5EAFC` | Selected backgrounds, tints |
| Primary 050 | `#F2F5FE` | Section washes |
| Accent 600 | `#D97706` | Accent text |
| Accent 500 | `#F59E0B` | Highlights, "your next step", progress |
| Accent 100 | `#FEF3C7` | Accent badges, tints |
| Verify 600 | `#0E9F6E` | Verified / positive / success text |
| Verify 100 | `#D6F3E7` | Verified badge background |
| Ink | `#1B2130` | Headings |
| Body | `#3A4150` | Body text |
| Muted | `#6B7280` | Secondary text |
| Faint | `#9AA1AE` | Hints, placeholders |
| Border | `#E4E7EC` | Hairlines, card borders |
| Border strong | `#CDD2DC` | Inputs, dividers, hover |
| Surface | `#FFFFFF` | Cards |
| Surface alt | `#F1F3F7` | Panels, secondary surfaces |
| Canvas | `#F7F8FA` | Page background |
| Success | `#12B76A` | · |
| Warning | `#F79009` | · |
| Error | `#F04438` | · |

**Usage rules:** indigo is the primary CTA colour; amber is a *highlight*, not a button colour (keeps it from looking cheap and avoids contrast issues). Teal is reserved for verified/positive meaning so it stays meaningful.

---

## 3. Typography

- **Headings:** Plus Jakarta Sans — 600 / 700
- **Body & UI:** Inter — 400 / 500 / 600
- **Devanagari (roadmap, for Hindi):** Noto Sans Devanagari

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

| Style | Size / line-height | Weight | Family |
|-------|-------------------|--------|--------|
| Display | 40 / 48 | 700 | Jakarta |
| H1 | 32 / 40 | 700 | Jakarta |
| H2 | 24 / 32 | 600 | Jakarta |
| H3 | 20 / 28 | 600 | Jakarta |
| Body large | 18 / 28 | 400 | Inter |
| Body | 16 / 26 | 400 | Inter |
| Small | 14 / 22 | 400 | Inter |
| Label / caption | 12 / 18 | 500 | Inter |

Sentence case everywhere. Minimum body size 16px (parents, modest screens). Never below 12px.

---

## 4. Spacing, radius, elevation

- **Spacing** (4px base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- **Radius:** controls 8px · cards 12px · large panels 16px · pills 999px
- **Elevation** (soft, low — trust over flash):
  - sm `0 1px 2px rgba(16,24,40,.06)`
  - md `0 4px 12px rgba(16,24,40,.08)`
  - lg `0 12px 28px rgba(16,24,40,.10)`
- **Borders:** 1px hairlines; no single-sided rounded borders.

---

## 5. Components

- **Primary button** — bg Primary 600, white text, radius 8, padding 12×20, weight 600; hover Primary 700.
- **Secondary button** — Surface bg, Border strong outline, Ink text; hover Surface alt.
- **Ghost / text button** — Primary 700 text, no fill.
- **Input** — Border strong outline, radius 8, padding 12×14, Body text; focus = 2px Primary 300 ring. Placeholder in Faint.
- **Card (base)** — Surface bg, Border hairline, radius 12, shadow-sm, padding 24.
- **The three result cards** — each gets a colour-coded icon chip / left accent:
  - Direction & skills → Primary (indigo)
  - College shortlist → Verify (teal)
  - Next steps → Accent (amber)
- **Quiz option card** — selectable; default Border strong; selected = Primary 600 border + Primary 050 fill.
- **Badges (pills):** Verified (roadmap) = Verify 100 / Verify 600 · Sponsored = Accent 100 / Accent 600 · Neutral tag = Surface alt / Muted.

**Icons:** Lucide, 1.5px stroke. Wayfinding set — compass, map-pin, route, signpost, flag, milestone, graduation-cap, sparkles (for AI-inferred direction). **Imagery:** simple line illustrations and the path motif; avoid stocky ed-tech photography.

---

## 6. Voice & tone

Plain, warm, second person, encouraging. No jargon a 17-year-old or a parent wouldn't use. Confident but never pushy. Example: "You're a strong fit for these three directions — here's why, and what to do next." Hindi/Devanagari is a roadmap item.

---

## 7. Paste-ready CSS tokens

```css
:root {
  /* primary */
  --primary-700:#2540A8; --primary-600:#3B5BDB; --primary-300:#9FB0F0;
  --primary-100:#E5EAFC; --primary-050:#F2F5FE;
  /* accent */
  --accent-600:#D97706; --accent-500:#F59E0B; --accent-100:#FEF3C7;
  /* verify */
  --verify-600:#0E9F6E; --verify-100:#D6F3E7;
  /* neutrals */
  --ink:#1B2130; --body:#3A4150; --muted:#6B7280; --faint:#9AA1AE;
  --border:#E4E7EC; --border-strong:#CDD2DC;
  --surface:#FFFFFF; --surface-alt:#F1F3F7; --canvas:#F7F8FA;
  /* semantic */
  --success:#12B76A; --warning:#F79009; --error:#F04438; --info:#3B5BDB;
  /* type */
  --font-head:'Plus Jakarta Sans',sans-serif;
  --font-body:'Inter',sans-serif;
  /* radius */
  --r-sm:8px; --r-md:12px; --r-lg:16px; --r-pill:999px;
  /* elevation */
  --shadow-sm:0 1px 2px rgba(16,24,40,.06);
  --shadow-md:0 4px 12px rgba(16,24,40,.08);
  --shadow-lg:0 12px 28px rgba(16,24,40,.10);
}
```

---

## 8. Accessibility

- Body text ≥ 16px; nothing below 12px.
- Maintain ≥ 4.5:1 contrast for body text (use Primary 700, not 600, for indigo text on white).
- Visible focus rings (Primary 300, 2px) on every interactive element.
- Don't encode meaning in colour alone — pair verified/sponsored colour with a label.

---

## 9. Logo direction

**Concept:** wayfinding. The name is the brief — a *path* being *found*. Strongest, most versatile marks:
- a location pin whose point extends into a short route/path, or
- a forking path that resolves into a "P", or
- an upward route line ending in a flag/marker.

**Wordmark:** "PathFinder" in Plus Jakarta Sans (600–700). Optional subtle colour break — "Path" in Ink, "Finder" in Primary 600 — kept restrained.

**Must-haves:** works in a single colour; legible at 32px favicon size; readable on light and dark. Palette: indigo mark, optional single amber accent (a spark / marker dot) — never more than two colours.

### Claude Design prompt (paste this in)

```
Design a logo for "PathFinder", a college-discovery and career-guidance app for
Indian Class 12 students and their parents. The brand feeling is trustworthy,
calm, warm, and encouraging — honesty over hype, not flashy ed-tech.

Concept: wayfinding — a path being found. Explore these directions:
1) a location pin whose point extends into a short route/path line,
2) a forking path that resolves into the letter "P",
3) an upward route line ending in a small flag or marker.

Deliver a wordmark + a compact icon mark that also works alone as an app icon /
favicon. Wordmark set in Plus Jakarta Sans (SemiBold–Bold), optionally with
"Path" in dark ink (#1B2130) and "Finder" in indigo (#3B5BDB).

Style: flat, modern, minimal, geometric-but-friendly, clean lines, no gradients,
no drop shadows, no 3D. Must read clearly at 32px and work in a single colour.

Colours: primary indigo #3B5BDB with dark ink #1B2130; at most one warm amber
accent #F59E0B (e.g. a small marker dot or spark). Never more than two colours.

Provide: 3–4 distinct logo directions; for the strongest one, show the full-colour
wordmark, a single-colour version, a dark-background version, and a 32px favicon crop.
```

Iterate from there — e.g. "simplify mark #1," "make the path more obvious," "try the amber dot as the pin head," "show it on a dark navbar."
