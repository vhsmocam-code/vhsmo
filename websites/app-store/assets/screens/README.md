# App screenshots

These five files are the **real VHSMO iOS captures** and they are the
source of truth for every phone in the campaign. Nothing in the artwork
redraws the app UI — the screenshots are dropped into the mockup as-is.

| File                      | Screen                                                       | Source (`../appScreenshots/`)            |
| ------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `01-home.png`             | VHSMO **Vol. 1** home — pink camera, *System Ready / Offload media*, Recent transfers | `…11.09.02.jpeg`      |
| `03-live-gallery.png`     | **LIVE Gallery** — *"now rolling. shots land here as you shoot"* | `…11.09.03.jpeg`                       |
| `04-album-grid.png`       | **Album** `Vhsmo-2026-09-…` — the 991–998 grid                | `…11.09.02 (1).jpeg`                     |
| `05-gallery-timeline.png` | **GALLERY / VHSMO** — Featured collection "Fav" + Offload timeline | `…11.09.02 (2).jpeg`                 |
| `06-photo-detail.png`     | **P9999995.JPG** detail — heart / download / trash            | `…11.09.04 (1).jpeg`                     |

Which artboard uses which:

* 01 Hero, 02 Offload, 08 Closing → `01-home`
* 03 Live gallery → `03-live-gallery`
* 04 Real moments → `04-album-grid`
* 05 Memories → `05-gallery-timeline`
* 06 Favourites, 07 Philosophy → `06-photo-detail`

## Replacing one

Overwrite the file, keep the filename, reload. All five originals are
1206 × 2622 (iPhone 16 Pro), which is exactly the mockup's screen
aspect, so they land pixel-for-pixel with no crop. Any other iPhone
capture size still works — the screen is `object-fit: cover` — it is
just centre-cropped by a hair.

Don't pre-round the corners or add a device frame: the artwork supplies
the phone, the Dynamic Island and the glass.
