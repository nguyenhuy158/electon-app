# Agent Guide: QuickClip

## Architecture: Hexagonal (TypeScript)
- **Domain** (`src/domain/`): Pure logic, models, and constants. No external dependencies.
- **Application** (`src/application/`): Use Cases and Port interfaces.
- **Infrastructure** (`src/infrastructure//`): Adapters (Postgres, Electron, Logging).
- **Entry Point**: `src/main.ts` (Main process/DI root) and `src/index.html` (Renderer).

## Critical Constraints
- **Centralized Constants**: Use `APP_CONSTANTS` from `src/domain/constants/index.ts`. No magic strings/numbers.
- **String Externalization**: Use `i18n` Message Catalog from `src/domain/i18n/index.ts`. No hardcoded UI strings.
- **No Comments**: Code must be self-documenting via naming. **Delete all comments** you encounter or write.
- **100% Coverage**: Required for `Domain` and `Application` layers. Enforced via `make cov`.

## Shortcuts & Commands (`Makefile`)
- `make i`: Install (`pnpm`)
- `make s`: Start app (Builds Tailwind + TSC + Electron)
- `make t`: Run tests
- `make l` / `make f`: Lint / Format
- `make cov`: Check coverage (Gatekeeper for `Domain`/`Application`)

## UI & Styling
- **Design System**: Terminal-native aesthetic (Berkeley Mono, 4px radius, cream/ink palette).
- **Tailwind v4**: Styles are in `src/styles.css` using `@theme`.
- **Build**: CSS is compiled from `src/styles.css` to `dist/styles.css`.

## Operational Gotchas
- **IPC Bridge**: Renderer **must** use `window.api` (via `src/preload.ts`). Direct Node imports in renderer will fail.
- **Logging**: Use `WinstonLogger` port. Log level configurable via `LOG_LEVEL` in `.env`.
- **Tray Icon**: Requires `icon.png` in root (or configured path in constants) to initialize.
- **Sync**: Use Cases must await all repository operations to prevent race conditions.
