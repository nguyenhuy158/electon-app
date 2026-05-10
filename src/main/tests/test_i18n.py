from domain.i18n.index import i18n


def test_i18n_translation():
    assert i18n.t("APP.NAME") == "QuickClip"


def test_i18n_fallback():
    assert i18n.t("NON_EXISTENT.KEY") == "NON_EXISTENT.KEY"
