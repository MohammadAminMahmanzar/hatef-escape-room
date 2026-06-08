# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint via next lint
npm run start        # serve production build
```

Copy `.env.example` to `.env.local` before running. Both API keys are optional — the game is fully playable without any key.

## Environment Variables

- `OPENROUTER_API_KEY` — primary key for Layer 5 (free OpenRouter models, auto-failover across model list)
- `OPENROUTER_MODEL` — override the first model in the failover chain (default: `google/gemma-4-31b-it:free`)
- `ANTHROPIC_API_KEY` — fallback if no OpenRouter key; uses `claude-opus-4-8`
- If neither key is set, Layer 5 runs in offline mode using a local prompt validator (`lib/acrostic.ts`)

## Architecture

### Game Flow

The app has two routes: `/` (intro screen) and `/game` (main gameplay). Game state is a single Zustand store (`lib/store.ts`) persisted to localStorage, so the timer survives page refreshes. Phases: `intro → playing → win | lose`.

### Five Layers (lib/puzzles.ts)

All puzzle content, correct answers, hints, and narration text live in `lib/puzzles.ts`. Each layer is rendered by its own component under `components/puzzles/`. Every puzzle component receives a single `onSolved` callback — calling it advances `currentLayer` in the store (or triggers `win` on layer 5).

| Layer | Concept | Answer type |
|-------|---------|-------------|
| 1 – Tokenization | Split words into tokens | 4-digit lock code `7391` |
| 2 – Embedding | Find the intruder word per cluster | 4-letter password `نگار` |
| 3 – Attention | Connect pronouns to referents | Drag-line matching |
| 4 – Generation | Pick correct tokens step-by-step | Multi-step selection |
| 5 – Prompt Engineering | Write a prompt to get an acrostic poem | API call to `/api/oracle` |

### Layer Shell (`components/LayerShell.tsx`)

Wraps each puzzle with Hatef's intro narration, the hint button, and the educational outro message shown after solving. Uses render-prop pattern: `<LayerShell layerId={n}>{(onSolved) => <LayerNPuzzle onSolved={onSolved} />}</LayerShell>`.

### Oracle API (`app/api/oracle/route.ts`)

POST `/api/oracle` — accepts `{ prompt: string }`, calls AI, validates the Persian acrostic "رها" (ر/ه/ا as first letters of 3 lines), returns `{ success, output, message, mode }`. Failover order: OpenRouter (cycles through `OPENROUTER_MODELS` on 429) → Anthropic → offline local check.

### Acrostic Validation (`lib/acrostic.ts`)

Shared between the API route and offline fallback. Normalises Arabic diacritic variants of Alef before comparing first letters. `promptCoversRequirements` is the offline validator that checks whether the user's prompt mentions "شعر", "آزادی", and the acrostic condition.

### Scoring (`lib/scoring.ts`)

`computeScore(solvedLayers, remainingSeconds, hintsUsed)` — base points per layer (layers 1-4: 1000 each, layer 5: 1500) + 2pts/remaining second − hint penalty (each hint costs 90 s × 2 pts = 180 pts). `toFa()` converts ASCII digits to Persian numerals.

### Audio (`lib/audio.ts`)

Tone.js generative ambient music. Falls back gracefully if `public/audio/ambient.mp3` exists (preferred) or produces synthetic audio. Controlled by `soundOn` in the store.

### UI

- All text is Persian (RTL). Tailwind is configured with `dir="rtl"` globally.
- `SceneBackground` renders layer-specific images from `public/images/` with CSS gradient fallbacks.
- `HatefOrb` + `HatefSpeech` handle the animated AI character and speech bubbles.
- `Hud` shows the countdown timer and progress locks (`ProgressLocks`).
- Framer Motion `AnimatePresence` handles layer transitions in `app/game/page.tsx`.

## Key Design Constraints

- The game must be completable with zero external services — every layer has a working offline path.
- Layer 5's `onSolved` is only called after the oracle returns `success: true`.
- Timer state (`startTimestamp` + `penaltySeconds`) is stored as raw values, not a countdown, so it remains accurate after page refresh. `remainingSeconds()` is a computed selector, not stored state.
