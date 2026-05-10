# QuickClip Roadmap & Feature Ideas

Ideas to enhance the lightweight macOS clipboard manager experience.

## 🟢 Priority 1: Core Utilities (Low Overhead)
- [ ] **Pin/Favorite Clips**: Keep frequently used snippets (emails, code) at the top or in a separate tab.
- [ ] **Privacy Filter**: Blacklist applications (e.g., 1Password, Keychain) to prevent sensitive data from being logged.
- [ ] **Auto-cleanup**: Automatically purge history older than X days or limit storage to N items.
- [ ] **Text Cleaning**: Strip tracking parameters from URLs (e.g., `utm_...`) and trim whitespace.

## 🟡 Priority 2: Native Experience
- [ ] **Menu Bar Mini-list**: Access the last 5 clips directly from the macOS Menu Bar icon.
- [ ] **Quick Look**: Press `Space` to preview long text or formatted content in a popup.
- [ ] **Sound Effects**: Subtle native system sounds when copying or switching views.
- [ ] **System Accent Color**: Automatically match the UI accent color with macOS System Preferences.

## 🟠 Priority 3: Advanced Features
- [ ] **Smart Search**: Filter by content type (e.g., `type:url`, `type:email`, `type:color`).
- [ ] **iCloud Sync**: Use macOS native sync capabilities to share "Pinned" items across devices.
- [ ] **Image Support**: Store and display thumbnails for copied images (using base64).
- [ ] **Rich Formatting**: Support for Basic Markdown preview or JSON pretty-printing.

## 🛠 Hexagonal Implementation Notes
- **Domain**: Add `Filter` and `Sanitizer` entities.
- **Infrastructure**: Implement `AppObserver` to detect which app currently has focus (for Privacy Filter).
- **Application**: Add `ToggleFavoriteUseCase` and `PurgeHistoryUseCase`.
