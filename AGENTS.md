# Agent Guide: QuickClip

## Permissions
- **Primary Maintainer**: `nguyenhuy158`
- **Restrictions**: Only code pushed by `nguyenhuy158` triggers production releases.

## Architecture: Hexagonal (TypeScript)
- **Domain** (`src/domain/models/`): Pure logic, no dependencies.
- **Application** (`src/application/`): Ports (interfaces) and Use Cases (business logic).
- **Infrastructure** (`src/infrastructure/adapters/`): Concrete implementations (Postgres, Electron).
- **Entry Point**: `src/main.ts` is the DI root.

## Shortcuts & Commands
All commands in the `Makefile` have 1-2 letter shortcuts.
- `make i`: Install dependencies (`pnpm`).
- `make s`: Start Electron app via `ts-node`.
- `make t`: Run Jest tests (required for commit).
- `make l` / `make f`: Lint / Format.
- `make cov`: Run coverage.
- `make sc`: Open HTML coverage report in browser.

## Coding Style & Quality
- **Self-Documenting Code**: **NEVER** use comments. Code must be entirely self-explanatory through expressive naming and structure.
- **100% Coverage**: Mandatory for `Domain` and `Application` layers. Enforced by Jest and Husky.
- **Git Hooks**: Pre-commit hook runs `make t`. Commits fail if coverage drops or tests fail.
- **Linting**: ESLint ignores `_` prefixed variables (used in Ports/Interfaces).

## Operational Gotchas
- **IPC Bridge**: Renderer **must** use `window.electronAPI` via `src/preload.ts`. Direct Node imports in renderer will fail.
- **Tray Icon**: App requires `icon.png` in root to start correctly.
- **Cloud Sync**: Requires `DATABASE_URL` and an authenticated user.
- **Async/Await**: Ensure DB/Infrastructure operations are properly awaited in Use Cases.
