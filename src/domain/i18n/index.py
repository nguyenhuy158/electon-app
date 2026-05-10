from .en import MESSAGES as EN_MESSAGES
from .vi import MESSAGES as VI_MESSAGES


class I18n:
    def __init__(self, locale="en"):
        self.locale = locale
        self.catalogs = {"en": EN_MESSAGES, "vi": VI_MESSAGES}

    def t(self, key_path):
        keys = key_path.split(".")
        content = self.catalogs.get(self.locale, self.catalogs["en"])
        for k in keys:
            if isinstance(content, dict) and k in content:
                content = content[k]
            else:
                return key_path
        return content


i18n = I18n()
