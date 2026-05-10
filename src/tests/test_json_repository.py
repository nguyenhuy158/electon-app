import json
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
        history = [Clip(content="clip1"), Clip(content="clip2")]
        repo.save_all(history)

        results = repo.get_all()
        assert len(results) == 2
        assert results[0].content == "clip1"
        assert results[1].content == "clip2"

        with open(storage_file, "r") as f:
            data = json.load(f)
            assert len(data) == 2
            assert data[0]["content"] == "clip1"


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
