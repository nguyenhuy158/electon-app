# Agent Guide: QuickClip

## Architecture: Hexagonal
- **Domain** (`src/domain/models/`): Pure logic, no dependencies.
- **Application** (`src/application/`): Ports (interfaces) and Use Cases (business logic).
- **Infrastructure** (`src/infrastructure/adapters/`): Concrete implementations (Postgres, Electron).
- **Entry Point**: `src/main.js` is the DI root.

## Shortcuts & Commands
All commands in the `Makefile` have 1-2 letter shortcuts.
- `make i`: Install dependencies (`pnpm`).
- `make s`: Start Electron app.
- `make t`: Run Jest tests (required for commit).
- `make l` / `make f`: Lint / Format.
- `make cov`: Run coverage.
- `make sc`: Open HTML coverage report in browser.

## Quality & Verification
- **100% Coverage**: Mandatory for `Domain` and `Application` layers. Enforced by Jest and Husky.
- **Git Hooks**: Pre-commit hook runs `make t`. Commits fail if coverage drops or tests fail.
- **Linting**: ESLint ignores `_` prefixed variables (used in Ports/Interfaces).

## Operational Gotchas
- **IPC Bridge**: Renderer **must** use `window.electronAPI` via `src/preload.js`. Direct Node imports in renderer will fail.
- **Tray Icon**: App requires `icon.png` in root to start correctly.
- **Cloud Sync**: Requires `DATABASE_URL` and an authenticated user.
- **Async/Await**: Ensure DB/Infrastructure operations are properly awaited in Use Cases.
