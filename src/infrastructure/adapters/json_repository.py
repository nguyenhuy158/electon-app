import json
import os
from application.ports.interfaces import ClipboardRepository
from domain.constants.index import AppConstants


class JSONClipboardRepository(ClipboardRepository):
    def __init__(self):
        self.path = os.path.expanduser(AppConstants.STORAGE["LOCAL_PATH"])
        if not os.path.exists(os.path.dirname(self.path)):
            os.makedirs(os.path.dirname(self.path))

    def save_all(self, history):
        try:
            with open(self.path, "w") as f:
                json.dump(history, f)
        except Exception as e:
            print(f"Error saving history: {e}")

    def save(self, text: str):
        # This repo handles the whole list, but we can implement single save if needed
        pass

    def get_all(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r") as f:
                    return json.load(f)
            except Exception:
                return []
        return []
