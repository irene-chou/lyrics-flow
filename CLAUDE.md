# Lyribox

## Quick Reference

- **Dev:** `npm run dev`
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest)
- **Node:** v22 (see `.nvmrc`)

## Tech Stack

React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + Zustand 5 + Dexie (IndexedDB)

## Architecture

```
src/
  components/     # React components (layout, lyrics, playback, settings, song-library, song-modal, player, control-panel, ui)
  hooks/          # Custom React hooks (playback engine, sync, keyboard shortcuts, audio players)
  stores/         # Zustand stores (playback, song, UI settings, sync)
  lib/            # Utilities (db, lrc-parser, format, piesocket, song-service, constants)
  types/          # TypeScript interfaces and type declarations
```

## Key Patterns

### Zustand Usage
- **In components:** Use selectors `useSongStore((s) => s.lyrics)` to avoid unnecessary re-renders
- **In event handlers / callbacks:** `useStore.getState()` is acceptable for reading latest state without subscribing
- **In Worker onmessage:** `.getState()` is the correct pattern (non-React context)
- **Persist middleware:** Used by `useUISettingsStore` with localStorage

### State Flow
- `useSongStore` — current song data, lyrics, offset
- `usePlaybackStore` — playback status, time, volume, audio file URL
- `useUISettingsStore` — font sizes, colors, line height (persisted)
- `useSyncStore` — current line index, syncing flag

### OBS Sync
- PieSocket WebSocket for real-time sync to OBS browser source
- API key loaded from `VITE_PIESOCKET_API_KEY` env var
- `useSyncBroadcast` watches store changes and broadcasts to OBS
- `useSyncEngine` uses Web Worker for 80ms tick-based lyric sync

### Audio Sources
- YouTube (iframe API) via `useYouTubePlayer`
- Local audio files via `useLocalAudioPlayer`
- Manual timer mode via `useManualTimer`

## Environment Variables

Copy `.env.example` to `.env` and fill in values:
- `VITE_PIESOCKET_API_KEY` — PieSocket API key for OBS sync
- `VITE_PIESOCKET_CLUSTER_ID` — PieSocket cluster (default: `demo`)

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`. Secrets must be configured in repo settings.

## Language

UI text is in Traditional Chinese (zh-TW).
