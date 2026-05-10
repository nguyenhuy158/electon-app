from unittest.mock import MagicMock

from application.use_cases.clipboard_use_case import ClipboardUseCase
from domain.constants.index import AppConstants
from domain.models.clip import Clip


def test_get_history():
    mock_service = MagicMock()
    mock_repo = MagicMock()
    mock_repo.get_all.return_value = [Clip(content="clip1"), Clip(content="clip2")]

    use_case = ClipboardUseCase(mock_service, mock_repo)
    history = use_case.get_history()
    assert history[0]["content"] == "clip1"
    assert history[1]["content"] == "clip2"


def test_add_to_history_new_text():
    mock_service = MagicMock()
    mock_repo = MagicMock()
    mock_repo.get_all.return_value = [Clip(content="clip1")]

    use_case = ClipboardUseCase(mock_service, mock_repo)
    result = use_case.add_to_history("clip2")

    assert result is True
    history = use_case.get_history()
    assert history[0]["content"] == "clip2"
    assert history[1]["content"] == "clip1"


def test_add_to_history_duplicate_text():
    mock_service = MagicMock()
    mock_repo = MagicMock()
    mock_repo.get_all.return_value = [Clip(content="clip1")]

    use_case = ClipboardUseCase(mock_service, mock_repo)
    result = use_case.add_to_history("clip1")

    assert result is False
    assert use_case.get_history()[0]["content"] == "clip1"


def test_add_to_history_empty_text():
    mock_service = MagicMock()
    mock_repo = MagicMock()
    mock_repo.get_all.return_value = [Clip(content="clip1")]

    use_case = ClipboardUseCase(mock_service, mock_repo)
    result = use_case.add_to_history("")

    assert result is False
    assert use_case.get_history()[0]["content"] == "clip1"


def test_add_to_history_limit():
    mock_service = MagicMock()
    mock_repo = MagicMock()
    limit = AppConstants.CLIPBOARD["DEFAULT_HISTORY_LIMIT"]
    mock_repo.get_all.return_value = [Clip(content=f"clip{i}") for i in range(limit)]

    use_case = ClipboardUseCase(mock_service, mock_repo)
    result = use_case.add_to_history("new_clip")

    assert result is True
    history = use_case.get_history()
    assert len(history) == limit
    assert history[0]["content"] == "new_clip"
    assert history[-1]["content"] == f"clip{limit - 2}"


def test_toggle_pin():
    mock_service = MagicMock()
    mock_repo = MagicMock()
    clip = Clip(content="clip1")
    mock_repo.get_all.return_value = [clip]

    use_case = ClipboardUseCase(mock_service, mock_repo)
    result = use_case.toggle_pin(clip.id)

    assert result is True
    assert use_case.history[0].is_pinned is True
    mock_repo.save_all.assert_called()


def test_copy_to_clipboard():
    mock_service = MagicMock()
    mock_repo = MagicMock()
    mock_repo.get_all.return_value = []

    use_case = ClipboardUseCase(mock_service, mock_repo)
    mock_service.copy_to_clipboard.return_value = True

    assert use_case.copy_to_clipboard("text") is True
    mock_service.copy_to_clipboard.assert_called_with("text")
