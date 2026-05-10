# Agent Guide: QuickClip

## Architecture: Hexagonal (TypeScript)

- **Domain** (`src/domain/`): Pure logic, models, and constants. No external dependencies.
- **Application** (`src/application/`): Use Cases and Port interfaces.
- **Infrastructure** (`src/infrastructure/`): Adapters (Neon/Postgres, Electron, Local FS).
- **Entry Points**: `src/main.ts` (Main/DI root), `src/index.html` (Renderer), `src/preload.ts` (IPC Bridge).

## Verified Commands (`Makefile`)

- `make s`: Build (TSC + Tailwind v4) and start Electron.
- `make t`: Run Jest tests.
- `make build`: Explicit build step (`tsc` + CSS compilation + HTML copy).

## Critical Constraints

- **Platform**: Support for **Linux and macOS only**.
- **Centralized Constants**: Use `APP_CONSTANTS` in `src/domain/constants/index.ts` (includes global shortcuts).
- **i18n**: No hardcoded UI strings. Use `i18n` catalog in `src/domain/i18n/`.
- **No Comments**: Delete all comments (code must be self-documenting via naming).
- **100% Coverage**: Required for `Domain` and `Application` layers (`make cov`).

## Operational Gotchas

- **Tailwind v4 Fix**: DO NOT use `@apply` with theme variables in `src/styles.css`; use standard CSS `var(--color-...)` to avoid build resolution errors.
- **IPC Bridge**: Renderer **must** use `window.api`. Direct Node/Electron imports in renderer fail. Update `src/preload.ts` when adding IPC handlers.
- **Auth (Neon)**:
  - `NEON_AUTH_URL` must be the Auth endpoint.
  - `callbackURL` must be an absolute URL (e.g., `http://localhost.com`) despite Electron's `file://` scheme.
- **Storage**:
  - **Guest Mode**: Local JSON at `~/.quickclip/clips.json`.
  - **Smart Switch**: `SmartClipboardRepository` proxies between local and cloud based on auth state.
- **Tray Icon**: Requires `icon.png` in root (configured via `APP_CONSTANTS.UI.TRAY_ICON_PATH`).
