# VHSMO — App Store campaign, Vol. 1

Eight App Store screenshots for the VHSMO iOS app, built as real HTML/CSS
artboards at **1290 × 2796** and exported to flat PNGs.

```
open http://localhost:4321          # after starting the server, below
```

---

## Run it

```bash
python3 websites/app-store/serve.py
```

Or, from the repo root, `preview_start` the **app-store** entry in
`.claude/launch.json`. (`serve.py` is `http.server` plus a `no-store`
header — without it browsers quietly keep serving stale CSS and it looks
like your edits aren't taking.)

The preview page has a dev-only control bar:

| Control                     | What it does                                            |
| --------------------------- | ------------------------------------------------------- |
| **Contact sheet**           | all eight artboards side by side (default, 24%)          |
| **One at a time**           | a single artboard at 46%; `←` / `→` to move between them |
| **1290 × 2796 / 1242 × 2688** | switch output size — the artboards resize live          |
| **⤓ Download all 8**        | downloads all eight PNGs at the selected size            |
| **⤓ PNG** (per artboard)    | downloads just that one at the selected size             |
| **– / +**                   | zoom, 12% → 100%                                         |
| **01 … 08**                 | jump to an artboard                                      |
| `f`                         | toggle contact sheet ↔ single                            |

None of that chrome is inside `.artboard`, so what you see scaled in the
preview is pixel-for-pixel what gets exported.

The download buttons hand you the **rendered PNGs from `export/`** rather
than re-rasterising the page in the browser, which never reproduces the
gradients, blend modes and `object-fit` crops faithfully. So run the
export once (below) and the buttons work from then on; if a size hasn't
been rendered the page tells you which command to run instead of handing
you eight 404s. Downloading all eight at once will make the browser ask
permission for multiple downloads — allow it.

---

## Export

```bash
node export.mjs
```

Writes both sizes, sixteen PNGs, driving the copy of Chrome already
installed on the machine — nothing to `npm install`:

```
export/appstore-1290x2796/vhsmo-01-hero.png …   1290 × 2796
export/play-1242x2688/vhsmo-01-hero.png …       1242 × 2688
```

```bash
node export.mjs --size play       # just 1242 × 2688
node export.mjs --size appstore   # just 1290 × 2796
node export.mjs --only 3,7        # just those artboards
node export.mjs --port 8080       # if the folder is served elsewhere
node export.mjs --scale 2         # 2x master to downsample yourself
node export.mjs --out ~/Desktop   # somewhere else
```

The server has to be running first.

### The two sizes

`--board-*` in `tokens.css` is the **design** space — 1290 × 2796 — and
every composition is authored against it. `--out-*` is the **export**
size; when it differs, `.artboard__canvas` scales the design to fit.
The two presets are within 0.15% of the same aspect, so the scale is
effectively uniform: nothing shifts, crops or reflows between them, and
the 1242 PNGs are natively rendered rather than downsampled.

| Preset        | Pixels      | For                                              |
| ------------- | ----------- | ------------------------------------------------ |
| `appstore`    | 1290 × 2796 | App Store Connect, 6.9" and 6.7" iPhone slots     |
| `play`        | 1242 × 2688 | Apple's 6.5" slot, and the Play upload            |

**One caveat on Play.** 1242 × 2688 is an Apple size. Google Play caps
phone screenshots at *max side ≤ 2 × min side*, and 1242 × 2 = 2484,
which 2688 exceeds — so Play may reject it. If it does, the artwork
needs recomposing for a shorter frame (Play's safe shape is 9:16, e.g.
1242 × 2208 or 1080 × 1920) rather than cropping these, which would cut
the headlines. Add the preset to `SIZES` in both `export.mjs` and
`preview.js` and it will appear in the bar.

---

## What it is made of

```
websites/app-store/
├── index.html            all eight artboards, semantic + commented
├── serve.py              dev server (http.server + no-store)
├── preview.js            dev-only preview controls, downloads, ?export=N
├── export.mjs            headless Chrome → PNGs at both sizes
├── css/
│   ├── tokens.css        brand palette + @font-face, sourced from the site
│   ├── artboard.css      reusable components (.phone, .photo-print, …)
│   ├── campaign.css      the eight compositions
│   └── preview.css       dev chrome only
├── export/              rendered PNGs, gitignored — `node export.mjs`
└── assets/
    ├── appScreenshots/   the five original iOS captures, untouched
    ├── screens/          those five renamed for the artboards — see its README
    ├── photos/           26 real VHSMO photographs, resized from /public/vhsmoclicks
    ├── brand/            camera cut-out + wordmark colourways + star marks
    ├── fonts/            Inter Tight (variable) + Kids Word
    └── texture/          film grain
```

### Nothing here invents a brand

| What          | Where it came from                                                   |
| ------------- | -------------------------------------------------------------------- |
| Palette       | `src/app/globals.css` — darkroom `#2a2422`, kodak `#fdf100`, blue hour `#1093ff`, halide `#e3e3e1` |
| Pink          | `src/lib/products.ts` — the Baby Pink shell, `#ffc9d2` / `#f2a8bd`     |
| Typefaces     | `src/app/layout.tsx` — Inter Tight (the site's own stand-in for the commercial Sequel Sans) and the licensed **Kids Word** marker, copied from `src/app/fonts` |
| Wordmark, star| `/public/yellowLogoTrim.png`, `/public/yellowLogoIcon.png`, recoloured — never re-lettered |
| Camera        | `/public/camera.webp`, already cut out                                |
| Photography   | `/public/vhsmoclicks/*` — the real shots, resized only                |
| Voice         | `src/lib/landing.ts` — "Point. Shoot. Share.", *cameras got smarter, photos got emptier* |
| App UI        | the five real screenshots. No screen is redrawn anywhere.             |

The one value with no literal source in the repo is `--vhsmo-cream`,
sampled off the app's own background, which is warmer than the site's
cool `--color-halide`.

---

## The eight

| #  | Ground                | Headline                        | Screen used         |
| -- | --------------------- | ------------------------------- | ------------------- |
| 01 | cream · pink · yellow | Point. Shoot. Share.            | Home / Vol. 1       |
| 02 | black · yellow        | From camera to camera roll.     | Home / Offload      |
| 03 | night photograph      | Watch the memories roll in.     | Live gallery        |
| 04 | cream · collage       | Real moments. No filters.       | Album grid          |
| 05 | cream · pink          | Your moments, in one place.     | Gallery timeline    |
| 06 | dark · flash          | Pick a favourite.               | Photo detail        |
| 07 | kodak yellow          | Don't check. Just shoot.        | Photo detail        |
| 08 | cream · pink · black  | Point. Shoot. Share.            | Home / Vol. 1       |

Two rules hold the run together. **Colour** — no two neighbours share a
ground, so scrolling the eight is a sequence rather than a stack.
**Phone scale** — the device is the product shot, so it is never cropped
below ~88% of its body; five boards show it whole and the three collage
boards (02, 04, 07) let it run off the bottom by a tenth at most, which
reads as a crop rather than a mistake.

### The iPhone is CSS, not a PNG

`.phone` is built from the iPhone 16 Pro's real proportions — a 402 × 874
pt display, ~62 pt body corner, ~1.2 mm bezel, a 125 × 36.7 pt Dynamic
Island — with a brushed-titanium gradient, the five side buttons, and one
low diagonal sheen on the glass. It scales off a single custom property:

```html
<div class="phone layer" style="--pw: 764px">
```

### Editing

Compositions live in `css/campaign.css`, one commented block per board,
in absolute artboard coordinates. The 96 px gutter (`--margin`) is the
only shared grid. To move something, change its block — the components in
`artboard.css` are shared by all eight and changing those changes the
whole campaign.
