import pytest
from unittest.mock import MagicMock, patch
from infrastructure.adapters.macos_clipboard import MacOSClipboardService


@patch("infrastructure.adapters.macos_clipboard.NSPasteboard")
def test_copy_to_clipboard(mock_pb_class):
    mock_pb = MagicMock()
    mock_pb_class.generalPasteboard.return_value = mock_pb

    service = MacOSClipboardService()
    result = service.copy_to_clipboard("test text")

    assert result is True
    mock_pb.clearContents.assert_called_once()
    mock_pb.setString_forType_.assert_called_with("test text", ANY)


@patch("infrastructure.adapters.macos_clipboard.NSPasteboard")
def test_get_clipboard_content(mock_pb_class):
    mock_pb = MagicMock()
    mock_pb_class.generalPasteboard.return_value = mock_pb
    mock_pb.stringForType_.return_value = "clipboard content"

    service = MacOSClipboardService()
    content = service.get_clipboard_content()

    assert content == "clipboard content"
    mock_pb.stringForType_.assert_called_with(ANY)


@patch("infrastructure.adapters.macos_clipboard.NSPasteboard")
def test_get_change_count(mock_pb_class):
    mock_pb = MagicMock()
    mock_pb_class.generalPasteboard.return_value = mock_pb
    mock_pb.changeCount.return_value = 123

    service = MacOSClipboardService()
    count = service.get_change_count()

    assert count == 123
    mock_pb.changeCount.assert_called_once()


from unittest.mock import ANY
