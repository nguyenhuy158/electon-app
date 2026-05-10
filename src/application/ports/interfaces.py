from abc import ABC, abstractmethod


class ClipboardService(ABC):
    @abstractmethod
    def copy_to_clipboard(self, text: str):
        pass

    @abstractmethod
    def get_clipboard_content(self) -> str:
        pass


class ClipboardRepository(ABC):
    @abstractmethod
    def save(self, text: str):
        pass

    @abstractmethod
    def get_all(self):
        pass
