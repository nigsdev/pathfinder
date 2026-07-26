# PathFinder — Cursor Build Plan

**Stack:** Next.js (App Router) · Cursor · OpenAI · Exa · Firecrawl · **Render** (Web Service)
**Constraint:** ~3 hours clean build time, solo, no prize. Mobile-first — students will open the live link on their phones.
**Companion docs:** `PathFinder_MVP_Plan.md` (flow + architecture), `PathFinder_Design_System.md` (tokens + components).

---

## 0. Before you start

### Architecture note — Render vs Netlify

Render Web Services are a **continuously running Node server**, not serverless functions. The orchestrator is therefore a **Next.js route handler** (`app/api/advise/route.ts`) inside the same app, deployed as one Render Web Service. One repo, one deploy, one URL. Everything else from the architecture doc is unchanged — including the rule that **all API keys live server-side only**.

### ✅ Deployment settings (spin-down solved)

Free web services sleep after 15 minutes of inactivity. **Paid instance types do not spin down** — and $100 of Render credits covers this many times over (Starter is $7/month, prorated by the second ≈ 25¢ for a day).

**The catch: credits are billing balance, not a tier.** If the instance type is left on "Free," the service still sleeps while the credits go unused. Set it explicitly.

At service creation:
- **Instance type: Starter** (512 MB) — bump to Standard if you hit memory limits; takes effect immediately.
- **Region: Singapore** — closest Render region to India; better latency for phones at the venue.

### ⚠️ Remaining deployment risks (ranked)

1. **A bad push breaking the live demo.** Render auto-deploys on every push to the connected branch. Once you reach a demo-worthy state, **stop pushing** — or disable auto-deploy in service settings for the last stretch. Locate the **rollback to previous deploy** button before you need it.
2. **Works locally, fails in prod.** Almost always a missing env var on the Render dashboard. Test the **live URL** after every step, not just localhost.
3. **Deploy latency during the event.** Builds take minutes. **Last deploy at 3:30.** Never push at 4:04.

### Backup path (set up tonight, ~10 min)

Install and test a tunnel (Cloudflare Tunnel or ngrok). If Render fails in a way you can't debug under pressure: `npm run dev` locally + tunnel = a phone-accessible public URL in ~60 seconds. Fails independently of Render.

**Do not switch deployment platforms the night before.** Render on a paid instance is fully adequate here.

### Working with Cursor

- Put these three `.md` docs in `/docs` in the repo and `@`-mention them for context.
- **One step = one Cursor session.** Scoped requests beat giant ones.
- **Commit after every green step.** Deployable state at all times.
- `.env.local` for local keys; `.gitignore` it. Same keys set in the Render dashboard under Environment.

### Env vars

```
OPENAI_API_KEY=
EXA_API_KEY=
FIRECRAWL_API_KEY=
DEMO_CITY=
```

---

## Step 0 — Repo + live deploy skeleton  ⏱ do tonight

**Goal:** prove the pipeline before writing any real code.

- `npx create-next-app@latest` (App Router, TypeScript).
- Single page rendering "PathFinder — coming soon".
- Push to GitHub → Render → New Web Service → connect repo.
  - Build: `npm run build` · Start: `npm start`
  - **Instance type: Starter** (not Free) · **Region: Singapore**
- Add env vars in the Render dashboard (empty values fine for now).
- Set up and test the tunnel backup (Cloudflare Tunnel / ngrok).

**Done when:** the live Render URL opens **on your phone**. If repo → build → live URL works tonight, tomorrow is features instead of plumbing.

---

## Step 1 — Design tokens + mobile shell

**Goal:** the app looks like the brand on a phone.

- Paste the `:root` CSS variables from the design system into `globals.css`.
- Add the Google Fonts link (Plus Jakarta Sans + Inter).
- Mobile-first layout shell: single column, max-width ~640px centred on desktop, 16–20px side padding.
- Header with the logo; canvas background `--canvas`.

**Done when:** brand colours and fonts render correctly at 375px width.

---

## Step 2 — Profile form (mobile-first)

**Goal:** capture a clean profile object.

Fields: **percentage/marks**, **stream** (PCM / PCB / Commerce / Arts / Other), **city**, **decided?** (yes/no toggle), **career** (only if decided), **interests** (free text, optional).

Mobile requirements — these are functional, not cosmetic:
- Inputs **≥16px font** (below this, iOS Safari auto-zooms on focus).
- Tap targets **≥44px** tall.
- Correct `inputMode`/`type` so phones show the right keyboard.
- Full-width submit button; comfortable thumb reach.

Client-side validation with inline errors in `--error`.

**Done when:** submitting logs a well-formed profile object; usable one-handed on a phone.

---

## Step 3 — API contract + hardcoded response  ⭐ pivot point

**Goal:** the entire loop is live with fake data.

- Create `app/api/advise/route.ts` (POST). Return a **hardcoded JSON object in the final shape**:

```json
{
  "direction": { "title": "", "why": "", "skills": ["", ""] },
  "colleges": [{ "name": "", "location": "", "course": "", "fees": "", "why": "" }],
  "checklist": [{ "task": "", "detail": "", "deadline": "" }],
  "meta": { "dataSource": "seeded|live", "usedFallback": false }
}
```

- Frontend posts the profile, renders three result cards from the response:
  - **Direction & skills** — indigo accent
  - **College shortlist** — teal accent
  - **Next steps** — amber accent
- Add a real **loading state** (the pipeline will take seconds — silence reads as broken on mobile).
- **Deploy again.**

**Done when:** on your phone, filling the form returns and renders three cards. This JSON shape is now the contract every later step fills in. **From here you always have a demo.**

---

## Step 4 — Seeded dataset + fallback module

**Goal:** real college data, no external dependency.

- `data/colleges.json` — ~10 real colleges for your demo city (name, location, courses, approx fees, notes).
- `lib/retrieve.ts` exporting `getColleges(profile)` — returns seeded data for now.
- Route handler calls it instead of returning hardcoded colleges.

**Done when:** results show real seeded colleges. This file is your demo insurance for the rest of the day.

---

## Step 5 — OpenAI synthesis  ⭐ this is the product

**Goal:** genuine reasoning instead of canned text.

- `lib/synthesize.ts` — one OpenAI call taking `{ profile, direction, colleges }`.
- Use **JSON mode** (`response_format: { type: "json_object" }`); instruct the model to emit **nothing but** the object.
- **Parse defensively** — try/catch with a fallback object in the correct shape. Never let a malformed response blank the screen.
- Keep the prompt in its own file so you can tune it without touching logic.

**Done when:** two different profiles produce genuinely different, sensible recommendations over the seeded colleges.

---

## Step 6 — Exa live search

**Goal:** colleges come from live data — the demo's wow moment.

- `lib/exa.ts` — semantic search built from stream + city + direction (e.g. "BCA and BSc Computer Science colleges in [city] with fees").
- Normalise results into the same college shape as the seeded file.
- **Wrap in try/catch + a timeout (~8s).** On any failure, fall back to seeded and set `meta.usedFallback = true`.

**Done when:** results show live colleges; killing your wifi still produces a working (seeded) result.

---

## Step 7 — Firecrawl enrichment  ✂️ first to cut

**Goal:** richer detail on the top results.

- Scrape the top **1–2** college URLs only; extract fees, courses, admission dates.
- Merge into the college objects; skip silently on failure.

**Done when:** at least one college shows scraped detail. **If you're behind schedule, skip this entirely** — it's polish, not spine.

---

## Step 8 — Undecided branch (quiz → infer → pick)

**Goal:** the counselling path from the flow doc.

- Quiz screen: 6–10 scored interest questions, one per card, selectable options (selected = Primary 600 border + Primary 050 fill).
- Simple scoring → small trait profile.
- One OpenAI call: trait profile + marks + stream → **2–3 candidate directions**.
- **Auto-pick the top direction** (single-shot) and continue into Step 5's synthesis. Add an interactive "pick one" screen only if time remains.
- On results, include the **"why this direction fits you"** line — this is the counselling payload.

**Label it honestly:** "interest finder" / "direction quiz", **never** "psychometric assessment."

**Done when:** the undecided path produces a direction that visibly shapes the colleges and skills shown.

---

## Step 9 — Mobile polish + demo hardening

- Test at 375px and 414px widths; check no horizontal scroll and no text overflow.
- Error state: friendly message plus a retry button — never a blank screen.
- Empty/edge cases: 0 colleges found, very low marks, unusual city.
- Add a small "roadmap" footnote: verified alumni reviews + 1:1 counsellor sessions — visually separated from what's live.
- **Rehearse the demo twice** with your locked persona, on your phone, on venue-style wifi.
- **Warm the Render service** right before demoing.

---

## Time budget

| Time | Steps |
|------|-------|
| Tonight | Step 0 (+ Step 1 if energy allows); write the synthesis prompt |
| 0:00–0:30 | Steps 1–2 |
| 0:30–1:00 | Step 3 ⭐ deploy |
| 1:00–1:15 | Step 4 |
| 1:15–2:00 | Step 5 ⭐ |
| 2:00–2:30 | Step 6 |
| 2:30–2:45 | Step 7 (cut if behind) |
| 2:45–3:15 | Step 8 |
| 3:15–3:30 | Step 9 + rehearse |

**Hard stop 3:30.** Deployed and rehearsed beats feature-complete and broken.

---

## Demo-day checklist

- [ ] Live URL open on your own phone
- [ ] Render instance type confirmed **Starter, not Free**
- [ ] No pushes since the last known-good deploy
- [ ] Tunnel backup tested and ready
- [ ] Locked demo persona memorised
- [ ] Seeded fallback verified working with wifi off
- [ ] Hotspot ready
- [ ] Laptop + charger
