/* studiolume — işler deposu + ziyaretçi galerisi render
   Veri kaynağı: yayınlanmış işler (works-data.js) + tarayıcıdaki çalışma kopyası (localStorage).
   Ziyaretçi: yayınlanmış işleri görür.
   Yönetici (siz): çalışma kopyanızı görür; "Yayınla" ile herkese açarsınız. */
(function () {
  "use strict";
  const KEY = "studiolume_works_v1";
  const CATS = ["uiux", "3d", "ai", "product"];

  function baked() {
    return Array.isArray(window.STUDIOLUME_WORKS) ? window.STUDIOLUME_WORKS : [];
  }
  function hasLocal() {
    try { return localStorage.getItem(KEY) !== null; } catch (e) { return false; }
  }
  function load() {
    if (hasLocal()) {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
    }
    return baked().slice();
  }
  function save(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch (e) {
      alert("Kaydedilemedi — görsel(ler) çok büyük olabilir. Daha küçük bir görsel deneyin.");
      return false;
    }
    window.dispatchEvent(new Event("works-updated"));
    return true;
  }
  function resetToPublished() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    window.dispatchEvent(new Event("works-updated"));
  }
  function uid() {
    return "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }
  function card(w) {
    const tags = (w.tags || [])
      .map((t) => `<span>${esc(t)}</span>`)
      .join("");
    const img = w.image
      ? `<div class="proj-img"><img src="${w.image}" alt="${esc(w.title)}" loading="lazy"/></div>`
      : `<div class="proj-img proj-img--empty">görsel yok</div>`;
    return `<article class="proj">${img}<h4>${esc(w.title) || "Başlıksız"}</h4>${
      w.desc ? `<p>${esc(w.desc)}</p>` : "<p></p>"
    }${tags ? `<div class="proj-tags">${tags}</div>` : ""}</article>`;
  }
  function render() {
    const all = load();
    CATS.forEach((cat) => {
      const grid = document.querySelector(`[data-grid="${cat}"]`);
      const empty = document.querySelector(`[data-empty="${cat}"]`);
      if (!grid) return;
      const items = all.filter((w) => w.cat === cat);
      grid.innerHTML = items.map(card).join("");
      if (empty) empty.hidden = items.length > 0;
    });
  }

  window.StudioWorks = { KEY, CATS, baked, hasLocal, load, save, resetToPublished, uid, render };

  if (document.readyState !== "loading") render();
  else document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("works-updated", render);
})();
