from abc import ABC, abstractmethod
from typing import Any, List


class ClipboardService(ABC):
    @abstractmethod
    def copy_to_clipboard(self, text: str):
        pass

    @abstractmethod
    def get_clipboard_content(self) -> str:
        pass

    @abstractmethod
    def get_active_app(self) -> str:
        pass


class ClipboardRepository(ABC):
    @abstractmethod
    def save_all(self, clips: List[Any]):
        pass

    @abstractmethod
    def get_all(self) -> List[Any]:
        pass
