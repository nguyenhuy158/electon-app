import json
import os
from unittest.mock import patch
from infrastructure.adapters.json_repository import JSONClipboardRepository


def test_json_repository_initialization(tmp_path):
    storage_file = tmp_path / "subdir" / "clips.json"
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        assert os.path.exists(os.path.dirname(str(storage_file)))


def test_save_all_and_get_all(tmp_path):
    storage_file = tmp_path / "clips.json"
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        history = ["clip1", "clip2"]
        repo.save_all(history)

        assert repo.get_all() == history

        with open(storage_file, "r") as f:
            data = json.load(f)
            assert data == history


def test_get_all_no_file(tmp_path):
    storage_file = tmp_path / "non_existent.json"
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        assert repo.get_all() == []


def test_get_all_corrupted_file(tmp_path):
    storage_file = tmp_path / "corrupted.json"
    storage_file.write_text("invalid json")
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        assert repo.get_all() == []
