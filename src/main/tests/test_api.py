import json
import sys
from unittest.mock import MagicMock, patch

from index import API, get_resource_path


def test_get_resource_path():
    # Test normal path
    path = get_resource_path("test.txt")
    assert "test.txt" in path

    # Test PyInstaller path
    with patch.object(sys, "_MEIPASS", "/tmp/app", create=True):
        path = get_resource_path("test.txt")
        assert path == "/tmp/app/test.txt"


def test_api_history_management(tmp_path):
    storage_file = tmp_path / "clips.json"

    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        # Test initialization with non-existent file
        api = API()
        assert api.history == []

        # Test initialization with existing file
        with open(storage_file, "w") as f:
            json.dump(["clip1", "clip2"], f)

        api = API()
        assert api.history == ["clip1", "clip2"]

        # Test corrupted file
        with open(storage_file, "w") as f:
            f.write("invalid json")
        api = API()
        assert api.history == []


@patch("index.API._load_history")
def test_api_methods(mock_load):
    api = API()
    api.history = []
    assert api.get_history() == []
    assert api.get_shortcut() == "Command+Shift+V"
    assert api.update_shortcut("Ctrl+C") == {"success": True}
    assert api.logout() is True

    login_res = api.login({"email": "test@example.com"})
    assert login_res["success"] is True
    assert login_res["user"]["email"] == "test@example.com"

    reg_res = api.register({"email": "test@example.com"})
    assert reg_res["success"] is True


def test_copy_to_clipboard():
    with patch("index.NSPasteboard") as mock_pb_class:
        mock_pb = MagicMock()
        mock_pb_class.generalPasteboard.return_value = mock_pb

        api = API()
        assert api.copy_to_clipboard("new text") is True
        mock_pb.clearContents.assert_called_once()
