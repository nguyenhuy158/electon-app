from .en import MESSAGES as EN_MESSAGES
from .vi import MESSAGES as VI_MESSAGES


class I18n:
    _messages = {"en": EN_MESSAGES, "vi": VI_MESSAGES}
    _current_locale = "en"

    @classmethod
    def set_locale(cls, locale):
        if locale in cls._messages:
            cls._current_locale = locale

    @classmethod
    def get_locale(cls):
        return cls._current_locale

    @classmethod
    def t(cls, key, **kwargs):
        keys = key.split(".")
        value = cls._messages.get(cls._current_locale, {})

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, key)
            else:
                return key

        if isinstance(value, str) and kwargs:
            try:
                return value.format(**kwargs)
            except KeyError:
                return value

        return value if isinstance(value, (str, dict)) else key

    @classmethod
    def get_all_messages(cls):
        return cls._messages.get(cls._current_locale, {})


i18n = I18n
