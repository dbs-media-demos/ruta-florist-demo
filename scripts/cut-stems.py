"""Cuts single stems out of the white-wall studio photos for the bouquet builder.

The wall is near-white and evenly lit, so a colour-distance key against the sampled wall colour
gives a clean alpha; colour is then un-mixed from the wall so the stems sit on any background.
Run after fetch-images.py: python scripts/cut-stems.py
"""
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, "..", ".stems")
OUT = os.path.join(HERE, "..", "public", "images", "builder")

# name: (source id, crop box in 2400px-wide source)
CUTS = {
    "sunflower": (6913745, (600, 650, 1650, 1980)),
    "rose-red": (6913742, (850, 950, 1650, 2100)),
    "hydrangea": (6913761, (300, 650, 2000, 2300)),
    "carnation-pink": (6913164, (600, 1100, 1650, 3300)),
    "rose-white": (6913166, (0, 1700, 800, 3550)),
    "gypsophila": (6913166, (1650, 1400, 2400, 2500)),
    "fern": (6913169, (600, 950, 1800, 2900)),
    "eucalyptus": (6913378, (900, 1650, 1550, 3050)),
    "carnation-white": (6913172, (600, 1200, 1500, 2900)),
    "limonium": (6913372, (820, 350, 1550, 1750)),
    "hydrangea-flat": (6913162, (780, 1200, 2050, 2700)),
}


def key(im):
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    # wall colour: median of the crop border
    border = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    # smooth, slowly varying wall: estimate per-pixel background with a big blur of the image
    blur = np.asarray(im.filter(ImageFilter.GaussianBlur(60))).astype(np.float32)
    local_bg = np.where(np.linalg.norm(blur - bg, axis=2, keepdims=True) < 18, blur, bg)
    dist = np.linalg.norm(a - local_bg, axis=2)
    lum_drop = np.clip((local_bg.mean(axis=2) - a.mean(axis=2)), 0, None)
    d = np.maximum(dist, lum_drop * 1.4)
    alpha = np.clip((d - 15) / 40, 0, 1)
    # un-mix wall colour: c = a*fg + (1-a)*bg  ->  fg = (c - (1-a)bg)/a
    al = alpha[..., None]
    fg = np.where(al > 0.02, (a - (1 - al) * local_bg) / np.maximum(al, 0.02), 0)
    fg = np.clip(fg, 0, 255)
    rgba = np.concatenate([fg, (alpha * 255)[..., None]], axis=2).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    # soften the matte edge a hair
    r, g, b, aa = out.split()
    aa = aa.filter(ImageFilter.GaussianBlur(0.8))
    out = Image.merge("RGBA", (r, g, b, aa))
    bbox = aa.point(lambda v: 255 if v > 20 else 0).getbbox()
    return out.crop(bbox) if bbox else out


os.makedirs(OUT, exist_ok=True)
for name, (sid, box) in CUTS.items():
    im = Image.open(os.path.join(SRC, f"{sid}.jpg")).convert("RGB").crop(box)
    cut = key(im)
    if cut.height > 900:
        cut = cut.resize((round(cut.width * 900 / cut.height), 900), Image.LANCZOS)
    cut.save(os.path.join(OUT, f"{name}.webp"), "WEBP", quality=82, method=6)
    print(name, cut.size)
