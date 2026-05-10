from domain.constants.index import AppConstants
from domain.models.clip import Clip


class ClipboardUseCase:
    def __init__(self, clipboard_service, clipboard_repository):
        self.clipboard_service = clipboard_service
        self.clipboard_repository = clipboard_repository
        self.history = self.clipboard_repository.get_all()

    def get_history(self):
        return [clip.to_dict() for clip in self.history]

    def add_to_history(self, text):
        if not text:
            return False

        # Check if text already exists in history (to move it to top)
        existing_clip = next((c for c in self.history if c.content == text), None)

        if existing_clip:
            if self.history[0].content == text:
                return False
            self.history.remove(existing_clip)
            self.history.insert(0, existing_clip)
        else:
            new_clip = Clip(content=text)
            self.history.insert(0, new_clip)

        # Apply limit while preserving pinned items
        limit = AppConstants.CLIPBOARD["DEFAULT_HISTORY_LIMIT"]
        if len(self.history) > limit:
            # Keep pinned items and latest non-pinned items
            pinned = [c for c in self.history if c.is_pinned]
            unpinned = [c for c in self.history if not c.is_pinned]
            self.history = pinned + unpinned[: limit - len(pinned)]

        self.clipboard_repository.save_all(self.history)
        return True

    def toggle_pin(self, clip_id):
        for clip in self.history:
            if clip.id == clip_id:
                clip.is_pinned = not clip.is_pinned
                # Re-sort: pinned items first, then by timestamp
                self.history.sort(key=lambda x: (not x.is_pinned, -x.timestamp))
                self.clipboard_repository.save_all(self.history)
                return True
        return False

    def copy_to_clipboard(self, text):
        return self.clipboard_service.copy_to_clipboard(text)
