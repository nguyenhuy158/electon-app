from src.domain.models.clip import Clip


def test_clip_from_dict_string_migration():
    content = "test content"
    clip = Clip.from_dict(content)
    assert isinstance(clip, Clip)
    assert clip.content == content
    assert clip.id is not None
    assert clip.is_pinned is False


def test_clip_from_dict_full():
    data = {
        "id": "123",
        "content": "test content",
        "is_pinned": True,
        "timestamp": 123456789.0,
        "source_app": "Finder",
    }
    clip = Clip.from_dict(data)
    assert clip.id == "123"
    assert clip.content == "test content"
    assert clip.is_pinned is True
    assert clip.timestamp == 123456789.0
    assert clip.source_app == "Finder"


def test_clip_to_dict():
    clip = Clip(
        content="test content", id="123", is_pinned=True, timestamp=123456789.0, source_app="Safari"
    )
    data = clip.to_dict()
    assert data == {
        "id": "123",
        "content": "test content",
        "is_pinned": True,
        "timestamp": 123456789.0,
        "source_app": "Safari",
    }
