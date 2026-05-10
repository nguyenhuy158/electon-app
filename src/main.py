import json
import logging
import os
import sys
import threading
import time

# Add src to path to allow imports from any directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import webview
from AppKit import NSApp, NSUserDefaults
from pynput import keyboard

from application.use_cases.clipboard_use_case import ClipboardUseCase

# Hexagonal imports
from domain.constants.index import AppConstants
from domain.i18n.index import I18n
from infrastructure.adapters.json_repository import JSONClipboardRepository
from infrastructure.adapters.macos_clipboard import MacOSClipboardService

logger = logging.getLogger(__name__)


def get_resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), "..", relative_path)


class API:
    def __init__(self, clipboard_use_case):
        self.use_case = clipboard_use_case
        self._window = None

    def set_window(self, window):
        self._window = window

    def hide(self):
        if self._window:
            self._window.hide()
        return True

    def minimize(self):
        if self._window:
            self._window.minimize()
        return True

    def quit(self):
        if self._window:
            self._window.destroy()
        sys.exit(0)

    def get_history(self):
        return self.use_case.get_history()

    def copy_to_clipboard(self, text):
        return self.use_case.copy_to_clipboard(text)

    def toggle_pin(self, clip_id):
        success = self.use_case.toggle_pin(clip_id)
        if success and self._window:
            history_json = json.dumps(self.use_case.get_history())
            self._window.evaluate_js(
                f"if (window.onHistoryUpdate) window.onHistoryUpdate({history_json})"
            )
        return success

    def get_translations(self):
        return I18n.get_all_messages()

    def get_shortcut(self):
        return {
            "open_picker": AppConstants.SHORTCUTS["OPEN_PICKER"],
            "toggle_pin": AppConstants.SHORTCUTS["TOGGLE_PIN"],
        }

    def update_shortcut(self, data):
        if "open_picker" in data:
            AppConstants.SHORTCUTS["OPEN_PICKER"] = data["open_picker"]
        if "toggle_pin" in data:
            AppConstants.SHORTCUTS["TOGGLE_PIN"] = data["toggle_pin"]
        save_settings()
        return {"success": True}

    def get_settings(self):
        return {
            "sound_enabled": AppConstants.SOUND["ENABLED"],
            "show_stats": AppConstants.UI_SETTINGS["SHOW_STATS"],
            "appearance": AppConstants.UI_SETTINGS.get("APPEARANCE", "system"),
            "cleanup_strategy": AppConstants.CLIPBOARD["CLEANUP_STRATEGY"],
            "cleanup_value": AppConstants.CLIPBOARD["CLEANUP_VALUE"],
            "auto_sync": AppConstants.SYNC["AUTO_SYNC"],
        }

    def update_settings(self, data):
        if "sound_enabled" in data:
            AppConstants.SOUND["ENABLED"] = data["sound_enabled"]
        if "show_stats" in data:
            AppConstants.UI_SETTINGS["SHOW_STATS"] = data["show_stats"]
        if "appearance" in data:
            AppConstants.UI_SETTINGS["APPEARANCE"] = data["appearance"]
        if "cleanup_strategy" in data:
            AppConstants.CLIPBOARD["CLEANUP_STRATEGY"] = data["cleanup_strategy"]
        if "cleanup_value" in data:
            try:
                AppConstants.CLIPBOARD["CLEANUP_VALUE"] = int(data["cleanup_value"])
            except ValueError:
                pass
        if "auto_sync" in data:
            AppConstants.SYNC["AUTO_SYNC"] = data["auto_sync"]

        save_settings()
        return {"success": True}


    def get_system_appearance(self):
        defaults = NSUserDefaults.standardUserDefaults()
        style = defaults.stringForKey_("AppleInterfaceStyle")
        return "dark" if style == "Dark" else "light"


    def force_sync(self):
        success = self.use_case.sync()
        return {"success": success, "last_sync_time": self.use_case.last_sync_time}

    def get_last_sync_time(self):
        return self.use_case.last_sync_time

    def login(self, data):
        return {"success": True, "user": {"email": data["email"]}}

    def register(self, data):
        return {"success": True, "user": {"email": data["email"]}}

    def logout(self):
        return True


def monitor_clipboard(window, use_case):
    clipboard_service = MacOSClipboardService()
    last_count = clipboard_service.get_change_count()

    while True:
        current_count = clipboard_service.get_change_count()
        if current_count != last_count:
            last_count = current_count
            text = clipboard_service.get_clipboard_content()
            source_app = clipboard_service.get_active_app()
            logger.debug(
                f"Clipboard change detected from {source_app}: {len(text) if text else 0} chars"
            )
            if use_case.add_to_history(text, source_app):
                history_json = json.dumps(use_case.get_history())
                window.evaluate_js(
                    f"if (window.onHistoryUpdate) window.onHistoryUpdate({history_json})"
                )
        time.sleep(AppConstants.CLIPBOARD["POLLING_INTERVAL_MS"] / 1000.0)


def hot_reload(window):
    files_to_watch = [
        os.path.join(os.path.dirname(__file__), "renderer", "index.html"),
        os.path.join(os.path.dirname(__file__), "renderer", "styles.css"),
    ]
    last_mtimes = {f: os.path.getmtime(f) for f in files_to_watch if os.path.exists(f)}

    while True:
        time.sleep(0.5)
        for f in files_to_watch:
            if os.path.exists(f):
                mtime = os.path.getmtime(f)
                if mtime > last_mtimes.get(f, 0):
                    last_mtimes[f] = mtime
                    window.evaluate_js("location.reload()")


def auto_sync_task(window, use_case):
    while True:
        try:
            if AppConstants.SYNC["AUTO_SYNC"]:
                logger.info("Auto-syncing...")
                if use_case.sync():
                    last_sync = use_case.last_sync_time
                    last_sync_js = last_sync if last_sync is not None else "null"
                    js = f"if (window.onSyncComplete) window.onSyncComplete({last_sync_js})"
                    window.evaluate_js(js)
        except Exception as e:
            logger.error(f"Error in auto-sync task: {e}")
        time.sleep(AppConstants.SYNC["INTERVAL_SECONDS"])


def setup_global_shortcut(window):
    def on_activate():
        logger.info("Global Hotkey Activated")
        try:
            window.show()
            NSApp.activateIgnoringOtherApps_(True)
            window.evaluate_js(
                "if (window.api && window.api.onFocusSearch) window.api.onFocusSearch()"
            )
        except Exception as e:
            logger.error(f"Error activating window: {e}")

    hotkey_str = AppConstants.SHORTCUTS["OPEN_PICKER"]
    logger.info(f"Registering global shortcut: {hotkey_str}")

    try:
        listener = keyboard.GlobalHotKeys({hotkey_str: on_activate})
        listener.start()
    except Exception as e:
        logger.error(f"Failed to register hotkey: {e}")


def save_settings():
    path = os.path.expanduser(AppConstants.STORAGE["SETTINGS_PATH"])
    try:
        settings = {
            "sound_enabled": AppConstants.SOUND["ENABLED"],
            "show_stats": AppConstants.UI_SETTINGS["SHOW_STATS"],
            "appearance": AppConstants.UI_SETTINGS["APPEARANCE"],
            "cleanup_strategy": AppConstants.CLIPBOARD["CLEANUP_STRATEGY"],
            "cleanup_value": AppConstants.CLIPBOARD["CLEANUP_VALUE"],
            "shortcuts": AppConstants.SHORTCUTS,
            "auto_sync": AppConstants.SYNC["AUTO_SYNC"],
        }

        with open(path, "w") as f:
            json.dump(settings, f)
    except Exception as e:
        logger.error(f"Error saving settings: {e}")


def load_settings():
    path = os.path.expanduser(AppConstants.STORAGE["SETTINGS_PATH"])
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                settings = json.load(f)
                if "sound_enabled" in settings:
                    AppConstants.SOUND["ENABLED"] = settings["sound_enabled"]
                if "show_stats" in settings:
                    AppConstants.UI_SETTINGS["SHOW_STATS"] = settings["show_stats"]
                if "appearance" in settings:
                    AppConstants.UI_SETTINGS["APPEARANCE"] = settings["appearance"]
                if "cleanup_strategy" in settings:
                    AppConstants.CLIPBOARD["CLEANUP_STRATEGY"] = settings["cleanup_strategy"]
                if "cleanup_value" in settings:
                    AppConstants.CLIPBOARD["CLEANUP_VALUE"] = settings["cleanup_value"]
                if "auto_sync" in settings:
                    AppConstants.SYNC["AUTO_SYNC"] = settings["auto_sync"]
                if "shortcuts" in settings:
                    AppConstants.SHORTCUTS.update(settings["shortcuts"])
        except Exception as e:
            logger.error(f"Error loading settings: {e}")


if __name__ == "__main__":
    # Setup Logging
    log_file = os.path.expanduser(AppConstants.LOGGING["LOG_FILE"])
    log_dir = os.path.dirname(log_file)
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    log_level = os.environ.get("QUICKCLIP_LOG_LEVEL", AppConstants.LOGGING["DEFAULT_LEVEL"])
    logging.basicConfig(
        level=log_level,
        format=AppConstants.LOGGING["FORMAT"],
        handlers=[logging.FileHandler(log_file), logging.StreamHandler(sys.stdout)],
    )
    logger.info(f"Starting QuickClip with log level: {log_level}")

    # Load persisted settings
    load_settings()

    # Dependency Injection
    clipboard_service = MacOSClipboardService()
    clipboard_repository = JSONClipboardRepository()
    use_case = ClipboardUseCase(clipboard_service, clipboard_repository)
    api = API(use_case)

    index_path = get_resource_path("src/renderer/index.html")

    window = webview.create_window(
        AppConstants.UI["TITLE"],
        index_path,
        js_api=api,
        width=AppConstants.UI["WINDOW_WIDTH"],
        height=AppConstants.UI["WINDOW_HEIGHT"],
        resizable=True,
        frameless=True,
        easy_drag=True,
        min_size=(AppConstants.UI["MIN_WIDTH"], AppConstants.UI["MIN_HEIGHT"]),
    )
    api.set_window(window)

    t = threading.Thread(target=monitor_clipboard, args=(window, use_case), daemon=True)
    t.start()

    sync_t = threading.Thread(target=auto_sync_task, args=(window, use_case), daemon=True)
    sync_t.start()

    hr = threading.Thread(target=hot_reload, args=(window,), daemon=True)
    hr.start()

    setup_global_shortcut(window)

    webview.start(debug=True)
