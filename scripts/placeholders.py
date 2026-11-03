import struct
import zlib
from pathlib import Path

ROOT = Path("/workspace")


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, width: int, height: int, pixel) -> None:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixel(x, y))
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def avatar(x, y):
    cx = cy = 128
    if (x - cx) ** 2 + (y - cy) ** 2 > 118**2:
        return (244, 244, 242)
    ink = (244, 241, 232)
    if 58 < x < 76 and 76 < y < 180:
        return ink
    if 58 < x < 122 and 76 < y < 96:
        return ink
    if 58 < x < 122 and 160 < y < 180:
        return ink
    if 146 < x < 164 and 76 < y < 180:
        return ink
    if 146 < x < 210 and 160 < y < 180:
        return ink
    return (28, 28, 26)


write_png(ROOT / "public" / "avatar.png", 256, 256, avatar)


def icon(size, x, y):
    color = (244, 241, 232)
    if size * 0.28 < x < size * 0.48 and size * 0.22 < y < size * 0.78:
        if not (size * 0.36 < x < size * 0.48 and size * 0.34 < y < size * 0.66):
            color = (28, 28, 26)
    return color


write_png(ROOT / "app" / "icon.png", 32, 32, lambda x, y: icon(32, x, y))
write_png(ROOT / "app" / "apple-icon.png", 180, 180, lambda x, y: icon(180, x, y))
