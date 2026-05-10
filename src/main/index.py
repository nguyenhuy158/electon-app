import json
import os
import sys
import threading
import time

import webview
from AppKit import NSPasteboard, NSStringPboardType
from domain.constants.index import AppConstants


def get_resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), "..", "..", relative_path)


class API:
    def __init__(self):
        self.history = []
        self._load_history()

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
            if text and (not api.history or text != api.history[0]):
                limit = AppConstants.CLIPBOARD["DEFAULT_HISTORY_LIMIT"]
                api.history = [text] + api.history[: limit - 1]
                history_json = json.dumps(api.history)
                window.evaluate_js(
                    f"if (window.onHistoryUpdate) window.onHistoryUpdate({history_json})"
                )
        time.sleep(AppConstants.CLIPBOARD["POLLING_INTERVAL_MS"] / 1000.0)


if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

    api = API()
    index_path = get_resource_path("src/renderer/index.html")
    icon_path = get_resource_path(AppConstants.UI["ICON_PATH"])

    window = webview.create_window(
        AppConstants.UI["TITLE"],
        index_path,
        js_api=api,
        width=AppConstants.UI["WINDOW_WIDTH"],
        height=AppConstants.UI["WINDOW_HEIGHT"],
        resizable=True,
        min_size=(AppConstants.UI["MIN_WIDTH"], AppConstants.UI["MIN_HEIGHT"]),
        icon=icon_path,
    )

    t = threading.Thread(target=monitor_clipboard, args=(window, api), daemon=True)
    t.start()

    webview.start(debug=True)
