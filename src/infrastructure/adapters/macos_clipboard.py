import logging

from AppKit import NSPasteboard, NSSound, NSStringPboardType, NSWorkspace

from application.ports.interfaces import ClipboardService
from domain.constants.index import AppConstants

logger = logging.getLogger(__name__)


class MacOSClipboardService(ClipboardService):
    def copy_to_clipboard(self, text: str):
        pb = NSPasteboard.generalPasteboard()
        pb.clearContents()
        pb.setString_forType_(text, NSStringPboardType)

        if AppConstants.SOUND["ENABLED"]:
            sound = NSSound.soundNamed_("Tink")
            if sound:
                sound.play()

        return True

    def get_clipboard_content(self) -> str:
        pb = NSPasteboard.generalPasteboard()
        return pb.stringForType_(NSStringPboardType)

    def get_active_app(self) -> str:
        workspace = NSWorkspace.sharedWorkspace()
        active_app = workspace.frontmostApplication()
        if active_app:
            return active_app.localizedName()
        return "Unknown"

    def get_change_count(self) -> int:
        pb = NSPasteboard.generalPasteboard()
        return pb.changeCount()
