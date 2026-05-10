import json
import os
import sys
import threading
import time

import webview
from AppKit import NSApp, NSPasteboard, NSStringPboardType
from domain.constants.index import AppConstants
from pynput import keyboard


def get_resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), "..", "..", relative_path)


class API:
    def __init__(self):
        self.history = []
        self._window = None
        self._load_history()

    def set_window(self, window):
        self._window = window

    def hide(self):
        if self._window:
            self._window.hide()
        return True

    def _load_history(self):
        path = os.path.expanduser(AppConstants.STORAGE["LOCAL_PATH"])
        if not os.path.exists(os.path.dirname(path)):
            os.makedirs(os.path.dirname(path))  # pragma: no cover
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    self.history = json.load(f)
            except Exception:
                self.history = []

    def _save_history(self):
        path = os.path.expanduser(AppConstants.STORAGE["LOCAL_PATH"])
        try:
            with open(path, "w") as f:
                json.dump(self.history, f)
        except Exception as e:
            print(f"Error saving history: {e}")

    def get_history(self):
        return self.history

    def copy_to_clipboard(self, text):
        pb = NSPasteboard.generalPasteboard()
        pb.clearContents()
        pb.setString_forType_(text, NSStringPboardType)  # pragma: no cover
        return True

    def get_shortcut(self):
        return AppConstants.SHORTCUTS["OPEN_PICKER"]

    def update_shortcut(self, shortcut):  # pragma: no cover
        return {"success": True}

    def login(self, data):  # pragma: no cover
        return {"success": True, "user": {"email": data["email"]}}

    def register(self, data):  # pragma: no cover
        return {"success": True, "user": {"email": data["email"]}}

    def logout(self):  # pragma: no cover
        return True


def monitor_clipboard(window, api):  # pragma: no cover
    pb = NSPasteboard.generalPasteboard()
    last_count = pb.changeCount()

    while True:
        current_count = pb.changeCount()
        if current_count != last_count:
            last_count = current_count
            text = pb.stringForType_(NSStringPboardType)
            # Ensure text is a valid non-empty string
            if text and isinstance(text, str) and (not api.history or text != api.history[0]):
                limit = AppConstants.CLIPBOARD["DEFAULT_HISTORY_LIMIT"]
                api.history = [text] + api.history[: limit - 1]
                api._save_history()  # Persistence
                history_json = json.dumps(api.history)
                window.evaluate_js(
                    f"if (window.onHistoryUpdate) window.onHistoryUpdate({history_json})"
                )
        time.sleep(AppConstants.CLIPBOARD["POLLING_INTERVAL_MS"] / 1000.0)


def hot_reload(window):  # pragma: no cover
    """Simple file watcher for hot reloading in development"""
    files_to_watch = [
        os.path.join(os.path.dirname(__file__), "..", "renderer", "index.html"),
        os.path.join(os.path.dirname(__file__), "..", "renderer", "styles.css"),
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


def setup_global_shortcut(window):  # pragma: no cover
    def on_activate():
        print("🚀 Global Hotkey Activated!")
        try:
            window.show()
            # Bring app to front on macOS
            NSApp.activateIgnoringOtherApps_(True)
            # Focus search bar
            window.evaluate_js(
                "if (window.api && window.api.onFocusSearch) window.api.onFocusSearch()"
            )
        except Exception as e:
            print(f"Error activating window: {e}")

    # Standard macOS mapping for Command+Shift+V
    # pynput hotkey format: <cmd>+<shift>+v
    hotkey_str = "<cmd>+<shift>+v"

    print(f"⌨️ Registering global shortcut: {hotkey_str}")

    try:
        # We use a non-blocking listener
        listener = keyboard.GlobalHotKeys({hotkey_str: on_activate})
        listener.start()
    except Exception as e:
        print(f"❌ Failed to register hotkey: {e}")


if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

    api = API()
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

    t = threading.Thread(target=monitor_clipboard, args=(window, api), daemon=True)
    t.start()

    # Start hot reload thread in debug mode
    hr = threading.Thread(target=hot_reload, args=(window,), daemon=True)
    hr.start()

    # Setup global shortcut
    setup_global_shortcut(window)

    webview.start(debug=True)
