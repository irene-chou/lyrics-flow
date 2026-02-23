# Lyribox

Lyric display and synchronization app for streamers. Syncs lyrics to audio playback (YouTube, local files, or manual timer) and broadcasts to OBS via WebSocket. UI is in Traditional Chinese (zh-TW).

## Quick Reference

- **Dev:** `npm run dev`
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Lint:** `npm run lint` (ESLint 9 flat config, no config file — uses defaults)
- **Test (watch):** `npm run test` (Vitest in watch mode)
- **Test (CI):** `npm run test:run` (single run)
- **Test (coverage):** `npm run test:coverage`
- **Test (E2E):** `npm run test:e2e` (Playwright, requires `npm run preview` server)
- **Test (E2E UI):** `npm run test:e2e:ui`
- **Node:** v22 (see `.nvmrc`)

## Tech Stack

React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + Zustand 5 + Dexie (IndexedDB) + Radix UI + Vaul + Lucide icons + react-colorful + next-themes

## Architecture

```
src/
  main.tsx              # React DOM entry point (StrictMode)
  App.tsx               # Root component — wraps in ThemeProvider (next-themes, dark default)
  index.css             # Global styles (Tailwind imports)
  vite-env.d.ts         # Vite env type declarations
  components/
    layout/             # AppLayout (root layout, sidebar resize, mobile), Header, ControlPanel
    lyrics/             # LyricsDisplay, LyricsContainer, LyricLine, NowSinging, EmptyState
    playback/           # AudioPlayer, YouTubePlayer, ManualTimerPanel, PlaybackInfo, VolumeControl, OffsetControls
    settings/           # DisplaySettings, FontSizeControl, LyricsGapControl, ColorPicker, VisibleRangeControl
    song-library/       # SongDrawer, SongListItem, SongSearchInput, SongDrawerMenu
    song-modal/         # SongModal, AudioSourceTabs, LrcInputTabs
    ui/                 # Shadcn/ui primitives: button, dialog, drawer, dropdown-menu, input, slider, tabs, textarea
  hooks/
    usePlaybackEngine   # Unified playback API across all audio sources
    useYouTubePlayer    # YouTube IFrame API integration
    useLocalAudioPlayer # HTML5 Audio element wrapper
    useManualTimer      # Software timer via Web Worker (50ms tick)
    useSyncEngine       # Lyric line sync via Web Worker (80ms tick)
    useOBSSync          # PieSocket WebSocket connection for OBS
    useSyncBroadcast    # Watches stores, broadcasts changes to OBS
    useKeyboardShortcuts # Global keyboard bindings
    useSongLibrary      # Dexie live queries and re-exports song-service
    useIsMobile         # 768px responsive breakpoint hook
  stores/
    useSongStore        # Current song data, lyrics, offset, audio source, dirty tracking
    usePlaybackStore    # Playback status, currentTime, duration, volume, muted, audio file URL
    useUISettingsStore  # Font sizes, colors, gap, visible range, sidebar width (persisted to localStorage)
    useSyncStore        # Current line index, isSyncing flag
  lib/
    constants           # Shared CSS classes, default UI settings
    db                  # Dexie IndexedDB setup (db.songs table, version 1)
    format              # formatTime(seconds), extractVideoId(url)
    lrc-parser          # parseLRC(text) → { lyrics, title } — supports multiple time formats
    piesocket           # Session ID management, channel naming, OBS URL generation
    song-service        # CRUD for songs: save, delete, debounced auto-save, export/import JSON
    utils               # cn() — clsx + tailwind-merge
  types/
    index.ts            # LyricLine, AudioSource, Song, UISettings, PlaybackStatus, SyncMessage
    youtube.d.ts        # YT IFrame API type declarations
    piesocket.d.ts      # PieSocket library type declarations
  test/
    setup.ts            # Imports @testing-library/jest-dom/vitest
public/
  obs.html              # OBS browser source page (uses __VITE_*__ env placeholders)
  favicon.svg
```

## Stores (State Management)

All stores are Zustand. Follow these conventions:

- **In components:** Use selectors `useSongStore((s) => s.lyrics)` to avoid unnecessary re-renders
- **In event handlers / callbacks:** `useStore.getState()` is acceptable for reading latest state without subscribing
- **In Worker onmessage / non-React context:** `.getState()` is the correct pattern
- **Persist middleware:** Used by `useUISettingsStore` with localStorage key `"lb-ui-settings"`
- **Theme storage key:** `"lb-theme"` (managed by next-themes, not Zustand)

### Store responsibilities

| Store | Key state | Notes |
|---|---|---|
| `useSongStore` | `currentSongId`, `lyrics`, `offset`, `lrcText`, `audioSource` ('youtube'\|'local'), `youtubeId`, `audioFileName` | `loadSong()` resets playback + sync stores. `hasUnsavedChanges()` for dirty tracking |
| `usePlaybackStore` | `status` (IDLE\|PLAYING\|PAUSED\|ENDED), `currentTime`, `duration`, `volume` (0-100), `muted`, `audioFileObjectUrl` | `setAudioFileObjectUrl()` revokes old blob URL to prevent leaks |
| `useUISettingsStore` | `activeFontSize` (32), `otherFontSize` (28), `titleFontSize` (18), `lyricsGap` (16), `visibleBefore` (3), `visibleAfter` (3), colors, `sidebarWidth` (480) | Persisted. Defaults in `lib/constants.ts` |
| `useSyncStore` | `currentLineIndex` (-1 = none), `isSyncing` | Reset on song load |

## Audio Source Architecture

Three audio backends behind a unified `usePlaybackEngine` interface:

| Source | Hook | Trigger |
|---|---|---|
| YouTube | `useYouTubePlayer` | `audioSource='youtube'` + `youtubeId` set |
| Local file | `useLocalAudioPlayer` | `audioSource='local'` + file loaded |
| Manual timer | `useManualTimer` | Lyrics present but no audio |

`usePlaybackEngine` exposes: `play()`, `pause()`, `togglePlay()`, `seekTo(s)`, `seekBy(delta)`, `getCurrentTime()`, `getDuration()`, `stopAll()`

## OBS Sync Flow

1. `useOBSSync` connects to PieSocket WebSocket (API key from `VITE_PIESOCKET_API_KEY`)
2. `useSyncBroadcast` watches store changes via selectors and broadcasts typed messages (SYNC_UPDATE, LYRICS_LOADED, OFFSET, FONT_SIZE, etc.)
3. OBS browser source (`public/obs.html`) receives messages and renders lyrics
4. OBS can send `REQUEST_STATE` to get full state on connect
5. `getOBSUrl()` in `lib/piesocket.ts` generates the URL with session ID

## Web Workers

Workers are created as **blob URLs** (no separate files):

- **Sync engine** (`useSyncEngine`): 80ms interval, reverse-scans lyrics array to find active line index
- **Manual timer** (`useManualTimer`): 50ms interval, tracks elapsed time via `performance.now()`

## Keyboard Shortcuts (`useKeyboardShortcuts`)

| Key | Action |
|---|---|
| Space | Play/pause |
| Escape | Close drawer |
| Left/Right arrow | Adjust offset ±0.1s |
| Shift+Left/Right | Adjust offset ±0.5s |
| Up/Down arrow | Adjust active font size ±2 |
| Cmd/Ctrl+S | Save song |

Shortcuts are disabled when focus is on input/textarea/select/contentEditable elements.

## Testing

### Unit tests (Vitest + jsdom + Testing Library)

- Location: `src/lib/__tests__/*.test.ts` (co-located with source)
- Setup: `src/test/setup.ts` (imports jest-dom matchers)
- Config: `vitest.config.ts` — jsdom environment, globals enabled, excludes `e2e/`
- Existing coverage: `lrc-parser`, `format`, `song-service`

### E2E tests (Playwright)

- Location: `e2e/app.spec.ts`
- Config: `playwright.config.ts` — Chromium only, base URL `http://localhost:4173`
- Web server: `npm run preview` (Vite preview of built app)
- Retries: 2 in CI, 0 locally
- Coverage: app load, theme toggle, song drawer, song modal, create/load song flow

## Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | React + Tailwind plugins, `@` alias, base path `/lyribox/`, custom `envReplacementPlugin` for `__VITE_*__` placeholders in public HTML |
| `vitest.config.ts` | jsdom, globals, setup file, excludes e2e |
| `playwright.config.ts` | Chromium, preview server, retries |
| `tsconfig.json` | References `tsconfig.app.json` + `tsconfig.node.json`, path alias `@/*` → `./src/*` |
| `tsconfig.app.json` | Target ES2020, strict, React-JSX |
| `components.json` | Shadcn/ui config — New York style, Lucide icons, CSS variables |
| `.nvmrc` | Node v22 |
| `.env.example` | `VITE_PIESOCKET_API_KEY`, `VITE_PIESOCKET_CLUSTER_ID` |

## Environment Variables

Copy `.env.example` to `.env` and fill in values:
- `VITE_PIESOCKET_API_KEY` — PieSocket API key for OBS sync
- `VITE_PIESOCKET_CLUSTER_ID` — PieSocket cluster (default: `demo`)

These are also configured as GitHub Actions secrets for deployment.

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`:
1. Triggers on push to `main` or manual dispatch
2. Checks out code, sets up Node v22
3. `npm ci` → `npm run test:run` → `npm run build`
4. Deploys `dist/` to GitHub Pages

Base path is `/lyribox/` (configured in `vite.config.ts`).

## Key Conventions

- **Language:** All user-facing UI text is Traditional Chinese (zh-TW). Preserve this when modifying UI strings.
- **Styling:** Tailwind CSS 4 utility classes. Use `cn()` from `lib/utils.ts` for conditional class merging. Shadcn/ui components in `components/ui/` — do not modify these directly; use `npx shadcn` to manage them.
- **Icons:** Lucide React (`lucide-react`). Import individual icons.
- **Color pickers:** `react-colorful` (HexColorPicker).
- **Theme:** next-themes with `"dark"` default. Storage key `"lb-theme"`.
- **Component patterns:** Memoize expensive components with `React.memo`. Use `useCallback` for handlers passed as props. Components receive engine/handlers via props rather than accessing hooks directly.
- **Path alias:** `@/` maps to `src/` in both TypeScript and Vite configs.
- **No ESLint config file:** Uses ESLint 9 with `typescript-eslint` and `react-hooks`/`react-refresh` plugins (inferred from package.json devDependencies). Run `npm run lint` to check.
