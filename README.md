# PathFinder

Honest college and career guidance for Class 12 students who did not take NEET, JEE, CUET, or CLAT. PathFinder helps you explore directions, shortlist colleges, and plan next steps in one session — no account required.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Exa** — live semantic college search
- **Firecrawl** — scrape top college pages for verified fee/admission details
- **OpenAI** — direction inference, synthesis, and structured extraction
- **Render** — deployment target (Web Service)

All API keys live server-side in `/api/advise` only. Nothing sensitive ships to the browser.

## Environment variables

Create `.env.local` for local development:

```bash
OPENAI_API_KEY=sk-...
EXA_API_KEY=...
FIRECRAWL_API_KEY=fc-...
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | Inference, synthesis, and extraction |
| `EXA_API_KEY` | Yes | Live college search (falls back to seeded data on failure) |
| `FIRECRAWL_API_KEY` | Yes for enrichment | Scrape college sites (silently skipped if missing) |
| `PORT` | Production | Set by Render; defaults to 3000 locally |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## What's built vs roadmap

### Built (MVP)

- Student profile form with decided / undecided branch
- Interest finder quiz (8 questions) for undecided students
- AI direction inference from quiz signals
- Live college retrieval via Exa + seeded Delhi/NCR fallback
- Firecrawl enrichment of top 2 colleges with source URLs
- AI synthesis into direction, shortlist, and checklist
- Mobile-first results with source labels and verified-site badge

### Roadmap (not built)

- Verified reviews from real alumni
- 1:1 sessions with alumni and counsellors
- Validated psychometric assessment
- Accounts, payments, and booking flows

## Project structure

```
app/           Pages and API routes
components/    UI (form, quiz, results)
lib/           Pipeline: retrieve, enrich, infer, synthesize
data/          Seeded college directory (offline fallback)
```

## Deploy on Render

1. Connect the repo as a **Web Service**
2. Build command: `npm run build`
3. Start command: `npm start` (respects `PORT`)
4. Add the three API keys as environment variables
5. Node 20+ is required (`engines` in `package.json`)
