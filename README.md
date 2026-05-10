# QuickClip

Electron clipboard manager with cloud sync.

## Setup
```bash
pnpm install
cp .env.example .env
```

## Commands
- `make s`: Start app
- `make t`: Run tests
- `make l`: Lint code
- `make f`: Format code

## Architecture
Hexagonal (Domain, Application, Infrastructure).

## Quality Control
- **100% Coverage**: Enforced on `Domain` and `Application` layers via Jest.
- **Git Hooks**: Pre-commit hook runs `make t` to prevent regression.
