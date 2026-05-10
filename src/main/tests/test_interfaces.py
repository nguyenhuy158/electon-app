from application.ports.interfaces import ClipboardRepository, ClipboardService


class MockService(ClipboardService):
    def copy_to_clipboard(self, text: str):
        pass

    def get_clipboard_content(self) -> str:
        return "test"


class MockRepo(ClipboardRepository):
    def save(self, text: str):
        pass

    def get_all(self) -> list:
        return []


def test_interfaces_definitions():
    service = MockService()
    repo = MockRepo()
    assert service.get_clipboard_content() == "test"
    assert repo.get_all() == []
