import struct
import zlib
from pathlib import Path

ROOT = Path("/workspace")
UPLOADS = Path("/home/ubuntu/.cursor/projects/workspace/uploads")


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


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def scene(width, height, sky, ground, accent, horizon, mark):
    def pixel(x, y):
        nx = x / width
        ny = y / height
        if ny < horizon:
            color = mix(sky, mix(sky, (255, 250, 244), 0.35), ny / horizon)
        else:
            color = mix(ground, mix(ground, (30, 30, 28), 0.25), (ny - horizon) / (1 - horizon))
        if mark == "window" and 0.18 < nx < 0.82 and 0.12 < ny < 0.62:
            color = (244, 241, 234) if (int(nx * 18) + int(ny * 22)) % 7 else (226, 220, 208)
        if mark == "cup" and (nx - 0.5) ** 2 / 0.08 + (ny - 0.62) ** 2 / 0.05 < 1:
            color = accent
        if mark == "street" and abs(nx - 0.5) < 0.04 and ny > horizon:
            color = accent
        if mark == "plant" and abs(nx - 0.48) < 0.015 and horizon - 0.28 < ny < horizon:
            color = accent
        if mark == "plant" and (nx - 0.42) ** 2 + (ny - (horizon - 0.2)) ** 2 < 0.02:
            color = accent
        if mark == "notebook" and 0.22 < nx < 0.78 and 0.28 < ny < 0.78:
            color = (248, 246, 240) if int(ny * 40) % 3 else (232, 228, 220)
        if mark == "sky" and abs(ny - horizon) < 0.015:
            color = accent
        return color

    return pixel


scenes = [
    ("01.png", (186, 196, 188), (92, 96, 90), (244, 236, 220), 0.62, "window"),
    ("02.png", (214, 206, 196), (120, 104, 92), (90, 62, 48), 0.7, "cup"),
    ("03.png", (28, 32, 40), (16, 16, 18), (232, 208, 140), 0.58, "street"),
    ("04.png", (232, 228, 216), (168, 164, 150), (62, 96, 70), 0.72, "plant"),
    ("05.png", (196, 188, 176), (120, 112, 100), (40, 40, 38), 0.8, "notebook"),
    ("06.png", (168, 188, 204), (86, 96, 88), (244, 244, 240), 0.66, "sky"),
]

carousel = ROOT / "public" / "carousel"
for name, sky, ground, accent, horizon, mark in scenes:
    write_png(carousel / name, 960, 1200, scene(960, 1200, sky, ground, accent, horizon, mark))


def still(x, y):
    nx = x / 1200
    ny = y / 750
    color = (214, 206, 194) if ny < 0.72 else (126, 116, 104)
    if 0.12 < nx < 0.4 and 0.18 < ny < 0.7:
        color = (236, 232, 224)
    if (nx - 0.68) ** 2 / 0.03 + (ny - 0.58) ** 2 / 0.045 < 1:
        color = (92, 64, 50)
    if 0.46 < nx < 0.84 and 0.34 < ny < 0.42:
        color = (40, 44, 48)
    return color


write_png(ROOT / "public" / "writings" / "demo-still.png", 1200, 750, still)


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

for source, target in (
    ("cat_f819.png", ROOT / "public" / "cat.png"),
    ("cat-dark_ed81.png", ROOT / "public" / "cat-dark.png"),
):
    target.write_bytes((UPLOADS / source).read_bytes())
