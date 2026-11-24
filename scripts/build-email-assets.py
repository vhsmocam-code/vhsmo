#!/usr/bin/env python3
"""
Builds the images the transactional emails use, into public/email/:

  van.gif            looping line-drawn delivery van (order confirmation)
  icon-*.png         four footer tile icons
  product-*.png      product photos per colour (PNG: Outlook can't show WebP)

Run from the repo root:  python3 scripts/build-email-assets.py
Everything is drawn at 3-4x and downsampled, so lines stay smooth.
"""
import math
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "email")
INK = (42, 36, 34)  # brand darkroom #2a2422
WHITE = (255, 255, 255)

os.makedirs(OUT, exist_ok=True)


# ── Delivery van animation ──────────────────────────────────────────────────

W, H = 600, 150          # 2x of the 300x75 shown in the email
SS = 3                   # supersampling factor
FRAMES = 24
SHIFT = 25               # px the scenery moves per frame (24 * 25 = 600, seamless)


def s(v):
    return int(round(v * SS))


def draw_tree(d, x, ground):
    # trunk + lollipop crown
    d.line([(s(x), s(ground)), (s(x), s(ground - 22))], fill=INK, width=s(3))
    d.ellipse([s(x - 11), s(ground - 50), s(x + 11), s(ground - 18)],
              fill=WHITE, outline=INK, width=s(3))


def van_frame(i):
    img = Image.new("RGB", (W * SS, H * SS), WHITE)
    d = ImageDraw.Draw(img)
    ground = 128
    offset = i * SHIFT

    # scenery: trees scroll left, wrapping every 600px
    for tx in (70, 205, 395, 520):
        x = (tx - offset) % W
        for xx in (x - W, x, x + W):
            if -20 <= xx <= W + 20:
                draw_tree(d, xx, ground)

    # ground line and moving road dashes
    d.line([(s(10), s(ground)), (s(W - 10), s(ground))], fill=INK, width=s(3))
    for k in range(0, W + 40, 40):
        x = (k - offset) % (W + 40) - 20
        d.line([(s(x), s(ground + 10)), (s(x + 14), s(ground + 10))], fill=INK, width=s(3))

    # van (subtle bounce)
    by = -1 if (i // 3) % 2 else 0
    vx = 300
    # cargo box
    d.rounded_rectangle([s(vx - 66), s(78 + by), s(vx + 30), s(120 + by)],
                        radius=s(6), fill=WHITE, outline=INK, width=s(3))
    # side logo: arrow in a box
    d.rounded_rectangle([s(vx - 34), s(88 + by), s(vx - 4), s(110 + by)],
                        radius=s(3), outline=INK, width=s(2))
    d.line([(s(vx - 27), s(99 + by)), (s(vx - 11), s(99 + by))], fill=INK, width=s(2))
    d.line([(s(vx - 16), s(94 + by)), (s(vx - 11), s(99 + by)), (s(vx - 16), s(104 + by))],
           fill=INK, width=s(2), joint="curve")
    # cab
    cab = [(vx + 30, 90), (vx + 50, 90), (vx + 66, 106), (vx + 66, 120), (vx + 30, 120)]
    d.polygon([(s(x), s(y + by)) for x, y in cab], fill=WHITE, outline=INK, width=s(3))
    win = [(vx + 36, 96), (vx + 48, 96), (vx + 58, 106), (vx + 36, 106)]
    d.polygon([(s(x), s(y + by)) for x, y in win], outline=INK, width=s(2))
    # speed lines behind the van
    lengths = (16, 24, 12) if i % 2 else (22, 14, 18)
    for (yy, ln) in zip((86, 99, 112), lengths):
        d.line([(s(vx - 74 - ln), s(yy + by)), (s(vx - 74), s(yy + by))], fill=INK, width=s(3))
    # wheels with a turning spoke
    angle = i * (2 * math.pi / FRAMES) * 4
    for cx in (vx - 44, vx + 44):
        cy = 122
        d.ellipse([s(cx - 9), s(cy - 9), s(cx + 9), s(cy + 9)], fill=WHITE, outline=INK, width=s(3))
        dx, dy = math.cos(angle) * 6, math.sin(angle) * 6
        d.line([(s(cx - dx), s(cy - dy)), (s(cx + dx), s(cy + dy))], fill=INK, width=s(2))

    return img.resize((W, H), Image.LANCZOS)


def build_van():
    # one fixed palette (white → ink) for every frame, so nothing flickers
    levels = 16
    pal = []
    for k in range(levels):
        t = k / (levels - 1)
        pal += [round(WHITE[c] + (INK[c] - WHITE[c]) * t) for c in range(3)]
    pal += [0, 0, 0] * (256 - levels)
    pal_img = Image.new("P", (1, 1))
    pal_img.putpalette(pal)

    frames = [van_frame(i).quantize(palette=pal_img, dither=Image.Dither.NONE) for i in range(FRAMES)]
    path = os.path.join(OUT, "van.gif")
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=60,
                   loop=0, optimize=True, disposal=1)
    return path


# ── Footer icons (96x96, shown at 48) ───────────────────────────────────────

IS = 4  # supersampling


def icon_canvas():
    img = Image.new("RGB", (96 * IS, 96 * IS), WHITE)
    return img, ImageDraw.Draw(img)


def p(v):
    return int(round(v * IS))


def finish(img, name):
    path = os.path.join(OUT, name)
    img.resize((96, 96), Image.LANCZOS).save(path, optimize=True)
    return path


def icon_dispatch():  # clock
    img, d = icon_canvas()
    d.ellipse([p(14), p(14), p(82), p(82)], outline=INK, width=p(5))
    d.line([(p(48), p(48)), (p(48), p(28))], fill=INK, width=p(5))
    d.line([(p(48), p(48)), (p(62), p(56))], fill=INK, width=p(5))
    d.ellipse([p(45), p(45), p(51), p(51)], fill=INK)
    return finish(img, "icon-dispatch.png")


def icon_shipping():  # truck
    img, d = icon_canvas()
    d.rounded_rectangle([p(10), p(28), p(58), p(64)], radius=p(4), outline=INK, width=p(5))
    d.polygon([(p(58), p(40)), (p(72), p(40)), (p(86), p(54)), (p(86), p(64)), (p(58), p(64))],
              outline=INK, width=p(5))
    for cx in (28, 70):
        d.ellipse([p(cx - 9), p(61), p(cx + 9), p(79)], fill=WHITE, outline=INK, width=p(5))
    return finish(img, "icon-shipping.png")


def icon_warranty():  # shield with a tick
    img, d = icon_canvas()
    shield = [(48, 10), (78, 21), (76, 50), (48, 84), (20, 50), (18, 21)]
    d.polygon([(p(x), p(y)) for x, y in shield], outline=INK, width=p(5))
    d.line([(p(34), p(47)), (p(45), p(58)), (p(63), p(37))], fill=INK, width=p(5), joint="curve")
    return finish(img, "icon-warranty.png")


def icon_support():  # headset
    img, d = icon_canvas()
    d.arc([p(16), p(16), p(80), p(80)], start=180, end=360, fill=INK, width=p(5))
    d.rounded_rectangle([p(12), p(46), p(28), p(70)], radius=p(5), outline=INK, width=p(5))
    d.rounded_rectangle([p(68), p(46), p(84), p(70)], radius=p(5), outline=INK, width=p(5))
    d.line([(p(76), p(70)), (p(76), p(78)), (p(60), p(84))], fill=INK, width=p(5), joint="curve")
    d.ellipse([p(52), p(80), p(60), p(88)], fill=INK)
    return finish(img, "icon-support.png")


# ── Product photos (240x240, shown at 64) ───────────────────────────────────

def build_product(src_name, out_name):
    src = Image.open(os.path.join(ROOT, "public", "buyproduct", src_name)).convert("RGBA")
    src.thumbnail((220, 220), Image.LANCZOS)
    canvas = Image.new("RGBA", (240, 240), WHITE + (255,))
    canvas.alpha_composite(src, ((240 - src.width) // 2, (240 - src.height) // 2))
    path = os.path.join(OUT, out_name)
    canvas.convert("RGB").save(path, optimize=True)
    return path


if __name__ == "__main__":
    built = [
        build_van(),
        icon_dispatch(), icon_shipping(), icon_warranty(), icon_support(),
        build_product("pinkFront.webp", "product-pink.png"),
        build_product("redFront.webp", "product-red.png"),
        build_product("blackFront.webp", "product-black.png"),
    ]
    for path in built:
        print(f"{os.path.getsize(path) // 1024:>4} KB  {os.path.relpath(path, ROOT)}")
