/* studiolume — İŞLER sayfası mantığı
   - URL'den kategori okur (?kategori=uiux|3d|ai|product)
   - İşleri aynı kaynaktan yükler (yayınlanmış works-data.js + localStorage çalışma kopyası)
   - Aristide Benoist tarzı: dev liste + imleci takip eden görsel reveal + lightbox
   - Gerçek iş yoksa örnek (placeholder) satırlar gösterir ki etkileşim görünür olsun */
(function () {
  "use strict";

  const KEY = "studiolume_works_v1";
  const CATS = ["uiux", "3d", "ai", "product"];
  const SUBCATS = {
    uiux: [
      { id: "web",       label: "Web Sitesi Tasarımı",          desc: "Markalara ve projelere özel kullanıcı dostu web arayüzleri." },
      { id: "mobil",     label: "Mobil Uygulama Tasarımı",      desc: "iOS ve Android platformları için etkileşimli mobil uygulama deneyimleri." },
      { id: "uikit",     label: "UI Kit Tasarımı",              desc: "Geliştirme süreçlerini hızlandıracak sürdürülebilir kullanıcı arayüzü bileşen setleri." },
      { id: "otomasyon", label: "Otomasyon Arayüzü Tasarımı",  desc: "Karmaşık sistemler için kolay kullanılabilir ve işlevsel kontrol paneli/yazılım arayüzleri." },
    ],
    "3d": [
      { id: "mekan",    label: "İç ve Dış Mekan Tasarımı",     desc: "Konut ve ticari projeler için kapsamlı 3D mekan modelleme." },
      { id: "render",   label: "Render ve Görselleştirme",      desc: "Projelerinizin gerçeğe yakın, yüksek kaliteli fotogerçekçi sunumları." },
      { id: "2d",       label: "2D Mimari Çizimler",           desc: "Kavramsal projeler için temel mimari projelendirme çizimleri." },
      { id: "katplani", label: "Kat Planı Renklendirme",       desc: "Sunumlar ve gayrimenkul pazarlaması için estetik, anlaşılır kat planı tasarımları." },
    ],
    ai: [
      { id: "otomasyon", label: "AI Destekli Otomasyonlar",          desc: "İş süreçlerinizi ve operasyonlarınızı hızlandıracak yapay zeka entegrasyonları." },
      { id: "gorsel",    label: "AI ile Animasyon ve Görselleştirme", desc: "Yapay zeka araçlarından faydalanılarak üretilen hızlı ve yenilikçi görsel tasarım çözümleri." },
    ],
    product: [
      { id: "konsept",   label: "Konsept Ürün Tasarımı",              desc: "Fikir aşamasından son aşamaya kadar yenilikçi ürünlerin tasarlanması." },
      { id: "studio",    label: "Stüdyo Kalitesinde Görselleştirme", desc: "Ürünlerin e-ticaret veya kataloglar için fotogerçekçi renderlarının alınması." },
      { id: "lifestyle", label: "Mekan İçi Entegrasyon",             desc: "Ürünlerin kullanımını daha iyi yansıtmak için 3D iç mekanlara yerleştirilerek sunulması." },
      { id: "teknik",    label: "İmalat ve Teknik Çizimler",         desc: "Üretim aşamasına uygun, detaylı teknik resimler ve kesit dosyalarının hazırlanması." },
    ],
  };
  const META = {
    uiux:    { num: "01", label: "UI/UX",   title: "Arayüz &amp; Deneyim",  color: "var(--lime)",   desc: "Kullanıcı araştırmasından yüksek sadakatli arayüzlere; sezgisel, ölçülebilir deneyimler." },
    "3d":    { num: "02", label: "3D",       title: "3D Görselleştirme",     color: "var(--coral)",  desc: "Fotogerçekçi render, animasyon ve etkileşimli 3D — ürünleri gözle görülür kılan işler." },
    ai:      { num: "03", label: "AI",       title: "Yapay Zekâ",            color: "var(--violet)", desc: "Üretken yapay zekâ, otomasyon ve akıllı arayüzlerle hızlandırdığımız çözümler." },
    product: { num: "04", label: "Product",  title: "Ürün Tasarımı",         color: "var(--sky)",    desc: "Fikirden lansmana; ürün stratejisi, yol haritası ve uçtan uca ürün tasarımı." },
  };

  // örnek (placeholder) işler — gerçek iş yoksa gösterilir
  const DEMO = {
    uiux: [
      { title: "Meridian Bankacılık", year: "2025", tag: "Mobil Uygulama" },
      { title: "Halo Sağlık Paneli", year: "2025", tag: "Web App" },
      { title: "Orbit Seyahat", year: "2024", tag: "Tasarım Sistemi" },
      { title: "Vinea E-ticaret", year: "2024", tag: "Web" },
      { title: "Pulse Fitness", year: "2023", tag: "Mobil" },
    ],
    "3d": [
      { title: "Tepe Villaları Alanya", year: "2023", tag: "İç mekan dış mekan render" },
      { title: "Helix Kulaklık", year: "2025", tag: "Animasyon" },
      { title: "Form Mobilya", year: "2024", tag: "Konfigüratör" },
      { title: "Nova Otomotiv", year: "2024", tag: "WebGL" },
    ],
    ai: [
      { title: "Sentio Asistan", year: "2025", tag: "Üretken YZ" },
      { title: "Atlas Destek Botu", year: "2025", tag: "Otomasyon" },
      { title: "Lumen Görsel Üretici", year: "2024", tag: "Difüzyon" },
      { title: "Cortex Analitik", year: "2024", tag: "Entegrasyon" },
    ],
    product: [
      { title: "Forge SaaS", year: "2025", tag: "0→1 Ürün" },
      { title: "Tide Abonelik", year: "2025", tag: "Strateji" },
      { title: "Kite Pazaryeri", year: "2024", tag: "Yol Haritası" },
      { title: "Beacon B2B", year: "2024", tag: "MVP" },
    ],
  };

  function getCat() {
    const p = new URLSearchParams(location.search).get("kategori");
    return CATS.includes(p) ? p : "uiux";
  }
  function loadWorks() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw !== null) return JSON.parse(raw) || [];
    } catch (e) {}
    return Array.isArray(window.STUDIOLUME_WORKS) ? window.STUDIOLUME_WORKS.slice() : [];
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  const cat = getCat();
  const meta = META[cat];
  document.documentElement.style.setProperty("--cat", meta.color);
  document.body.style.setProperty("--cat", meta.color);

  // header
  document.getElementById("catEyebrow").innerHTML = meta.num + " — " + meta.label;
  document.getElementById("catTitle").innerHTML = meta.title;
  document.getElementById("catDesc").textContent = meta.desc;
  document.title = meta.label + " işleri — studiobleur";

  // switch active
  document.querySelectorAll("#catSwitch a").forEach((a) => {
    a.classList.toggle("active", a.dataset.cat === cat);
  });

  // data + render
  const worksEl = document.getElementById("works");
  const emptyEl = document.getElementById("emptyState");
  let items = [];
  let isDemo = false;
  // URL-tabanlı subcat: ?subcat=web gibi
  const activeSubcat = new URLSearchParams(location.search).get("subcat") || null;

  /* ---- subcategory card grid ---- */
  function showSubcatCards() {
    const wrap = document.getElementById("subcatCards");
    if (!wrap) return;
    const subcats = SUBCATS[cat] || [];
    wrap.hidden = false;
    wrap.innerHTML = subcats.map((sc, i) =>
      `<a class="sc-card" href="isler.html?kategori=${cat}&subcat=${sc.id}">
        <span class="sc-card-num">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="sc-card-title">${sc.label}</h3>
        <p class="sc-card-desc">${sc.desc}</p>
        <span class="sc-card-go">İşleri gör →</span>
      </a>`
    ).join("");
  }

  function showSubcatBackBar() {
    const bar = document.getElementById("subcatBackBar");
    if (!bar) return;
    const sc = (SUBCATS[cat] || []).find((s) => s.id === activeSubcat);
    bar.hidden = false;
    bar.innerHTML =
      `<a class="sc-back" href="isler.html?kategori=${cat}">← ${meta.title || meta.label}</a>` +
      (sc ? `<span class="sc-back-sep">/</span><span class="sc-back-cur">${esc(sc.label)}</span>` : "");
  }

  // build rows
  function thumbHTML(w) {
    return w.image
      ? `<img src="${w.image}" alt="${esc(w.title)}"/>`
      : `<div class="ph-stripe"><span>görsel yok</span></div>`;
  }
  // small inline hint thumbnail beside the index (gradient + image if any)
  function hintHTML(w) {
    const inner = w.image
      ? `<img src="${w.image}" alt=""/>`
      : `<span class="wh-glyph">${esc(meta.label)}</span>`;
    return `<span class="w-hint">${inner}</span>`;
  }
  function rowHTML(w, i) {
    const idx = String(i + 1).padStart(2, "0");
    const tags = (w.tags || []).slice(0, 1).map((t) => `<span class="tg">${esc(t)}</span>`).join("");
    const yr = w.year ? `<span class="yr">${esc(w.year)}</span>` : "";
    return `<a class="work-row" href="#" data-i="${i}">
      <span class="w-lead"><span class="w-idx">${idx}</span>${hintHTML(w)}</span>
      <span class="w-name">${esc(w.title) || "Başlıksız"}</span>
      <span class="w-meta">${yr}${tags}<span class="w-go"><span class="w-go-txt">İşe git</span> →</span></span>
      <span class="w-thumb">${thumbHTML(w)}</span>
    </a>`;
  }

  function renderItems() {
    const real = loadWorks().filter((w) => w.cat === cat);
    isDemo = real.length === 0;
    const subcats = SUBCATS[cat] || [];

    // --- alt kategori kartları mı, işler listesi mi? ---
    if (subcats.length && !activeSubcat) {
      // Kart modu: alt kategori seçimi
      document.getElementById("subcatCards").hidden = false;
      document.getElementById("subcatBackBar").hidden = true;
      worksEl.hidden = true;
      emptyEl.hidden = true;
      document.getElementById("stage3d") && (document.getElementById("stage3d").hidden = true);
      document.getElementById("catCount").textContent = String(subcats.length).padStart(2, "0");
      document.getElementById("demoNote").hidden = true;
      showSubcatCards();
      // Başlığı güncelle
      document.getElementById("catDesc").textContent = "Aşağıdaki uzmanlık alanlarından birini seçin.";
      return;
    }

    // --- işler modu ---
    document.getElementById("subcatCards").hidden = true;
    if (subcats.length && activeSubcat) showSubcatBackBar();

    let filtered;
    if (isDemo) {
      filtered = DEMO[cat].map((d) => ({ title: d.title, year: d.year, tags: [d.tag], desc: "", image: "" }));
    } else if (activeSubcat) {
      // subcat eşleşenler + subcat atanmamış projeler (her kategoride görünür)
      filtered = real.filter((w) => !w.subcat || w.subcat === activeSubcat);
      // geçici mesaj: işler var ama bu alt kategoride henüz atanmamış
      if (!filtered.length) {
        filtered = [];
        const sc = (SUBCATS[cat] || []).find((s) => s.id === activeSubcat);
        emptyEl.querySelector && (emptyEl.querySelector("p").textContent =
          `"${sc ? sc.label : activeSubcat}" alt kategorisinde henüz proje bulunmuyor. Admin panelinden projelere alt kategori atayın.`);
      }
    } else {
      filtered = real;
    }
    items = filtered;
    document.getElementById("catCount").textContent = String(items.length).padStart(2, "0");
    document.getElementById("demoNote").hidden = !isDemo;

    // AI de artık subcat kartları gösteriyor — spline yok
    document.body.classList.remove("mode-ai");
    document.body.classList.remove("mode-3d");
    if (stage3d) { stage3d.destroy(); stage3d = null; }
    var st3 = document.getElementById("stage3d");
    if (st3) st3.hidden = true;

    if (!items.length) {
      worksEl.hidden = true;
      emptyEl.hidden = false;
      document.body.classList.remove("has-rows");
    } else {
      worksEl.hidden = false;
      emptyEl.hidden = true;
      worksEl.innerHTML = items.map(rowHTML).join("");
      document.body.classList.add("has-rows");
    }
  }
  let stage3d = null;
  renderItems();
  window.addEventListener("works-updated", renderItems);

  // owner-only edit button (only when admin is authed; visitors never see it)
  const editBtn = document.getElementById("islerEdit");
  function refreshEditBtn() {
    const authed = !!(window.studiobleurAdmin && window.studiobleurAdmin.isAuthed && window.studiobleurAdmin.isAuthed());
    if (editBtn) editBtn.hidden = !authed;
  }
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      if (window.studiobleurAdmin) window.studiobleurAdmin.open(cat);
    });
  }
  setTimeout(refreshEditBtn, 100);
  window.addEventListener("works-updated", refreshEditBtn);
  window.addEventListener("focus", refreshEditBtn);
  // when the admin overlay closes, re-check (owner may have just logged in)
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id && /admin(Close|Cancel|Login)/.test(e.target.id)) setTimeout(refreshEditBtn, 50);
  });

  /* ---------- cursor-following reveal image ---------- */
  const reveal = document.getElementById("revealImg");
  const revealInner = document.getElementById("revealInner");
  const cursor = document.getElementById("cursor");
  const fine = matchMedia("(pointer: fine)").matches;

  let mx = innerWidth / 2, my = innerHeight / 2;       // pointer
  let rx = mx, ry = my;                                 // reveal (lerped, laggy)
  let cx = mx, cy = my;                                 // cursor dot (snappier)

  if (fine) {
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
      reveal.style.left = rx + "px"; reveal.style.top = ry + "px";
      cursor.style.left = cx + "px"; cursor.style.top = cy + "px";
      requestAnimationFrame(loop);
    })();
  }

  worksEl.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".work-row");
    if (!row || !fine) return;
    worksEl.classList.add("hovering");
    const w = items[+row.dataset.i];
    revealInner.innerHTML = thumbHTML(w);
    reveal.classList.add("show");
    cursor.classList.add("big");
  });
  worksEl.addEventListener("pointerout", (e) => {
    const row = e.target.closest(".work-row");
    const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".work-row");
    if (row && !to) {
      worksEl.classList.remove("hovering");
      reveal.classList.remove("show");
      cursor.classList.remove("big");
    }
  });

  /* ---------- lightbox ---------- */
  const lb = document.getElementById("lightbox");
  const lbVisual = document.getElementById("lbVisual");
  const lbCat = document.getElementById("lbCat");
  const lbTitle = document.getElementById("lbTitle");
  const lbDesc = document.getElementById("lbDesc");
  const lbTags = document.getElementById("lbTags");
  const lbClose = document.getElementById("lbClose");

  function openLB(w) {
    lbVisual.innerHTML = thumbHTML(w);
    lbCat.innerHTML = meta.num + " — " + meta.label;
    lbTitle.textContent = w.title || "Başlıksız";
    lbDesc.textContent = w.desc || (isDemo ? "Örnek proje — gerçek vaka çalışması içeriği yönetim panelinden eklenebilir." : "");
    lbTags.innerHTML = (w.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // restore the real cursor inside the lightbox; hide the custom field cursor + reveal
    document.body.classList.add("lb-active");
    worksEl.classList.remove("hovering");
    reveal.classList.remove("show");
    if (cursor) cursor.classList.remove("big");
  }
  function closeLB() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove("lb-active");
  }
  worksEl.addEventListener("click", (e) => {
    const row = e.target.closest(".work-row");
    if (!row) return;
    e.preventDefault();
    const w = items[+row.dataset.i];
    if (w && w.id) {
      var backUrl = "isler.html?kategori=" + cat + (activeSubcat ? "&subcat=" + activeSubcat : "");
      location.href = "proje.html?id=" + encodeURIComponent(w.id) + "&back=" + encodeURIComponent(backUrl);
    } else {
      openLB(w);
    }
  });
  lbClose.addEventListener("click", closeLB);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeLB(); });
})();
