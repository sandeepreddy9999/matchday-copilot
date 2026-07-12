# Matchday Copilot

A GenAI-powered Fan Copilot for FIFA World Cup 2026 venues — a mobile-first
web app that helps attendees find their way around a stadium, check crowd
density and transport in real time, and ask a bilingual-and-beyond AI
assistant grounded in what's actually happening at the venue.

## Stack

React (JSX) · Vite · TypeScript · Tailwind CSS v4 · Claude API · Vitest ·
Testing Library · ESLint · Prettier

## Why a single interface

This project intentionally ships one focused feature — the Fan Copilot —
rather than splitting effort across a second staff-facing dashboard. Depth
and polish on one surface (accessibility, multilingual support, a real
security story) beats breadth spread thin across two.

## Key features

- **Live stadium bowl map** — an abstracted SVG map of the venue, color-coded
  by real-time crowd density, with generously padded tap targets for mobile.
- **Searchable zone list** — a text-based alternative to tapping the map,
  useful on small screens and for anyone who prefers typing a section name.
- **Multilingual copilot** — responds in English, Spanish, Portuguese,
  French, or Arabic, selectable from the header.
- **Accessibility-aware answers** — zones carry `wheelchairAccessible` and
  `quietZone` metadata, and the copilot can answer accessibility questions
  grounded in that data instead of guessing.
- **Honest fallback labeling** — every assistant reply is either a live
  Claude answer or a local rule-based fallback, and the UI tells you which
  ("Offline answer · not from live AI") instead of hiding the difference.
- **Quick-suggestion chips** — one-tap demo questions so a first-time user
  (or a judge) doesn't have to think of something to ask.

## Architecture

```
src/
  types/       Core domain types (zones, density, incidents, transport, copilot)
  data/        Simulated data generators, driven by a seeded PRNG for
               reproducible demos and exact-value tests
  services/    claudeClient (proxy wrapper) · copilotService (unified AI layer,
               rate limiting, sanitization) · fallbackResponses (offline mode)
  hooks/       useVenueSnapshot (live polling) · useCopilotChat (chat state,
               cancellation of stale requests)
  components/
    shared/    StadiumBowlMap, CopilotPanel, DensityBadge, ErrorBoundary
    fan/       FanCopilot, TransportBoard, ZoneList, LanguageSelector,
               QuickSuggestions
server/        Reference Cloudflare Worker proxy (see below)
```

## Security

- **No hardcoded secrets.** The Anthropic API key never ships to the
  browser. `VITE_CLAUDE_PROXY_URL` points at a small serverless proxy
  (`server/cloudflare-worker.js`) that holds the real key via
  `wrangler secret put ANTHROPIC_API_KEY` and forwards validated requests.
  If unset, the app runs entirely on local simulated responses.
- **Defense in depth on rate limiting.** The client enforces its own
  token-bucket limiter (`src/utils/rateLimiter.ts`) as a first line of
  defense; the proxy independently enforces a per-IP fixed-window limit via
  Workers KV, plus payload-size and message-count caps. Neither on its own
  is sufficient — the client-side check can always be bypassed by a
  determined caller, so the proxy's check is the one that actually matters.
- **Input sanitization.** All user input is stripped of HTML/control
  characters and length-capped before reaching the DOM or the AI layer
  (`src/utils/sanitize.ts`).
- **Locked-down CORS.** The Worker only accepts requests from the deployed
  origin — update `ALLOWED_ORIGIN` in `server/cloudflare-worker.js` before
  deploying.

## Accessibility

WCAG AA-oriented: semantic headings and landmarks, `aria-live` on the chat
log, `aria-label`s on the density map's tap targets, visible focus rings,
and `prefers-reduced-motion` support. The zone list and search input give a
non-map way to reach the same information.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — leave VITE_CLAUDE_PROXY_URL blank for offline mode
npm run dev
```

## Scripts

| Command                | Purpose                                    |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Local dev server                            |
| `npm run build`         | Type-check (`tsc -b`) + production build    |
| `npm run lint`          | ESLint                                      |
| `npm run format:check`  | Prettier check                              |
| `npm test`              | Run the test suite once                     |
| `npm run test:coverage` | Run tests with coverage                     |
| `npm run deploy`        | Build and publish `dist/` to GitHub Pages   |

## Deploying the AI proxy (optional)

```bash
cd server
wrangler kv namespace create RATE_LIMIT_KV   # optional, enables per-IP limiting
wrangler secret put ANTHROPIC_API_KEY
wrangler deploy
```

Then set `VITE_CLAUDE_PROXY_URL` (as a GitHub Actions repo variable, or in
`.env.local` for local dev) to the deployed Worker URL, and update
`ALLOWED_ORIGIN` in `cloudflare-worker.js` to your GitHub Pages origin.

## CI/CD

- `.github/workflows/ci.yml` — lint, format check, type-check, build, tests
  with coverage, and a dependency audit on every push/PR.
- `.github/workflows/deploy.yml` — builds and publishes to GitHub Pages on
  push to `main`, gated on the same checks passing first.
