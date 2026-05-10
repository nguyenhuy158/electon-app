# QuickClip (PyWebView Edition)

Lightweight clipboard manager for macOS using PyWebView.

## Why PyWebView?
- **Small size**: Uses system WKWebView (~10MB vs >100MB Electron).
- **Native performance**: Native macOS clipboard integration via PyObjC.
- **Low memory**: Minimal overhead.

## Setup

```bash
# Install dependencies
make install
```

## Commands

- `make run`: Start development mode
- `make build`: Build standalone .app for macOS

## Architecture

- **Backend**: Python 3 + PyWebView + PyObjC.
- **Frontend**: HTML/CSS/JS (Tailwind CSS).

## Ownership

Maintained by **nguyenhuy158**.
