# /setup media

Every step on the setup page shows a drawn, animated illustration of the
camera (`src/components/setup/illustrations/`), and the video section plays a
drawn walkthrough. **Drop a real file at the path below and it replaces the
drawing automatically** - no code change.
If several formats exist for one slot, the first of `mp4 → webm → gif → webp → jpg → png` wins.

Copy and slot definitions live in `src/lib/setup.ts`.

| Slot (file name without extension) | Shows | Ratio | Notes |
|---|---|---|---|
| `hero/camera` | Hero camera shot | 6:5 | Transparent PNG/WebP cut-out works best (shown uncropped). Falls back to `camera-pink.webp`. |
| `video/setup` (+ `video/poster`) | Full setup walkthrough | 16:9 | `setup.mp4` (H.264) and optional `setup.webm`. `poster.jpg/webp` is the thumbnail. |
| `step-01/media` | Slider moved to ON | 1:1 | Short silent loop |
| `step-02/media` | Notification LED close-up | 1:1 | Shown uncropped - leave breathing room around the LED |
| `step-03/media` | Camera in use | 16:9 | Wide photo or loop |
| `step-04/media` | Wi-Fi button pressed, lights up | 1:1 | Short silent loop |
| `step-05/camera` | Camera connecting to the app | 4:3 | |
| `step-05/app-1…5` | Real app screenshots | 1206:2622 | Already in place (webp) |
| `step-06/media` | Charging LED red → green | 4:3 | Loop |
| `step-06/charging-red` | LED while charging | 4:3 | Photo |
| `step-06/charged-green` | LED when fully charged | 4:3 | Photo |

Clips next to a still frame: for a video slot add `<slot>-poster.jpg`
(e.g. `step-01/media-poster.jpg`) so something shows before it loads.

## Format guidance

- **Prefer MP4/WebM over GIF.** Same look at roughly a tenth of the size. They loop silently, only play while on screen, and stay paused for visitors who prefer reduced motion. GIFs are supported but are not optimised by Next.js, so keep them under ~2 MB.
- Shoot to the ratio above so nothing is cropped. Hardware close-ups (LED, button) are shown uncropped.
- Targets: images ≤ 300 KB (WebP), loops ≤ 1.5 MB, 720–1080px on the long edge, 12–15 fps is plenty.

```bash
# GIF → MP4 + WebM
ffmpeg -i in.gif -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" step-01/media.mp4
ffmpeg -i in.gif -c:v libvpx-vp9 -b:v 0 -crf 34 step-01/media.webm
# Clip → looping MP4, no audio, 1080 wide
ffmpeg -i in.mov -an -vf "scale=1080:-2,fps=24" -c:v libx264 -crf 24 -movflags +faststart step-01/media.mp4
# Photo → WebP
cwebp -q 82 -resize 1600 0 in.jpg -o step-01/media.webp
```
