# WatchNest

WatchNest is a family-first streaming safety app for parents who want quick visibility into what their kids want to watch, what is appropriate, and what needs a closer look.

The first version is focused on a clean parent workflow:

1. Search or enter a movie, show, channel, or video.
2. Review a simple safety summary.
3. See concern areas such as language, violence, sexual content, fear intensity, mature themes, and ads or platform risks.
4. Save items to a family watchlist.
5. Make a clear approve, block, or review-later decision.

## Product direction

WatchNest should feel calm, practical, and trustworthy. Parents should not need a media-studies degree, a spreadsheet, or a second cup of coffee to decide whether something is safe.

### MVP scope

- Parent dashboard
- Search/review flow
- Watch item detail page
- Safety rating summary
- Concern category breakdown
- Family watchlist
- Decision states: Approved, Blocked, Needs Review
- Basic environment configuration

### Later scope

- Browser extension or share-sheet intake
- Kid profiles
- Age-based recommendations
- AI-generated review summaries
- Community notes
- Source links and confidence levels
- Notifications for newly released episodes or changed ratings

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Server Components by default
- Environment variables through `.env.local`

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local app:

```bash
http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values as services are added.

```bash
cp .env.example .env.local
```

## Project structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  watch-card.tsx
lib/
  sample-data.ts
public/
  icon.svg
```

## Development notes

This repository starts as a lightweight product scaffold. The goal is to keep the app easy to build, easy to reason about, and ready for real product decisions before adding database, auth, or AI service complexity.
