/* studiolume — işler deposu + ziyaretçi galerisi render
   Veri kaynağı: yayınlanmış işler (works-data.js) + tarayıcıdaki çalışma kopyası (localStorage).
   Ziyaretçi: yayınlanmış işleri görür.
   Yönetici (siz): çalışma kopyanızı görür; "Yayınla" ile herkese açarsınız. */
(function () {
  "use strict";
  const KEY = "studiolume_works_v1";
  const CATS = ["uiux", "3d", "ai", "product"];

  /* ---------- IndexedDB destekli depolama (büyük kapasite) ----------
     localStorage ~5MB ile sınırlı → çok iş + görsel sığmıyor.
     IndexedDB yüzlerce MB tutar. Senkron API korunur: bellek önbelleği
     (mem) sayfa açılışında IDB'den doldurulur; load() onu döndürür. */
  const DB_NAME = "studiobleur_db";
  const STORE = "kv";
  const IDB_KEY = "works_v1";
  let mem = null;        // hydrate edilmiş bellek kopyası (senkron okunur)
  let dbReady = null;    // IDB açılış promise'i

  function openDB() {
    if (dbReady) return dbReady;
    dbReady = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
    return dbReady;
  }
  async function idbGet() {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE, "readonly");
        const r = tx.objectStore(STORE).get(IDB_KEY);
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }
  async function idbSet(arr) {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(arr, IDB_KEY);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) { resolve(false); }
    });
  }
  async function idbDel() {
    const db = await openDB();
    if (!db) return;
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(IDB_KEY);
    } catch (e) {}
  }

  // Sayfa açılışında IDB'den belleğe doldur (varsa localStorage'dan migrate et)
  async function hydrate() {
    let data = await idbGet();
    if (data == null) {
      // eski localStorage verisini IDB'ye taşı (tek seferlik migrasyon)
      try {
        const raw = localStorage.getItem(KEY);
        if (raw !== null) {
          data = JSON.parse(raw) || [];
          await idbSet(data);
        }
      } catch (e) {}
    }
    if (data != null) {
      mem = data;
      window.dispatchEvent(new Event("works-updated"));
    }
  }
  hydrate();

  function baked() {
    return Array.isArray(window.STUDIOLUME_WORKS) ? window.STUDIOLUME_WORKS : [];
  }
  function hasLocal() {
    if (mem !== null) return true;
    try { return localStorage.getItem(KEY) !== null; } catch (e) { return false; }
  }
  function load() {
    if (mem !== null) return mem;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw !== null) return JSON.parse(raw) || [];
    } catch (e) {}
    return baked().slice();
  }
  function save(arr) {
    // birincil: bellek + IndexedDB (büyük kapasite)
    mem = arr;
    idbSet(arr); // async — büyük veriyi kotasız tutar
    // ikincil: localStorage aynası (best-effort, kota dolarsa sessizce atla)
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
    window.dispatchEvent(new Event("works-updated"));
    return true;
  }
  function resetToPublished() {
    mem = null;
    idbDel();
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

  // push aracı için: IndexedDB'den taze veriyi async döndür (localStorage dolsa bile tam veri)
  async function loadAsync() {
    const data = await idbGet();
    if (data != null) return data;
    return load();
  }

  window.StudioWorks = { KEY, CATS, baked, hasLocal, load, loadAsync, save, resetToPublished, uid, render };

  if (document.readyState !== "loading") render();
  else document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("works-updated", render);
})();
