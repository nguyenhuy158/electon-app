# QuickClip Roadmap & Feature Ideas

Ideas to enhance the lightweight macOS clipboard manager experience.

## 🟢 Priority 1: Core Utilities (Security & Stability)
- [ ] **Pin/Favorite Clips**: Keep frequently used snippets at the top.
- [ ] **Privacy Filter**: Blacklist applications (e.g., 1Password) from being logged.
- [ ] **Incognito Mode**: Toggle to temporarily pause clipboard recording.
- [ ] **Auto-cleanup**: Purge history older than X days or limit to N items.
- [ ] **Text Sanitizer**: Auto-trim whitespace and strip URL tracking parameters.
- [x] **Sound Effects**: Native system sounds when copying/interacting. *(Done)*

## 🟡 Priority 2: Native Experience & UX
- [ ] **Menu Bar Mini-list**: Access the last 5 clips directly from the Menu Bar icon.
- [ ] **Quick Look (Spacebar)**: Native-style preview for long text or code.
- [ ] **System Accent Color**: Match UI highlights with macOS System Settings.
- [ ] **Window "Stay on Top"**: Toggle floating window mode.
- [ ] **Sequential Paste**: Copy multiple items and paste them in order (FIFO).
- [ ] **Fuzzy Search**: Implement `fzf`-like fuzzy matching for the search bar.
- [ ] **Appearance Themes**: Support for Nord, Dracula, and System Adaptive themes.

## 🟠 Priority 3: Developer & Power User Tools
- [ ] **Code Syntax Highlighting**: Language detection and syntax colors in list.
- [ ] **Color Preview**: Show color squares for Hex/RGB/HSL codes.
- [ ] **Custom Actions**: Right-click to "Convert to JSON", "Case Transform", etc.
- [ ] **Paste as Typewriter**: Simulate key strokes to bypass "No Paste" restrictions.
- [ ] **Templates (Snippets)**: Store phrases with placeholders (e.g., `Hello {name}`).
- [ ] **CLI Interface**: Access history via terminal (e.g., `qc list | fzf`).

## 🔵 Priority 4: Intelligence & Analytics
- [ ] **Smart Categories**: Auto-group "Links", "Emails", "Snippets", and "Files".
- [ ] **Duplicate Detection**: Auto-merge identical clips with different whitespace/timestamps.
- [ ] **Clipboard Statistics**: Dashboard showing usage patterns (most active apps).
- [ ] **Export/Import**: Backup and restore clipboard history as JSON or CSV.
- [ ] **Smart Link Previews**: Website titles and favicons for URLs.
- [ ] **Image Support & OCR**: Thumbnails for images and text extraction.

## 🟣 Priority 5: Advanced Connectivity
- [ ] **iCloud Sync**: Sync "Pinned" items across multiple Macs via CloudKit.
- [ ] **LAN Sync**: Shared clipboard across local network (P2P).
- [ ] **Mobile Companion**: Lightweight iOS app to view/push clips to Mac.
- [ ] **Auto-Translation**: Instant translation via local or web API.

## 🛠 Hexagonal Implementation Notes
- **Domain**: Add `Filter`, `Sanitizer`, `Workflow`, and `Analytics` entities.
- **Infrastructure**: Implement `AppObserver` for focus detection and `CloudProvider`.
- **Application**: Add `SequentialPasteUseCase`, `PurgeHistoryUseCase`, and `ExportUseCase`.
- **Security**: Encrypt the local JSON storage file.
- **Performance**: Virtualize the history list for 1000+ items.
