class AppConstants:
    UI = {
        "WINDOW_WIDTH": 400,
        "WINDOW_HEIGHT": 600,
        "TITLE": "QuickClip Sync",
        "MIN_WIDTH": 300,
        "MIN_HEIGHT": 400,
        "TRAY_ICON_PATH": "src/assets/tray-icon.svg",
    }
    CLIPBOARD = {
        "POLLING_INTERVAL_MS": 1000,
        "DEFAULT_HISTORY_LIMIT": 20,
        "MONITOR_INTERVAL": 1.0,
        "CLEANUP_STRATEGY": "limit",  # 'limit' or 'days'
        "CLEANUP_VALUE": 100,
    }
    STORAGE = {
        "LOCAL_PATH": "~/.quickclip/clips.json",
        "SETTINGS_PATH": "~/.quickclip/settings.json",
    }
    SYNC = {
        "AUTO_SYNC": True,
        "INTERVAL_SECONDS": 300,  # 5 minutes
    }
    SHORTCUTS = {"OPEN_PICKER": "<cmd>+<shift>+v", "TOGGLE_PIN": "Control+Enter"}
    SOUND = {"ENABLED": True}
    UI_SETTINGS = {"SHOW_STATS": True}
    LOCALE = "en"
    LOGGING = {
        "LOG_FILE": "~/.quickclip/app.log",
        "DEFAULT_LEVEL": "INFO",
        "FORMAT": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    }
