# QuickClip Roadmap & Feature Ideas

Ideas to enhance the lightweight macOS clipboard manager experience.

## 🟢 Priority 1: Core Utilities (Security & Stability)
- [ ] **Pin/Favorite Clips**: Keep frequently used snippets (emails, code) at the top or in a separate tab.
- [ ] **Privacy Filter**: Blacklist applications (e.g., 1Password, Keychain) to prevent sensitive data logging.
- [ ] **Incognito Mode**: Toggle to temporarily pause clipboard recording.
- [ ] **Auto-cleanup**: Automatically purge history older than X days or limit storage to N items.
- [ ] **Text Sanitizer**: Auto-trim whitespace and strip tracking parameters (`utm_...`, `fbclid`) from URLs.
- [x] **Sound Effects**: Native system sounds when copying or interacting. *(Done)*

## 🟡 Priority 2: Native Experience & UX
- [ ] **Menu Bar Mini-list**: Access the last 5 clips directly from the macOS Menu Bar.
- [ ] **Quick Look (Spacebar)**: Preview long text or formatted content in a native-style popup.
- [ ] **System Accent Color**: Match the UI highlights with macOS System Settings.
- [ ] **Window "Stay on Top"**: Toggle to keep the clipboard window floating during research.
- [ ] **Sequential Paste**: Copy multiple items and paste them in order (FIFO).
- [ ] **Appearance Themes**: Support for Nord, Dracula, and System Adaptive themes.

## 🟠 Priority 3: Developer & Power User Tools
- [ ] **Code Syntax Highlighting**: Detect programming languages and highlight snippets in the list.
- [ ] **Color Preview**: Detect Hex/RGB codes and show a small color square next to the value.
- [ ] **Custom Actions**: Right-click to "Convert to JSON", "Upper/Lower Case", or "Copy as Plain Text".
- [ ] **Paste as Typewriter**: Paste content by simulating key strokes to bypass "No Paste" fields.
- [ ] **CLI Interface**: Access clipboard history via terminal (e.g., `qc list | fzf`).

## 🔵 Priority 4: Smart Features & Experimental
- [ ] **Smart Categories**: Auto-group clips into "Links", "Emails", "Snippets", and "Files".
- [ ] **Smart Link Previews**: Show website titles and favicons for copied URLs.
- [ ] **Image Support & OCR**: Store thumbnails for images and extract text from them.
- [ ] **iCloud Sync**: Use CloudKit to sync "Pinned" items across multiple Macs.
- [ ] **Auto-Translation**: Translate snippets using a local or lightweight web API.

## 🛠 Hexagonal Implementation Notes
- **Domain**: Add `Filter`, `Sanitizer`, and `Workflow` entities.
- **Infrastructure**: Implement `AppObserver` to detect which app currently has focus.
- **Application**: Add `ToggleFavoriteUseCase`, `PurgeHistoryUseCase`, and `SequentialPasteUseCase`.
- **Security**: Encrypt the local JSON storage file.
- **Performance**: Virtualize the history list to handle 1000+ items without lag.
