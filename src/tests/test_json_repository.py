import os
from unittest.mock import patch

from domain.models.clip import Clip
from infrastructure.adapters.json_repository import JSONClipboardRepository


def test_json_repository_initialization(tmp_path):
    storage_file = tmp_path / "subdir" / "clips.json"
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        JSONClipboardRepository()
        assert os.path.exists(os.path.dirname(str(storage_file)))


def test_save_all_and_get_all(tmp_path):
    storage_file = tmp_path / "clips.json"
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        assert repo.get_all() == []


def test_save_all_exception(tmp_path):
    storage_file = tmp_path / "clips.json"
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        # Mocking open to raise an exception
        with patch("builtins.open", side_effect=Exception("Failed to open")):
            # Should not raise exception but log error
            repo.save_all([Clip(content="test")])


def test_get_all_not_a_list(tmp_path):
    storage_file = tmp_path / "not_a_list.json"
    storage_file.write_text('{"not": "a list"}')
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        assert repo.get_all() == []


def test_get_all_corrupted_file(tmp_path):
    storage_file = tmp_path / "corrupted.json"
    storage_file.write_text("invalid json")
    with patch("domain.constants.index.AppConstants.STORAGE", {"LOCAL_PATH": str(storage_file)}):
        repo = JSONClipboardRepository()
        assert repo.get_all() == []
