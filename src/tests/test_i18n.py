from src.domain.i18n.index import i18n


def test_i18n_translation():
    assert i18n.t("APP.NAME") == "QuickClip"
    assert i18n.t("SETTINGS.TITLE") == "Settings"


def test_i18n_interpolation():
    assert i18n.t("SETTINGS.ERROR", error="test error") == "Error: test error"


def test_i18n_locale_switch():
    i18n.set_locale("vi")
    assert i18n.t("SETTINGS.TITLE") == "Cài đặt"
    i18n.set_locale("en")
    assert i18n.t("SETTINGS.TITLE") == "Settings"


def test_i18n_fallback():
    assert i18n.t("NON_EXISTENT.KEY") == "NON_EXISTENT.KEY"
