#!/usr/bin/env node
/**
 * VHSMO — App Store campaign exporter
 *
 * Renders each artboard to a flat PNG at one or both output sizes:
 *
 *   appstore   1290 x 2796   App Store Connect 6.9" / 6.7" iPhone
 *   play       1242 x 2688   Apple's 6.5" size, and the Play upload
 *
 *   1. serve this folder:   python3 -m http.server 4321 --directory .
 *   2. export:              node export.mjs
 *   3. output:              ./export/appstore-1290x2796/vhsmo-01-hero.png
 *                           ./export/play-1242x2688/vhsmo-01-hero.png
 *
 * Flags:
 *   --size both        both (default) | appstore | play
 *   --port 4321        port the folder is served on
 *   --only 3,7         export just those artboards
 *   --scale 2          supersample; the PNG comes out at twice the preset
 *                      (both stores take the 1x sizes above; use 1 unless
 *                      you want a master to downsample yourself)
 *   --out ./export     output directory
 *
 * It drives the copy of Chrome already on the machine in headless mode,
 * so there is nothing to install.
 */

import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const run = promisify(execFile);

const BOARDS = [
  "01-hero", "02-offload", "03-live-gallery", "04-real-moments",
  "05-memories", "06-favourites", "07-philosophy", "08-closing",
];

/* `key` is what preview.js passes as ?size=, `dir` is where the PNGs
   land — both files must agree, so keep them in step. */
const SIZES = {
  appstore: { key: "a1290", w: 1290, h: 2796, dir: "appstore-1290x2796" },
  play:     { key: "p1242", w: 1242, h: 2688, dir: "play-1242x2688" },
};

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => existsSync(p));

function arg(name, fallback) {
  const i = process.argv.indexOf("--" + name);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const port  = arg("port", "4321");
const scale = Number(arg("scale", "1"));
const out   = path.resolve(arg("out", "./export"));
const only  = arg("only", "")
  .split(",").filter(Boolean).map(Number);

const want = arg("size", "both");
const sizes = want === "both" ? Object.keys(SIZES) : [want];
for (const s of sizes) {
  if (!SIZES[s]) {
    console.error(`Unknown --size "${s}". Use: appstore, play, or both.`);
    process.exit(1);
  }
}

if (!CHROME) {
  console.error("No Chrome/Chromium found. Install Google Chrome, or point CHROME at a binary.");
  process.exit(1);
}

for (const sizeName of sizes) {
  const size = SIZES[sizeName];
  const dir = path.join(out, size.dir);
  await mkdir(dir, { recursive: true });
  console.log(`\n${size.w} × ${size.h}  →  ${path.relative(process.cwd(), dir)}`);

for (let i = 0; i < BOARDS.length; i++) {
  const n = i + 1;
  if (only.length && !only.includes(n)) continue;

  const file = path.join(dir, `vhsmo-${BOARDS[i]}.png`);
  const profile = await mkdir(path.join(os.tmpdir(), `vhsmo-export-${n}`), { recursive: true })
    .then(() => path.join(os.tmpdir(), `vhsmo-export-${n}`));

  // Chrome sometimes lingers after writing the file when a virtual time
  // budget is set, so it gets killed on a timer and judged by its output.
  await run(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    `--force-device-scale-factor=${scale}`,
    `--window-size=${size.w},${size.h}`,
    // gives webfonts and 1500px photographs time to decode before capture
    "--virtual-time-budget=10000",
    "--run-all-compositor-stages-before-draw",
    `--screenshot=${file}`,
    `http://localhost:${port}/index.html?export=${n}&size=${size.key}`,
  ], { maxBuffer: 1 << 26, timeout: 45000, killSignal: "SIGKILL" })
    .catch(() => {});

  await rm(profile, { recursive: true, force: true });

  if (!existsSync(file)) {
    console.error(`✗ ${BOARDS[i]} — nothing written. Is the server up on :${port}?`);
    process.exitCode = 1;
    continue;
  }
  console.log(`  ✓ ${path.basename(file)}`);
}
}

console.log(`\nDone — ${out}`);
