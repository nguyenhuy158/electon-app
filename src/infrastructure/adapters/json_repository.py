import json
import os
from typing import List

from application.ports.interfaces import ClipboardRepository
from domain.constants.index import AppConstants
from domain.models.clip import Clip


class JSONClipboardRepository(ClipboardRepository):
    def __init__(self):
        self.path = os.path.expanduser(AppConstants.STORAGE["LOCAL_PATH"])
        if not os.path.exists(os.path.dirname(self.path)):
            os.makedirs(os.path.dirname(self.path))

    def save_all(self, clips: List[Clip]):
        try:
            data = [clip.to_dict() for clip in clips]
            with open(self.path, "w") as f:
                json.dump(data, f)
        except Exception as e:
            print(f"Error saving history: {e}")

    def get_all(self) -> List[Clip]:
        if os.path.exists(self.path):
            try:
                with open(self.path, "r") as f:
                    data = json.load(f)
                    if not isinstance(data, list):
                        return []
                    return [Clip.from_dict(item) for item in data]
            except Exception:
                return []
        return []
