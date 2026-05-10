import webview
import threading
import time
import os
import sys
import json
from AppKit import NSPasteboard, NSStringPboardType

from domain.constants.index import AppConstants
from domain.i18n.index import i18n

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', '..', relative_path)

class API:
    def __init__(self):
        self.history = []
        self._load_local_history()

    def _load_local_history(self):
        path = os.path.expanduser(AppConstants.STORAGE["LOCAL_PATH"])
        if not os.path.exists(os.path.dirname(path)):
            os.makedirs(os.path.dirname(path))
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    self.history = json.load(f)
            except:
                self.history = []

    def getHistory(self):
        return self.history

    def copyToClipboard(self, text):
        pb = NSPasteboard.generalPasteboard()
        pb.clearContents()
        pb.setString_forType_(text, NSStringPboardType)
        return True

    def getShortcut(self):
        return AppConstants.SHORTCUTS["OPEN_PICKER"]

    def updateShortcut(self, shortcut):
        return {"success": True}

    def login(self, data):
        return {"success": True, "user": {"email": data['email']}}

    def register(self, data):
        return {"success": True, "user": {"email": data['email']}}

    def logout(self):
        return True

def monitor_clipboard(window, api):
    pb = NSPasteboard.generalPasteboard()
    last_count = pb.changeCount()
    
    while True:
        current_count = pb.changeCount()
        if current_count != last_count:
            last_count = current_count
            text = pb.stringForType_(NSStringPboardType)
            if text and (not api.history or text != api.history[0]):
                api.history = [text] + api.history[:AppConstants.CLIPBOARD["DEFAULT_HISTORY_LIMIT"]-1]
                window.evaluate_js(f"if (window.onHistoryUpdate) window.onHistoryUpdate({json.dumps(api.history)})")
        time.sleep(AppConstants.CLIPBOARD["POLLING_INTERVAL_MS"] / 1000.0)

if __name__ == '__main__':
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    api = API()
    index_path = get_resource_path('src/renderer/index.html')
    
    window = webview.create_window(
        AppConstants.UI["TITLE"], 
        index_path, 
        js_api=api,
        width=AppConstants.UI["WINDOW_WIDTH"],
        height=AppConstants.UI["WINDOW_HEIGHT"],
        resizable=True,
        min_size=(AppConstants.UI["MIN_WIDTH"], AppConstants.UI["MIN_HEIGHT"])
    )
    
    t = threading.Thread(target=monitor_clipboard, args=(window, api), daemon=True)
    t.start()
    
    webview.start(debug=True)
