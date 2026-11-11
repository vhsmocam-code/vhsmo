# App screenshots

These files are the source of truth for the phone UI in the campaign.
They are real captures of the current VHSMO app, taken on the iPhone 17 Pro
simulator (1206 × 2622) on 5 Nov 2026. The status bar was set to 9:41 with full
signal and battery.

The photos on screen are real VHSMO shots, loaded into the app's own album
folders. They are also in `../photos/` (`fireworks-portrait.jpg`, `diwali-group.jpg`, …).

| File                       | Screen                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| `01-home.png`              | Home with the **Baby Pink** camera: *Connected · 86%*, *Camera ready / Offload media*, Latest roll |
| `01-home-cherry-red.png`   | The same Home with the **Cherry Red** camera picked in the app          |
| `01-home-cosmic-black.png` | The same Home with the **Cosmic Black** camera picked in the app        |
| `03-live-gallery.png`      | Album **5 Nov 2026** in **film view**, scrolled to the Halloween group / fireworks frames |
| `04-album-grid.png`        | The same album in **grid view**                                        |
| `05-gallery-timeline.png`  | **Your rolls**: Favourites, then the offloads grouped by day            |
| `06-photo-detail.png`      | **P0001011.JPG** (sari pair) in the viewer, with share / favourite / save / delete |
| `07-photo-detail.png`      | **P0001010.JPG** (shawl costumes) in the same viewer                    |

The Live Gallery itself only fills when a camera is streaming to the phone.
Board 03 therefore uses the album film view, which shows the same roll in the
same film-strip style. The connected Home state was rendered with the camera
status set on (Connected, 86%), because no camera was attached to the simulator.

Which artboard uses which:

* 01 Hero → `01-home-cherry-red`; 02 Offload → `01-home-cosmic-black`; 08 Closing → `01-home`
* 03 Live gallery → `03-live-gallery`
* 04 Real moments → `04-album-grid`
* 05 Memories → `05-gallery-timeline`
* 06 Favourites → `06-photo-detail`; 07 Philosophy → `07-photo-detail`

## Replacing one

Overwrite the file, keep the filename, and reload. 1206 × 2622 is exactly the
mockup's screen aspect, so these land pixel-for-pixel with no crop. Any other
iPhone capture size still works. The screen uses `object-fit: cover`, so it is
only centre-cropped very slightly.

Don't pre-round the corners or add a device frame. The artwork supplies the
phone, the Dynamic Island and the glass.
