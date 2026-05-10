import time
import uuid
from dataclasses import dataclass, field


@dataclass
class Clip:
    content: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    is_pinned: bool = False
    timestamp: float = field(default_factory=time.time)
    source_app: str = "Unknown"

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "is_pinned": self.is_pinned,
            "timestamp": self.timestamp,
            "source_app": self.source_app,
        }

    @staticmethod
    def from_dict(data):
        # Handle migration from old string-only format
        if isinstance(data, str):
            return Clip(content=data)
        return Clip(
            id=data.get("id", str(uuid.uuid4())),
            content=data.get("content", ""),
            is_pinned=data.get("is_pinned", False),
            timestamp=data.get("timestamp", time.time()),
            source_app=data.get("source_app", "Unknown"),
        )
