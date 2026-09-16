/* Development-only preview controls. No artwork depends on this file. */
(function () {
  const body = document.body;

  /* Output presets. The keys match the folder names export.mjs writes,
     and the data-size attribute the stylesheet keys off. */
  const SIZES = {
    a1290: { label: "1290 × 2796", w: 1290, h: 2796, dir: "appstore-1290x2796" },
    p1242: { label: "1242 × 2688", w: 1242, h: 2688, dir: "play-1242x2688" },
  };

  /* --- export mode --------------------------------------------------
     index.html?export=3&size=p1242 strips every trace of the preview and
     leaves a single artboard alone at 1:1 in the top-left of the
     viewport, so a headless screenshot is the artwork and nothing else.
     ------------------------------------------------------------------ */
  const params = new URLSearchParams(location.search);
  const exportN = params.get("export");
  if (exportN) {
    const boards = [...document.querySelectorAll(".artboard")];
    const keep = boards[Number(exportN) - 1];
    document.querySelector(".pv-bar").remove();
    document.querySelectorAll(".pv-slot").forEach((s) => {
      if (!s.contains(keep)) s.remove();
      else s.querySelector("figcaption").remove();
    });
    body.className = "export";
    body.removeAttribute("data-mode");
    body.dataset.size = SIZES[params.get("size")] ? params.get("size") : "a1290";
    document.documentElement.style.background = "#000";
    return;
  }

  const slots  = [...document.querySelectorAll(".pv-slot")];
  const zoomEl = document.getElementById("pv-zoom");
  const jump   = document.querySelector(".pv-jump");
  const dlAll  = document.querySelector("[data-dl-all]");
  const STEPS  = [0.12, 0.16, 0.2, 0.24, 0.3, 0.36, 0.46, 0.6, 0.8, 1];

  // Each artboard is transform-scaled, which leaves its original box in
  // flow. Wrap it so the slot only reserves the scaled footprint.
  slots.forEach((slot) => {
    const board = slot.querySelector(".artboard");
    const frame = document.createElement("div");
    frame.className = "pv-frame";
    board.replaceWith(frame);
    frame.append(board);
  });

  let current = 0;
  let size = "a1290";

  /* --- per-artboard download links ---------------------------------- */
  const links = slots.map((slot) => {
    const a = document.createElement("a");
    a.className = "pv-dl";
    a.textContent = "⤓ PNG";
    slot.querySelector("figcaption").append(a);
    return a;
  });

  function fileFor(i) {
    const slug = slots[i].querySelector(".artboard").dataset.slug;
    return `export/${SIZES[size].dir}/vhsmo-${slug}.png`;
  }
  function refreshLinks() {
    links.forEach((a, i) => {
      a.href = fileFor(i);
      a.download = "";
      a.title = `Download ${SIZES[size].label}`;
    });
    dlAll.textContent = `⤓ Download all 8 · ${SIZES[size].label}`;
  }

  /* Downloads are served straight off the rendered PNGs rather than
     re-rasterising the DOM in the browser, which never reproduces the
     gradients, blend modes and object-fit crops faithfully. If the files
     for this size have not been rendered yet, say so instead of handing
     over eight 404s. */
  async function missingExport() {
    try {
      const r = await fetch(fileFor(0), { method: "HEAD" });
      return !r.ok;
    } catch { return true; }
  }

  function hint() {
    document.querySelector(".pv-hint")?.remove();
    const el = document.createElement("div");
    el.className = "pv-hint";
    el.innerHTML =
      `Nothing rendered at <b>${SIZES[size].label}</b> yet. Run ` +
      `<code>node export.mjs --size ${size === "p1242" ? "play" : "appstore"}</code> ` +
      `in <code>websites/app-store</code>, then try again.`;
    const b = document.createElement("button");
    b.textContent = "Dismiss";
    b.onclick = () => el.remove();
    el.append(b);
    document.body.append(el);
  }

  async function downloadAll() {
    if (await missingExport()) return hint();
    dlAll.dataset.busy = "1";
    for (let i = 0; i < slots.length; i++) {
      const a = document.createElement("a");
      a.href = fileFor(i);
      a.download = "";
      document.body.append(a);
      a.click();
      a.remove();
      await new Promise((r) => setTimeout(r, 320));
    }
    delete dlAll.dataset.busy;
  }

  dlAll.addEventListener("click", downloadAll);
  links.forEach((a) =>
    a.addEventListener("click", async (e) => {
      if (await missingExport()) { e.preventDefault(); hint(); }
    }));

  /* --- size, zoom, mode --------------------------------------------- */
  function setSize(k) {
    size = k;
    body.dataset.size = k;
    document.querySelectorAll("[data-size-btn]").forEach((b) =>
      b.classList.toggle("is-on", b.dataset.sizeBtn === k));
    document.querySelector(".pv-hint")?.remove();
    refreshLinks();
  }

  function setScale(v) {
    body.style.setProperty("--scale", v);
    zoomEl.value = Math.round(v * 100) + "%";
  }
  function readScale() {
    return parseFloat(getComputedStyle(body).getPropertyValue("--scale")) || 0.24;
  }
  function show(i) {
    current = (i + slots.length) % slots.length;
    slots.forEach((s, n) => s.classList.toggle("is-current", n === current));
    [...jump.children].forEach((a, n) => a.classList.toggle("is-on", n === current));
    if (body.dataset.mode === "contact") {
      slots[current].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function setMode(m) {
    body.dataset.mode = m;
    document.querySelectorAll("[data-mode-btn]").forEach((b) =>
      b.classList.toggle("is-on", b.dataset.modeBtn === m));
    body.style.removeProperty("--scale");
    zoomEl.value = Math.round(readScale() * 100) + "%";
    if (m === "single") show(current);
  }

  slots.forEach((slot, i) => {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = String(i + 1).padStart(2, "0");
    a.addEventListener("click", (e) => { e.preventDefault(); show(i); });
    jump.append(a);
  });

  document.querySelectorAll("[data-size-btn]").forEach((b) =>
    b.addEventListener("click", () => setSize(b.dataset.sizeBtn)));
  document.querySelectorAll("[data-mode-btn]").forEach((b) =>
    b.addEventListener("click", () => setMode(b.dataset.modeBtn)));
  document.querySelectorAll("[data-zoom]").forEach((b) =>
    b.addEventListener("click", () => {
      const dir = b.dataset.zoom === "+" ? 1 : -1;
      const now = readScale();
      let i = STEPS.findIndex((s) => s >= now - 0.001);
      if (i < 0) i = STEPS.length - 1;
      setScale(STEPS[Math.min(STEPS.length - 1, Math.max(0, i + dir))]);
    }));

  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "ArrowLeft")  show(current - 1);
    if (e.key === "f") setMode(body.dataset.mode === "single" ? "contact" : "single");
  });

  /* The bar wraps to as many rows as the window needs, so the stage is
     pushed down by whatever it actually measures rather than a guess. */
  const bar = document.querySelector(".pv-bar");
  function clearBar() {
    body.style.paddingTop = bar.offsetHeight + 34 + "px";
  }
  new ResizeObserver(clearBar).observe(bar);
  addEventListener("resize", clearBar);

  setSize("a1290");
  show(0);
  setMode("contact");
  clearBar();
})();
