import logging
import time

from domain.constants.index import AppConstants
from domain.models.clip import Clip

logger = logging.getLogger(__name__)


class ClipboardUseCase:
    def __init__(self, clipboard_service, clipboard_repository):
        self.clipboard_service = clipboard_service
        self.clipboard_repository = clipboard_repository
        self.history = self.clipboard_repository.get_all()

    def get_history(self):
        return [clip.to_dict() for clip in self.history]

    def _sort_history(self):
        self.history.sort(key=lambda x: (not x.is_pinned, -x.timestamp))

    def add_to_history(self, text, source_app="Unknown"):
        if not text:
            return False

        existing_clip = next((c for c in self.history if c.content == text), None)

        if existing_clip:
            # Update timestamp and source app to bring to top of its group
            logger.debug(f"Updating existing clip: {text[:20]}...")
            existing_clip.timestamp = time.time()
            existing_clip.source_app = source_app
        else:
            logger.debug(f"Adding new clip: {text[:20]}...")
            new_clip = Clip(content=text, source_app=source_app)
            self.history.append(new_clip)

        self._sort_history()

        # Apply cleanup while preserving pinned items
        strategy = AppConstants.CLIPBOARD.get("CLEANUP_STRATEGY", "limit")
        value = AppConstants.CLIPBOARD.get("CLEANUP_VALUE", 100)

        pinned = [c for c in self.history if c.is_pinned]
        unpinned = [c for c in self.history if not c.is_pinned]

        if strategy == "limit":
            if len(self.history) > value:
                self.history = pinned + unpinned[: value - len(pinned)]
        elif strategy == "days":
            now = time.time()
            max_age_seconds = value * 24 * 3600
            unpinned = [c for c in unpinned if (now - c.timestamp) < max_age_seconds]
            self.history = pinned + unpinned

        self.clipboard_repository.save_all(self.history)
        return True

    def toggle_pin(self, clip_id):
        for clip in self.history:
            if clip.id == clip_id:
                clip.is_pinned = not clip.is_pinned
                logger.debug(f"Toggled pin for clip {clip_id}: {clip.is_pinned}")
                self._sort_history()
                self.clipboard_repository.save_all(self.history)
                return True
        return False

    def copy_to_clipboard(self, text):
        return self.clipboard_service.copy_to_clipboard(text)
