#!/usr/bin/env python3
"""
Builds the images the transactional emails use, into public/email/:

  van.gif            looping line-drawn delivery van (order confirmation)
  icon-*.png         four footer tile icons
  product-*.png      product photos per colour (PNG: Outlook can't show WebP)

Run from the repo root:  python3 scripts/build-email-assets.py
Everything is drawn at 3-4x and downsampled, so lines stay smooth.

Dark mode: Gmail's phone apps recolour an email's backgrounds and text but not
its images, so every image here is self-contained and looks the same on a light
or a dark page: the van and the icons sit on the brand dark brown, and the
photos fill their square (no white padding).
"""
import math
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "email")
DARK = (42, 36, 34)       # brand darkroom #2a2422 (same as the email header strip)
CREAM = (244, 239, 230)   # #f4efe6, line colour on the dark cards
YELLOW = (250, 226, 52)   # brand yellow, accents
INK = CREAM               # the van is drawn in cream on dark
WHITE = DARK              # "paper" for the van drawing is the dark card

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
                        radius=s(3), outline=YELLOW, width=s(2))
    d.line([(s(vx - 27), s(99 + by)), (s(vx - 11), s(99 + by))], fill=YELLOW, width=s(2))
    d.line([(s(vx - 16), s(94 + by)), (s(vx - 11), s(99 + by)), (s(vx - 16), s(104 + by))],
           fill=YELLOW, width=s(2), joint="curve")
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

    frame = img.resize((W, H), Image.LANCZOS)
    # The drawing spans roughly y 78-142; lift it 30px so it sits centred in the card.
    lift = 30
    centred = Image.new("RGB", (W, H), WHITE)
    centred.paste(frame.crop((0, lift, W, H)), (0, 0))
    return centred


def build_van():
    # one fixed palette (white → ink) for every frame, so nothing flickers
    levels = 16
    pal = []
    for target in (CREAM, YELLOW):
        for k in range(levels):
            t = k / (levels - 1)
            pal += [round(DARK[c] + (target[c] - DARK[c]) * t) for c in range(3)]
    pal += [0, 0, 0] * (256 - 2 * levels)
    pal_img = Image.new("P", (1, 1))
    pal_img.putpalette(pal)

    frames = [van_frame(i).quantize(palette=pal_img, dither=Image.Dither.NONE) for i in range(FRAMES)]
    path = os.path.join(OUT, "van.gif")
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=60,
                   loop=0, optimize=True, disposal=1)
    return path


# ── Footer icons (96x96 dark round badges, shown at 44) ─────────────────────

IS = 4          # supersampling
GLYPH = 0.6     # glyph size relative to the badge


def icon_canvas():
    """A transparent canvas to draw one glyph on, in the old 96-unit coordinates."""
    img = Image.new("RGBA", (96 * IS, 96 * IS), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def p(v):
    return int(round(v * IS))


def finish(glyph, name):
    """Dark circle + the glyph scaled into its middle; transparent outside the circle."""
    size = 96 * IS
    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(badge).ellipse([0, 0, size - 1, size - 1], fill=DARK + (255,))
    g = glyph.resize((int(size * GLYPH), int(size * GLYPH)), Image.LANCZOS)
    badge.alpha_composite(g, ((size - g.width) // 2, (size - g.height) // 2))
    path = os.path.join(OUT, name)
    badge.resize((96, 96), Image.LANCZOS).save(path, optimize=True)
    return path


GL = YELLOW + (255,)
HOLE = DARK + (255,)   # fills that must hide lines behind them (truck wheels)


def icon_dispatch():  # clock
    img, d = icon_canvas()
    d.ellipse([p(10), p(10), p(86), p(86)], outline=GL, width=p(7))
    d.line([(p(48), p(48)), (p(48), p(26))], fill=GL, width=p(7))
    d.line([(p(48), p(48)), (p(64), p(57))], fill=GL, width=p(7))
    return finish(img, "icon-dispatch.png")


def icon_shipping():  # truck
    img, d = icon_canvas()
    d.rounded_rectangle([p(6), p(24), p(56), p(64)], radius=p(4), outline=GL, width=p(7))
    d.polygon([(p(56), p(38)), (p(72), p(38)), (p(90), p(54)), (p(90), p(64)), (p(56), p(64))],
              outline=GL, width=p(7))
    for cx in (26, 72):
        d.ellipse([p(cx - 11), p(60), p(cx + 11), p(82)], fill=HOLE, outline=GL, width=p(7))
    return finish(img, "icon-shipping.png")


def icon_warranty():  # shield with a tick
    img, d = icon_canvas()
    shield = [(48, 6), (82, 18), (80, 50), (48, 90), (16, 50), (14, 18)]
    d.polygon([(p(x), p(y)) for x, y in shield], outline=GL, width=p(7))
    d.line([(p(32), p(48)), (p(45), p(61)), (p(65), p(36))], fill=GL, width=p(7), joint="curve")
    return finish(img, "icon-warranty.png")


def icon_support():  # headset
    img, d = icon_canvas()
    d.arc([p(12), p(10), p(84), p(82)], start=180, end=360, fill=GL, width=p(7))
    d.rounded_rectangle([p(8), p(44), p(26), p(72)], radius=p(6), outline=GL, width=p(7))
    d.rounded_rectangle([p(70), p(44), p(88), p(72)], radius=p(6), outline=GL, width=p(7))
    d.line([(p(79), p(72)), (p(79), p(80)), (p(60), p(88))], fill=GL, width=p(7), joint="curve")
    d.ellipse([p(50), p(83), p(60), p(93)], fill=GL)
    return finish(img, "icon-support.png")


# ── Header logo (dark rounded card, shown at 170x60) ─────────────────────────

def build_logo():
    """The yellow wordmark on its own dark rounded card.

    Some mail apps (Gmail on iPhone) also lighten dark backgrounds in dark mode,
    which would leave the yellow logo on a pale strip. With the dark baked into
    the image, the logo always sits on dark.
    """
    src = Image.open(os.path.join(ROOT, "public", "yellowLogo.png")).convert("RGBA")
    cw, ch = 340, 120                     # 2x of 170x60
    logo_w = 300
    logo = src.resize((logo_w, round(src.height * logo_w / src.width)), Image.LANCZOS)
    ss = 4
    mask = Image.new("L", (cw * ss, ch * ss), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw * ss - 1, ch * ss - 1], radius=16 * ss, fill=255)
    mask = mask.resize((cw, ch), Image.LANCZOS)
    card = Image.new("RGBA", (cw, ch), DARK + (255,))
    card.putalpha(mask)
    card.alpha_composite(logo, ((cw - logo.width) // 2, (ch - logo.height) // 2))
    path = os.path.join(OUT, "logo.png")
    card.save(path, optimize=True)
    return path


# ── Product photos (240x240, shown at 64) ───────────────────────────────────

def build_product(src_name, out_name):
    """Centre square crop of the studio photo, edge to edge (no white frame)."""
    src = Image.open(os.path.join(ROOT, "public", "buyproduct", src_name)).convert("RGB")
    side = min(src.size)
    left = (src.width - side) // 2
    top = (src.height - side) // 2
    square = src.crop((left, top, left + side, top + side)).resize((240, 240), Image.LANCZOS)
    path = os.path.join(OUT, out_name)
    square.save(path, optimize=True)
    return path


if __name__ == "__main__":
    built = [
        build_van(),
        build_logo(),
        icon_dispatch(), icon_shipping(), icon_warranty(), icon_support(),
        build_product("pinkFront.webp", "product-pink.png"),
        build_product("redFront.webp", "product-red.png"),
        build_product("blackFront.webp", "product-black.png"),
    ]
    for path in built:
        print(f"{os.path.getsize(path) // 1024:>4} KB  {os.path.relpath(path, ROOT)}")
