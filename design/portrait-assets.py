"""Portrait assets for proof-of-work.

  portrait.webp       low-key black-and-white of the cut-out, bottom dissolving out
  portrait-scan.webp  the "mask": an evidence scan of the same face, same frame
  id.webp             head-and-shoulders crop for the credential
  id-scan.webp        the same crop of the scan, for the credential's back
"""
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
im = Image.open(SRC).convert("RGBA")
W, H = im.size
rgba = np.asarray(im).astype(np.float32) / 255.0
rgb, alpha = rgba[..., :3], rgba[..., 3]

# tokens (dark theme)
DATA = np.array([127, 175, 224]) / 255
SEAL = (61, 214, 152)
INK_HI = (230, 237, 246)
INK_MD = (157, 176, 196)
INK_LO = (107, 131, 160)
NIGHT = np.array([11, 17, 27]) / 255

# face landmarks in source pixels (measured on the 1087x1447 original)
EYE_L, EYE_R = (410, 552), (656, 552)
NOSE, MOUTH, CHIN = (528, 700), (528, 812), (528, 975)
FACE_BOX = (232, 330, 852, 1010)

ys = np.linspace(0, 1, H)[:, None]
xs = np.linspace(0, 1, W)[None, :]
# Dissolve the bottom: the jacket fades out over the last ~22% so the
# portrait sits *in* the hero rather than being cropped by it.
bottom_fade = np.clip((0.985 - ys) / 0.22, 0, 1) ** 1.4
bottom_fade = np.broadcast_to(bottom_fade, (H, W))


def save(arr_rgb, a, name, quality=86):
    out = np.dstack([np.clip(arr_rgb, 0, 1), np.clip(a, 0, 1)])
    Image.fromarray((out * 255).astype(np.uint8), "RGBA").save(f"{OUT}/{name}", quality=quality, method=6)


# ── 1. the hero grade: black and white, low-key ─────────────────────────
lum = rgb @ np.array([0.2126, 0.7152, 0.0722])


def mono_grade(l, ceiling, gamma, floor=0.02):
    """Neutral greyscale with a soft highlight shoulder.

    The ceiling is the point: the source is a bright studio photo, and on a
    near-black page its white shirt and lit face were the brightest thing on
    screen — they read as a glow. Rolling highlights off below white keeps
    the portrait inside the page's tonal range (ink, not light source).
    """
    x = np.clip(l, 0, 1) ** gamma
    shoulder = (1 - np.exp(-2.4 * x)) / (1 - np.exp(-2.4))
    return floor + (ceiling - floor) * shoulder


hero = mono_grade(lum, ceiling=0.62, gamma=1.25)
# Fall-off away from the face, so the jacket and shirt sink into the scene
# and the eye lands on the face.
cx, cy = 528 / W, 640 / H
r = np.sqrt(((xs - cx) * W / H) ** 2 + (ys - cy) ** 2)
hero = hero * (1 - 0.42 * np.clip((r - 0.22) / 0.42, 0, 1) ** 1.5)
# Fine grain: a photograph, not a cut-out pasted on a render.
rng = np.random.default_rng(5097)
hero = hero + rng.normal(0, 0.012, hero.shape)
save(np.repeat(hero[..., None], 3, axis=2), alpha * bottom_fade, "portrait.webp")

# ── 2. the evidence scan ────────────────────────────────────────────────
scan = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(scan)
mono = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 15)
mono_lbl = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 17)

# (a) the ground: the silhouette filled in near-black, so the lens shows a
# dark plate with the scan on it, not the temple behind.
ground = (alpha > 0.5).astype(np.uint8)
ground_img = Image.fromarray((ground * 235).astype(np.uint8), "L")
scan.paste(Image.new("RGBA", (W, H), (7, 11, 18, 255)), (0, 0), ground_img)

# (b) glyph field — luminance typeset in the evidence vocabulary
stream = (
    "0.15ms 8/8 23 192,541 0.954 78.17% f99b4b06f16952033b5445bb0682d059 "
    "FOR UPDATE RLS 30min sigma2 trace_pipe 0.66 no gain b06f8b5 "
)
cw, ch = 10, 17
eq = cv2.equalizeHist((lum * 255).astype(np.uint8)).astype(np.float32) / 255
k = 0
for y in range(0, H - ch, ch):
    for x in range(0, W - cw, cw):
        a = alpha[y : y + ch, x : x + cw].mean()
        if a < 0.6:
            continue
        v = eq[y : y + ch, x : x + cw].mean()
        c = stream[k % len(stream)]
        k += 1
        if c == " " or v < 0.22:
            continue
        # Steep curve: the face has to be legible in glyph brightness alone,
        # so skin reads bright, hair and cloth fall away to a few marks.
        o = int(255 * min(1, 0.06 + v ** 2.4 * 1.05) * a)
        col = tuple(int(255 * q) for q in DATA)
        d.text((x, y), c, font=mono, fill=(*col, o))

# (c) contours — the face drawn as a line drawing
gray = cv2.bilateralFilter((lum * 255).astype(np.uint8), 9, 40, 9)
gray = cv2.GaussianBlur(gray, (0, 0), 2.2)
edges = cv2.Canny(gray, 34, 80)
edges[alpha < 0.5] = 0
# Hair is all texture and no structure — keep only its strongest lines,
# so the drawing is the face, not a scribble on top of it.
hair = np.zeros_like(edges)
hair[: FACE_BOX[1] + 90, :] = 1
hair_strong = cv2.Canny(cv2.GaussianBlur(gray, (0, 0), 4), 30, 70)
edges = np.where(hair == 1, hair_strong, edges)
edges[alpha < 0.5] = 0
edges = cv2.dilate(edges, np.ones((2, 2), np.uint8))
edge_layer = Image.new("RGBA", (W, H), (*INK_HI, 0))
edge_layer.putalpha(Image.fromarray((edges * 0.7).astype(np.uint8), "L"))
scan.alpha_composite(edge_layer)

# silhouette outline
sil = cv2.Canny((alpha * 255).astype(np.uint8), 80, 160)
sil = cv2.dilate(sil, np.ones((3, 3), np.uint8))
sil_layer = Image.new("RGBA", (W, H), (*tuple(int(255 * q) for q in DATA), 0))
sil_layer.putalpha(Image.fromarray((sil * 0.9).astype(np.uint8), "L"))
scan.alpha_composite(sil_layer)

d = ImageDraw.Draw(scan)
data_c = tuple(int(255 * q) for q in DATA)


def bracket_box(box, arm, color, width=3):
    x0, y0, x1, y1 = box
    for (cx, cy, sx, sy) in [(x0, y0, 1, 1), (x1, y0, -1, 1), (x1, y1, -1, -1), (x0, y1, 1, -1)]:
        d.line([(cx, cy), (cx + sx * arm, cy)], fill=color, width=width)
        d.line([(cx, cy), (cx, cy + sy * arm)], fill=color, width=width)


def diamond(cx, cy, r, color, filled=True):
    pts = [(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)]
    d.polygon(pts, fill=color if filled else None, outline=color)


# (d) the HUD — landmarks, measurements, verdict
bracket_box(FACE_BOX, 46, (*INK_HI, 230))
for (ex, ey) in (EYE_L, EYE_R):
    d.ellipse([ex - 30, ey - 30, ex + 30, ey + 30], outline=(*data_c, 220), width=2)
    d.line([(ex - 44, ey), (ex - 34, ey)], fill=(*data_c, 220), width=2)
    d.line([(ex + 34, ey), (ex + 44, ey)], fill=(*data_c, 220), width=2)
    d.line([(ex, ey - 44), (ex, ey - 34)], fill=(*data_c, 220), width=2)
    d.line([(ex, ey + 34), (ex, ey + 44)], fill=(*data_c, 220), width=2)
# inter-pupil measurement
ipd_y = EYE_L[1] - 70
d.line([(EYE_L[0], ipd_y), (EYE_R[0], ipd_y)], fill=(*INK_MD, 200), width=2)
for ex in (EYE_L[0], EYE_R[0]):
    d.line([(ex, ipd_y - 8), (ex, ipd_y + 8)], fill=(*INK_MD, 200), width=2)
d.text(((EYE_L[0] + EYE_R[0]) // 2 - 44, ipd_y - 28), f"IPD {EYE_R[0]-EYE_L[0]}px", font=mono_lbl, fill=(*INK_MD, 230))
# midline, dashed
for y in range(EYE_L[1] + 40, CHIN[1], 18):
    d.line([(NOSE[0], y), (NOSE[0], y + 9)], fill=(*INK_LO, 200), width=2)
for (px, py) in (NOSE, MOUTH, CHIN):
    diamond(px, py, 7, (*data_c, 240), filled=False)
# landmark dots along the jaw (sampled from the silhouette of the face box)
for t in np.linspace(0.08, 0.92, 15):
    ang = np.pi * (0.05 + 0.9 * t)
    jx = int(NOSE[0] - np.cos(ang) * 255)
    jy = int(NOSE[1] + 30 + np.sin(ang) * 265)
    d.ellipse([jx - 3, jy - 3, jx + 3, jy + 3], fill=(*data_c, 210))

# labels on dark tabs, so they read over the glyph field
def tab(x, y, text, color, glyph=None):
    tw = d.textlength(text, font=mono_lbl)
    gx = 22 if glyph else 0
    d.rectangle([x - 8, y - 6, x + tw + gx + 8, y + 24], fill=(7, 11, 18, 235), outline=(*INK_LO, 160))
    if glyph:
        diamond(x + 7, y + 10, 7, glyph)
    d.text((x + gx, y), text, font=mono_lbl, fill=color)


tab(FACE_BOX[0], FACE_BOX[1] - 44, "SUBJECT  SOUMYADEB TRIPATHY", (*INK_HI, 245))
tab(FACE_BOX[0], FACE_BOX[3] + 18, "LANDMARKS 68/68", (*INK_MD, 240))
tab(FACE_BOX[2] - 196, FACE_BOX[3] + 18, "MATCH VERIFIED", (*SEAL, 255), glyph=(*SEAL, 255))

scan_np = np.asarray(scan).astype(np.float32) / 255
save(scan_np[..., :3], scan_np[..., 3] * bottom_fade, "portrait-scan.webp")

# ── 3. credential crops (head and shoulders, 4:5) ──────────────────────
crop = (170, 150, 910, 1075)  # x0, y0, x1, y1


def crop_save(src_name, out_name, size=(480, 600)):
    Image.open(f"{OUT}/{src_name}").crop(crop).resize(size, Image.LANCZOS).save(
        f"{OUT}/{out_name}", quality=86, method=6
    )


# The ID photo: the same black and white, a little more open than the hero
# (it sits on a lit card, not in the night scene) but still capped below
# white so it doesn't out-shine the card's own type.
id_mono = mono_grade(lum, ceiling=0.80, gamma=1.15)
save(np.repeat(id_mono[..., None], 3, axis=2), alpha, "id-full.webp")
crop_save("id-full.webp", "id.webp")
crop_save("portrait-scan.webp", "id-scan.webp")
print("ok")
