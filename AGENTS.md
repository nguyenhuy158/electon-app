# Agent Guide: QuickClip (PyWebView Edition)

## Architecture: Hexagonal (Python)

- **Domain** (`src/domain/`): Pure logic, models (`clip.py`), and constants (`index.py`).
- **Application** (`src/application/`): Use Cases (`clipboard_use_case.py`) and Port interfaces.
- **Infrastructure** (`src/infrastructure/`): Adapters for macOS Clipboard (`macos_clipboard.py`) and JSON storage (`json_repository.py`).
- **Entry Points**: `src/main.py` (Backend + PyWebView setup), `src/renderer/index.html` (Frontend).

## Verified Commands (`Makefile`)

- `make i`: Install dependencies (`uv` for Python, `pnpm` for Tailwind).
- `make s` / `make run`: Build UI and start app in development mode.
- `make t`: Run `pytest` suite.
- `make l` / `make f`: Lint or format Python code using `ruff`.
- `make b`: Build standalone macOS `.app` and DMG using PyInstaller.
- `make cov`: Run tests with coverage report.

## Critical Constraints

- **Platform**: **macOS only**. Uses `PyObjC` for native clipboard access and `AppKit` for window activation.
- **Bridge**: JS calls Python via `window.pywebview.api`. A wrapper in `index.html` aliases this to `window.api`.
- **I18n**: No hardcoded UI strings. Use `I18n` class in Python; JS fetches via `window.api.get_translations()`.
- **Frontend Logic**: The source of truth for JS logic is the `<script>` tag in `src/renderer/index.html`. `src/renderer/src/main.ts` is a legacy/reference file and is NOT used in the build.
- **Tailwind v4**: CSS source is `src/renderer/src/styles.css`, compiled to `src/renderer/styles.css`.

## Operational Gotchas

- **Hot Reload**: `main.py` runs a background thread monitoring `index.html` and `styles.css`, triggering `location.reload()` on change.
- **Global Hotkey**: Managed by `pynput`. Default is `cmd+shift+v`. If it fails to register, check macOS Accessibility/Input Monitoring permissions.
- **Storage**: Local JSON at `~/.quickclip/clips.json`. Logs at `~/.quickclip/app.log`.
- **Window Management**: Uses `frameless=True`. Dragging is enabled via `.pywebview-drag-region` class in HTML.
