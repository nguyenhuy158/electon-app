from src.domain.constants.index import AppConstants


def test_constants_structure():
    assert "UI" in dir(AppConstants)
    assert AppConstants.UI["TITLE"] == "QuickClip Sync"
    assert AppConstants.CLIPBOARD["POLLING_INTERVAL_MS"] == 1000
