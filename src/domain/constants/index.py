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
    }
    STORAGE = {"LOCAL_PATH": "~/.quickclip/clips.json"}
    SHORTCUTS = {"OPEN_PICKER": "<cmd>+<shift>+v", "TOGGLE_PIN": "Control+Enter"}
    SOUND = {"ENABLED": True}
    LOCALE = "en"
    LOGGING = {
        "LOG_FILE": "~/.quickclip/app.log",
        "DEFAULT_LEVEL": "INFO",
        "FORMAT": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    }
