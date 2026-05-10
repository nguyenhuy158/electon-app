import json
import os
import sys
import threading
import time

# Add src to path to allow imports from any directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import webview
from AppKit import NSApp
from pynput import keyboard

from application.use_cases.clipboard_use_case import ClipboardUseCase

# Hexagonal imports
from domain.constants.index import AppConstants
from infrastructure.adapters.json_repository import JSONClipboardRepository
from infrastructure.adapters.macos_clipboard import MacOSClipboardService


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

    def get_history(self):
        return self.use_case.get_history()

    def copy_to_clipboard(self, text):
        return self.use_case.copy_to_clipboard(text)

    def get_shortcut(self):
        return AppConstants.SHORTCUTS["OPEN_PICKER"]

    def update_shortcut(self, shortcut):
        return {"success": True}

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
            if use_case.add_to_history(text):
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


def setup_global_shortcut(window):
    def on_activate():
        print("🚀 Global Hotkey Activated!")
        try:
            window.show()
            NSApp.activateIgnoringOtherApps_(True)
            window.evaluate_js(
                "if (window.api && window.api.onFocusSearch) window.api.onFocusSearch()"
            )
        except Exception as e:
            print(f"Error activating window: {e}")

    hotkey_str = "<cmd>+<shift>+v"
    print(f"⌨️ Registering global shortcut: {hotkey_str}")

    try:
        listener = keyboard.GlobalHotKeys({hotkey_str: on_activate})
        listener.start()
    except Exception as e:
        print(f"❌ Failed to register hotkey: {e}")


if __name__ == "__main__":
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
        min_size=(AppConstants.UI["MIN_WIDTH"], AppConstants.UI["MIN_HEIGHT"]),
    )
    api.set_window(window)

    t = threading.Thread(target=monitor_clipboard, args=(window, use_case), daemon=True)
    t.start()

    hr = threading.Thread(target=hot_reload, args=(window,), daemon=True)
    hr.start()

    setup_global_shortcut(window)

    webview.start(debug=True)
