from AppKit import NSPasteboard, NSStringPboardType

from application.ports.interfaces import ClipboardService


class MacOSClipboardService(ClipboardService):
    def copy_to_clipboard(self, text: str):
        pb = NSPasteboard.generalPasteboard()
        pb.clearContents()
        pb.setString_forType_(text, NSStringPboardType)
        return True

    def get_clipboard_content(self) -> str:
        pb = NSPasteboard.generalPasteboard()
        return pb.stringForType_(NSStringPboardType)

    def get_change_count(self) -> int:
        pb = NSPasteboard.generalPasteboard()
        return pb.changeCount()
