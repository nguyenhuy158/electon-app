from unittest.mock import MagicMock

from src.main import API, get_resource_path


def test_get_resource_path():
    path = get_resource_path("test.txt")
    assert "test.txt" in path


def test_api_methods():
    mock_use_case = MagicMock()
    api = API(mock_use_case)

    api.get_history()
    mock_use_case.get_history.assert_called_once()

    api.copy_to_clipboard("test")
    mock_use_case.copy_to_clipboard.assert_called_once_with("test")

    shortcut = api.get_shortcut()
    assert shortcut["open_picker"] == "<cmd>+<shift>+v"
    assert shortcut["toggle_pin"] == "Control+Enter"

    translations = api.get_translations()
    assert translations["APP"]["NAME"] == "QuickClip"
    assert api.update_shortcut("Ctrl+C") == {"success": True}
    assert api.logout() is True

    login_res = api.login({"email": "test@example.com"})
    assert login_res["success"] is True
    assert login_res["user"]["email"] == "test@example.com"

    reg_res = api.register({"email": "test@example.com"})
    assert reg_res["success"] is True
