/* studiobleur — 3D İŞLER GALERİSİ (yatay kayan şerit)
   Projeler soldan sağa sürekli kayar; kullanıcı sürükleyerek gezebilir.
   Sonsuz döngü (kartlar klonlanır), atalet'li sürükleme, hover'da yavaşlar.
   Sadece kategori=3d sayfasında çağrılır (works-list.js içinden).

   API:  window.mountStage3D({ container, items, thumbHTML, openLB })
         → { destroy() }
*/
(function () {
  "use strict";

  window.mountStage3D = function (opts) {
    const root = opts.container;
    const baseItems = (opts.items || []).slice();
    const thumbHTML = opts.thumbHTML;
    const openLB = opts.openLB;

    if (!root || !baseItems.length) {
      if (root) root.hidden = true;
      return { destroy() {} };
    }
    root.hidden = false;

    const vp = root.querySelector("#vp3d");
    const track = root.querySelector("#track3d");
    const hint = root.querySelector("#s3Hint");
    track.innerHTML = "";

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }
    function cardHTML(w) {
      const tag = (w.tags && w.tags[0]) ? `<span class="s3-tag">${esc(w.tags[0])}</span>` : "";
      const yr = w.year ? `<span class="s3-yr">${esc(w.year)}</span>` : "";
      return `
        <div class="s3-media">${thumbHTML(w)}</div>
        <div class="s3-cap">
          <span class="s3-name">${esc(w.title) || "Başlıksız"}</span>
          <span class="s3-meta">${yr}${tag}</span>
        </div>`;
    }
    function makeCard(w, n) {
      const el = document.createElement("button");
      el.className = "s3-card";
      el.setAttribute("aria-label", (w.title || "Proje") + " — aç");
      el.innerHTML = `<span class="s3-idx">${String(n).padStart(2, "0")}</span>${cardHTML(w)}`;
      el.addEventListener("click", () => {
        if (Math.abs(dragMoved) > 8) return;   // sürükleme tıklamayı bastırır
        if (w && w.id) {
          location.href = "proje.html?id=" + encodeURIComponent(w.id);
        } else if (openLB) {
          openLB(w);
        }
      });
      return el;
    }

    // bir set kart oluştur, sonra viewport'u dolduracak kadar klonla
    function buildSet() {
      const frag = document.createDocumentFragment();
      baseItems.forEach((w, i) => frag.appendChild(makeCard(w, i + 1)));
      return frag;
    }
    track.appendChild(buildSet());
    let setW = track.scrollWidth;                 // bir setin genişliği
    // sonsuz döngü için en az 2 set + viewport kadar genişlik
    let guard = 0;
    while (track.scrollWidth < setW + vp.clientWidth + 400 && guard < 8) {
      track.appendChild(buildSet());
      guard++;
    }
    // setW: tek set genişliği (ilk N kart). Yeniden ölç.
    const cards = Array.from(track.children);
    setW = 0;
    const perSet = baseItems.length;
    for (let i = 0; i < perSet && i < cards.length; i++) {
      setW += cards[i].getBoundingClientRect().width;
    }
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
    setW += gap * perSet;

    /* ---- continuous left→right slide + drag ---- */
    let pos = -setW;                 // [-setW, 0] aralığında tutulur
    const SPEED = 0.045;             // px/ms (soldan sağa)
    let last = performance.now();
    let paused = false;
    let dragging = false;
    let dragMoved = 0;
    let startX = 0, lastX = 0, vel = 0;
    let rafId = null;

    function wrap() {
      while (pos > 0) pos -= setW;
      while (pos < -setW) pos += setW;
    }
    function apply() { track.style.transform = `translate3d(${pos.toFixed(2)}px,0,0)`; }

    function frame(now) {
      const dt = Math.min(now - last, 50);
      last = now;
      if (!dragging) {
        if (!paused) pos += SPEED * dt;          // otomatik kayma (sağa)
        if (Math.abs(vel) > 0.01) {              // sürükleme sonrası atalet
          pos += vel * dt;
          vel *= Math.pow(0.93, dt / 16);
        }
        wrap();
        apply();
      }
      rafId = requestAnimationFrame(frame);
    }

    function point(e) { return (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX; }
    function onDown(e) {
      dragging = true; dragMoved = 0; vel = 0;
      startX = lastX = point(e);
      root.classList.add("dragging");
      hint && hint.classList.add("gone");
    }
    function onMove(e) {
      if (!dragging) return;
      const x = point(e);
      const dx = x - lastX;
      dragMoved += Math.abs(dx);
      pos += dx;
      vel = dx / Math.max(1, (performance.now() - (onMove._t || performance.now())));
      vel = dx * 0.6;                            // sürükleme hızını ataletle taşı
      lastX = x;
      wrap();
      apply();
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("dragging");
    }

    vp.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    vp.addEventListener("mouseenter", () => { paused = true; });
    vp.addEventListener("mouseleave", () => { paused = false; });
    // trackpad / wheel ile yatay gezinme
    vp.addEventListener("wheel", (e) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) > 0) { pos -= d; wrap(); apply(); e.preventDefault(); }
    }, { passive: false });

    apply();
    rafId = requestAnimationFrame(frame);

    return {
      destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        vp.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        track.innerHTML = "";
        root.hidden = true;
      },
    };
  };
})();
