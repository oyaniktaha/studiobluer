/* studiolume — COSMOS interactive field
   Draggable, inertial floating plane with depth parallax + custom cursor.
   Inspired by cosmos.so (Godly N°978). Pointer-driven, so it works fine
   even when the environment forces prefers-reduced-motion. */
(function () {
  "use strict";
  const field = document.getElementById("cosmosField");
  const plane = document.getElementById("cosmosPlane");
  const cursor = document.getElementById("cosmosCursor");
  if (!field || !plane) return;

  const tiles = Array.from(plane.querySelectorAll("[data-x]")).map((el) => ({
    el,
    ox: parseFloat(el.dataset.x) || 0,   // original (unscaled) base
    oy: parseFloat(el.dataset.y) || 0,
    bx: parseFloat(el.dataset.x) || 0,   // scaled base used for layout
    by: parseFloat(el.dataset.y) || 0,
    depth: parseFloat(el.dataset.depth) || 1,
  }));
  const discTiles = tiles.filter((t) => t.el.classList.contains("ctile--disc"));

  function applyScale() {
    const s = Math.max(0.56, Math.min(1, field.clientWidth / 1120));
    tiles.forEach((t) => { t.bx = t.ox * s; t.by = t.oy * s; });
  }
  applyScale();

  // state
  let panX = 0, panY = 0;            // current plane offset
  let targetX = 0, targetY = 0;      // inertia target while dragging
  let velX = 0, velY = 0;
  let dragging = false, moved = 0;
  let downTile = null;
  let startX = 0, startY = 0, lastPX = 0, lastPY = 0;
  let parX = 0, parY = 0, parTX = 0, parTY = 0;  // pointer parallax (smoothed)
  let curX = 0, curY = 0;            // custom cursor pos
  let idle = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;

  // bounds from content extent
  let bound = { x: 600, y: 320 };
  function recomputeBounds() {
    let maxX = 0, maxY = 0;
    tiles.forEach((t) => { maxX = Math.max(maxX, Math.abs(t.bx)); maxY = Math.max(maxY, Math.abs(t.by)); });
    const w = field.clientWidth, h = field.clientHeight;
    bound.x = Math.max(60, maxX + 160 - w * 0.18);
    bound.y = Math.max(40, maxY + 140 - h * 0.18);
  }
  recomputeBounds();
  window.addEventListener("resize", () => { applyScale(); recomputeBounds(); });

  const clampElastic = (v, max) => {
    if (v > max) return max + (v - max) * 0.35;
    if (v < -max) return -max + (v + max) * 0.35;
    return v;
  };

  /* ---------- pointer drag ---------- */
  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; moved = 0;
    downTile = (e.target && e.target.closest) ? e.target.closest(".ctile--disc") : null;
    field.classList.add("dragging", "engaged");
    const p = point(e);
    startX = lastPX = p.x; startY = lastPY = p.y;
    velX = velY = 0;
    if (field.setPointerCapture && e.pointerId != null) {
      try { field.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }
  function onMove(e) {
    const p = point(e);
    // custom cursor follows pointer (relative to field)
    const r = field.getBoundingClientRect();
    curX = p.x - r.left; curY = p.y - r.top;
    field.classList.add("show-cursor");
    // pointer parallax target (-1..1)
    parTX = ((curX / r.width) - 0.5) * 2;
    parTY = ((curY / r.height) - 0.5) * 2;
    idle = 0;
    if (dragging) {
      const dx = p.x - lastPX, dy = p.y - lastPY;
      moved += Math.abs(dx) + Math.abs(dy);
      targetX += dx; targetY += dy;
      velX = dx; velY = dy;
      lastPX = p.x; lastPY = p.y;
      // keep target within elastic bounds
      targetX = clampElastic(targetX, bound.x);
      targetY = clampElastic(targetY, bound.y);
    }
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    field.classList.remove("dragging");
    if (field.releasePointerCapture && e && e.pointerId != null) {
      try { field.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    // tap (not drag) on a discipline tile → open its works page.
    // Done here because pointer capture suppresses the native click on the tile.
    if (downTile && moved <= 8) {
      const key = downTile.dataset.service;
      if (key) { window.location.href = "isler.html?kategori=" + encodeURIComponent(key); }
    }
    downTile = null;
  }
  function point(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  field.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  field.addEventListener("pointerleave", () => {
    if (!dragging) field.classList.remove("show-cursor");
  });

  /* ---------- hover detection for disc tiles ---------- */
  discTiles.forEach((t) => {
    t.el.addEventListener("pointerenter", () => {
      t.el.classList.add("hot");
      field.classList.add("cursor-hot");
      setCursorText("aç →");
    });
    t.el.addEventListener("pointerleave", () => {
      t.el.classList.remove("hot");
      field.classList.remove("cursor-hot");
      setCursorText("sürükle");
    });
    // click vs drag → navigate to the works page (Aristide-Benoist style)
    t.el.addEventListener("click", (e) => {
      if (moved > 8) { e.preventDefault(); return; }
      const key = t.el.dataset.service;
      if (key) window.location.href = "isler.html?kategori=" + encodeURIComponent(key);
    });
  });
  function setCursorText(txt) {
    const s = cursor && cursor.querySelector("span");
    if (s) s.textContent = txt;
  }

  /* ---------- render loop ---------- */
  function frame() {
    // inertia toward target (drag) or coast (after release)
    if (dragging) {
      panX += (targetX - panX) * 0.18;
      panY += (targetY - panY) * 0.18;
    } else {
      // coast with velocity, then settle within bounds
      targetX += velX; targetY += velY;
      velX *= 0.92; velY *= 0.92;
      if (Math.abs(velX) < 0.05) velX = 0;
      if (Math.abs(velY) < 0.05) velY = 0;
      // pull back inside hard bounds
      targetX = Math.max(-bound.x, Math.min(bound.x, targetX));
      targetY = Math.max(-bound.y, Math.min(bound.y, targetY));
      panX += (targetX - panX) * 0.08;
      panY += (targetY - panY) * 0.08;

      // gentle idle drift (skip under reduced motion / calm)
      if (!reduced && !document.body.classList.contains("calm")) {
        idle += 0.006;
        if (velX === 0 && velY === 0) {
          panX += Math.sin(idle) * 0.15;
          panY += Math.cos(idle * 0.8) * 0.12;
        }
      }
    }

    plane.style.transform = `translate3d(${panX.toFixed(2)}px, ${panY.toFixed(2)}px, 0)`;

    // smooth pointer parallax
    parX += (parTX - parX) * 0.06;
    parY += (parTY - parY) * 0.06;

    // position each tile: base + depth parallax from pointer
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      const k = (t.depth - 1) * 26;       // deeper chips drift more
      const px = t.bx - parX * k;
      const py = t.by - parY * k;
      t.el.style.transform = `translate3d(calc(-50% + ${px.toFixed(1)}px), calc(-50% + ${py.toFixed(1)}px), 0)`;
    }

    // custom cursor
    if (cursor && fine) {
      cursor.style.left = curX + "px";
      cursor.style.top = curY + "px";
    }

    requestAnimationFrame(frame);
  }
  // initial tile placement
  tiles.forEach((t) => {
    t.el.style.transform = `translate3d(calc(-50% + ${t.bx}px), calc(-50% + ${t.by}px), 0)`;
  });
  requestAnimationFrame(frame);
})();
