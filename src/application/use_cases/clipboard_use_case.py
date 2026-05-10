from domain.constants.index import AppConstants


class ClipboardUseCase:
    def __init__(self, clipboard_service, clipboard_repository):
        self.clipboard_service = clipboard_service
        self.clipboard_repository = clipboard_repository
        self.history = self.clipboard_repository.get_all()

    def get_history(self):
        return self.history

    def add_to_history(self, text):
        if text and (not self.history or text != self.history[0]):
            limit = AppConstants.CLIPBOARD["DEFAULT_HISTORY_LIMIT"]
            self.history = [text] + self.history[: limit - 1]
            self.clipboard_repository.save_all(self.history)
            return True
        return False

    def copy_to_clipboard(self, text):
        return self.clipboard_service.copy_to_clipboard(text)
