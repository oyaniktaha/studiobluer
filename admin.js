/* studiolume — GİZLİ YÖNETİM PANELİ (yalnızca site sahibi)
   Açmak için: adres çubuğuna #yonetim ekleyin  (örn. .../studiolume.html#yonetim)
              ya da klavyeden  Ctrl + Shift + Y
   Şifre: varsayılan 1234 — panelden değiştirebilirsiniz.
   Ziyaretçiler bu paneli göremez; sadece bu adresi/şifreyi bilen açar. */
(function () {
  "use strict";
  const PIN_KEY = "studiolume_admin_pin";
  const W = window.StudioWorks;
  if (!W) return;

  const CAT_LABEL = { uiux: "UI/UX", "3d": "3D", ai: "AI", product: "Product" };
  let activeCat = "uiux";
  let editingId = null;
  const ADMIN_SUBCATS = {
    uiux: [
      { id: "web",       label: "Web Sitesi Tasarımı" },
      { id: "mobil",     label: "Mobil Uygulama Tasarımı" },
      { id: "uikit",     label: "UI Kit Tasarımı" },
      { id: "otomasyon", label: "Otomasyon Arayüzü Tasarımı" },
    ],
    "3d": [
      { id: "mekan",    label: "İç ve Dış Mekan Tasarımı" },
      { id: "render",   label: "Render ve Görselleştirme" },
      { id: "2d",       label: "2D Mimari Çizimler" },
      { id: "katplani", label: "Kat Planı Renklendirme" },
    ],
    ai: [
      { id: "otomasyon", label: "AI Destekli Otomasyonlar",          desc: "İş süreçlerinizi ve operasyonlarınızı hızlandıracak yapay zeka entegrasyonları." },
      { id: "gorsel",    label: "AI ile Animasyon ve Görselleştirme", desc: "Yapay zeka araçlarından faydalanılarak üretilen hızlı ve yenilikçi görsel tasarım çözümleri." },
    ],
    product: [
      { id: "konsept",   label: "Konsept Ürün Tasarımı" },
      { id: "animasyon", label: "Ürün Animasyonu" },
      { id: "studio",    label: "Stüdyo Kalitesinde Görselleştirme" },
      { id: "lifestyle", label: "Mekan İçi Entegrasyon" },
      { id: "teknik",    label: "İmalat ve Teknik Çizimler" },
    ],
  };

  function updateSubcatOptions(cat, selectedVal) {
    const sel = overlay.querySelector("#adminSubcat");
    if (!sel) return;
    const opts = ADMIN_SUBCATS[cat] || [];
    sel.innerHTML = `<option value="">— Seçin (opsiyonel) —</option>` +
      opts.map((o) => `<option value="${o.id}"${selectedVal === o.id ? " selected" : ""}>${o.label}</option>`).join("");
    sel.closest(".admin-field").style.display = opts.length ? "" : "none";
  }

  let pendingImage = null; // base64 of currently picked image
  let pendingHeroVideo = null; // URL string or base64 GIF for hero of proje.html
  let pendingGallery = []; // [{ image: base64|null, caption: '' }, …]

  /* ---------- build DOM ---------- */
  const overlay = document.createElement("div");
  overlay.className = "admin-overlay";
  overlay.id = "adminOverlay";
  document.body.appendChild(overlay);

  const toast = document.createElement("div");
  toast.className = "admin-toast";
  document.body.appendChild(toast);
  let toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ── gallery helpers (module-level: used by bindForm / editWork / resetForm) ── */
  function setHeroThumb(src) {
    const t = overlay.querySelector("#adminHeroThumb");
    if (!t) return;
    t.innerHTML = ""; t.style.color = "";
    if (!src) { t.textContent = "gif"; return; }
    if (src.startsWith("data:image")) {
      const img = document.createElement("img");
      img.src = src; img.alt = "";
      img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:6px;display:block;";
      t.appendChild(img);
    } else {
      t.textContent = "✓"; t.style.color = "var(--lime)";
    }
  }

  function renderGalleryItems() {
    const el = overlay.querySelector("#adminGallery");
    if (!el) return;
    el.innerHTML = pendingGallery.map((g, i) => `
      <div class="ag-item" data-idx="${i}">
        <label class="ag-thumb-label" title="Tıkla — görsel seç / değiştir">
          <div class="ag-thumb">${g.image ? `<img src="${g.image}" alt=""/>` : `<span>${String(i + 1).padStart(2, "0")}</span>`}</div>
          <input type="file" accept="image/*" hidden class="ag-file" data-idx="${i}"/>
        </label>
        <input type="text" placeholder="Açıklama (opsiyonel)" class="ag-cap-input" data-idx="${i}" value="${escapeHtml(g.caption || "")}"/>
        <button type="button" class="btn-sm ag-del" data-idx="${i}">Sil</button>
      </div>`).join("");
    el.querySelectorAll(".ag-file").forEach((inp) => {
      inp.addEventListener("change", (e) => {
        const f = e.target.files && e.target.files[0];
        const idx = +inp.dataset.idx;
        if (!f || idx >= pendingGallery.length) return;
        const reader = new FileReader();
        reader.onload = () => downscale(reader.result, (b64) => {
          pendingGallery[idx] = { ...pendingGallery[idx], image: b64 };
          renderGalleryItems();
        });
        reader.readAsDataURL(f);
      });
    });
    el.querySelectorAll(".ag-cap-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const idx = +inp.dataset.idx;
        if (pendingGallery[idx]) pendingGallery[idx].caption = inp.value;
      });
    });
    el.querySelectorAll(".ag-del").forEach((btn) => {
      btn.addEventListener("click", () => {
        pendingGallery.splice(+btn.dataset.idx, 1);
        renderGalleryItems();
      });
    });
  }

  function gateHTML() {
    return `
      <div class="admin-gate">
        <h2>Yönetim Paneli</h2>
        <p>Devam etmek için şifrenizi girin.</p>
        <input type="password" id="adminPin" inputmode="numeric" placeholder="••••" autocomplete="off" />
        <div class="err" id="adminErr"></div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:6px;">
          <button class="btn-sm solid" id="adminLogin">Giriş</button>
          <button class="btn-sm" id="adminCancel">Kapat</button>
        </div>
      </div>`;
  }

  function panelHTML() {
    return `
      <div class="admin">
        <div class="admin-top">
          <h2><span class="badge">yönetim</span> İşlerim</h2>
          <button class="btn-sm" id="adminClose">Kapat ✕</button>
        </div>
        <div class="admin-sub">İşlerinizi ekleyin, düzenleyin, silin. Değişiklikler otomatik kaydedilir. Ziyaretçilere göstermek için <strong>Yayınla</strong> deyin.</div>

        <div class="admin-tabs" id="adminTabs"></div>

        <form class="admin-form" id="adminForm">
          <div class="admin-field full">
            <label>Görsel</label>
            <label class="admin-drop" id="adminDrop">
              <span class="thumb" id="adminThumb">görsel</span>
              <span id="adminDropTxt">Görsel seçmek için tıklayın veya sürükleyip bırakın (JPG/PNG)</span>
              <input type="file" id="adminFile" accept="image/*" hidden />
            </label>
          </div>
          <div class="admin-field">
            <label>Başlık</label>
            <input type="text" id="adminTitle" placeholder="Proje adı" />
          </div>
          <div class="admin-field">
            <label>Alt Kategori</label>
            <select id="adminSubcat">
              <option value="">— Seçin (opsiyonel) —</option>
            </select>
          </div>
          <div class="admin-field">
            <label>Etiketler (virgülle)</label>
            <input type="text" id="adminTags" placeholder="Web App, Figma" />
          </div>
          <div class="admin-field full">
            <label>Açıklama</label>
            <textarea id="adminDesc" rows="2" placeholder="Kısa açıklama"></textarea>
          </div>
          <div class="admin-field full">
            <label>Hero Video / GIF <span style="color:var(--faint);font-size:0.68rem;text-transform:none;letter-spacing:0;">— proje.html üst kısmı (16:9, loop)</span></label>
            <input type="url" id="adminHeroUrl" placeholder="Direkt .mp4 / .webm / .gif URL — YouTube da çalışır" />
            <label class="admin-drop" id="adminHeroDrop" style="margin-top:8px;">
              <span class="thumb" id="adminHeroThumb">gif</span>
              <span>GIF / video yükle (≤3 MB) — ya da üste URL yapıştırın</span>
              <input type="file" id="adminHeroFile" accept="image/gif,video/*" hidden />
            </label>
          </div>
          <div class="admin-field full">
            <label>Galeri <span style="color:var(--faint);font-size:0.68rem;text-transform:none;letter-spacing:0;">— fotoğraf + opsiyonel açıklama (min. 5 önerilir)</span></label>
            <div id="adminGallery" class="admin-gallery"></div>
            <button type="button" class="btn-sm" id="adminAddGallery" style="margin-top:10px;border-radius:9px;display:inline-flex;gap:6px;align-items:center;">+ Fotoğraf ekle</button>
          </div>
          <div class="admin-field full admin-actions">
            <button type="submit" class="btn-sm solid" id="adminSave">Ekle</button>
            <button type="button" class="btn-sm" id="adminNew" style="display:none;">Yeni iş</button>
            <span id="adminEditing" style="color:var(--muted);font-size:0.84rem;"></span>
          </div>
        </form>

        <div class="admin-list" id="adminList"></div>

        <div class="admin-foot">
          <div class="left">
            <button class="btn-sm solid" id="adminPublish">🚀 Yayınla (GitHub'a otomatik)</button>
            <button class="btn-sm" id="adminDownload">⬇ Dosya indir</button>
            <button class="btn-sm" id="adminImport">İçe aktar</button>
            <input type="file" id="adminImportFile" accept=".js,.json,application/json,text/javascript" hidden />
          </div>
          <div class="right">
            <button class="btn-sm" id="adminToken">GitHub Token</button>
            <button class="btn-sm" id="adminPin2">Şifre değiştir</button>
            <button class="btn-sm" id="adminReset">Yayındakine dön</button>
          </div>
        </div>
      </div>`;
  }

  /* ---------- open / close ---------- */
  function isAuthed() { return sessionStorage.getItem("studiolume_admin_ok") === "1"; }
  function getPin() { return localStorage.getItem(PIN_KEY) || "1234"; }

  function open() {
    overlay.classList.add("open");
    document.body.classList.add("modal-open");
    if (isAuthed()) renderPanel();
    else renderGate();
  }
  function close() {
    overlay.classList.remove("open");
    document.body.classList.remove("modal-open");
    if (location.hash === "#yonetim") history.replaceState(null, "", location.pathname + location.search);
  }

  function renderGate() {
    overlay.innerHTML = gateHTML();
    const pin = overlay.querySelector("#adminPin");
    const err = overlay.querySelector("#adminErr");
    pin.focus();
    const tryLogin = () => {
      if (pin.value === getPin()) {
        sessionStorage.setItem("studiolume_admin_ok", "1");
        renderPanel();
      } else {
        err.textContent = "Hatalı şifre.";
        pin.value = "";
        pin.focus();
      }
    };
    overlay.querySelector("#adminLogin").addEventListener("click", tryLogin);
    overlay.querySelector("#adminCancel").addEventListener("click", close);
    pin.addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });
  }

  /* ---------- panel ---------- */
  function renderPanel() {
    overlay.innerHTML = panelHTML();
    buildTabs();
    bindForm();
    renderList();
    updateSubcatOptions(activeCat, null);
    overlay.querySelector("#adminClose").addEventListener("click", close);
    overlay.querySelector("#adminPublish").addEventListener("click", publish);
    overlay.querySelector("#adminDownload").addEventListener("click", downloadOnly);
    overlay.querySelector("#adminToken").addEventListener("click", () => {
      const cur = localStorage.getItem(GH_TOKEN_KEY);
      const t = prompt(cur ? "Kayıtlı token var. Yeni token girin (boş bırakırsanız silinir):" : "GitHub Personal Access Token girin:", "");
      if (t === null) return;
      if (t.trim() === "") { localStorage.removeItem(GH_TOKEN_KEY); showToast("Token silindi."); }
      else { localStorage.setItem(GH_TOKEN_KEY, t.trim()); showToast("Token kaydedildi."); }
    });
    overlay.querySelector("#adminReset").addEventListener("click", () => {
      if (confirm("Tarayıcınızdaki düzenlemeler silinip yayındaki işler gösterilsin mi?")) {
        W.resetToPublished();
        renderList();
        showToast("Yayındaki işlere dönüldü.");
      }
    });
    overlay.querySelector("#adminPin2").addEventListener("click", changePin);
    const imp = overlay.querySelector("#adminImportFile");
    overlay.querySelector("#adminImport").addEventListener("click", () => imp.click());
    imp.addEventListener("change", importFile);
    window.addEventListener("works-updated", () => {
      if (overlay.classList.contains("open") && overlay.querySelector("#adminList")) renderList();
    });
  }

  function buildTabs() {
    const tabs = overlay.querySelector("#adminTabs");
    const allTabs = [...W.CATS, "ekip"];
    const tabLabels = { ...CAT_LABEL, ekip: "👥 Ekip" };
    tabs.innerHTML = allTabs.map(
      (c) => `<button class="admin-tab${c === activeCat ? " active" : ""}" data-cat="${c}">${tabLabels[c]}</button>`
    ).join("");
    tabs.querySelectorAll(".admin-tab").forEach((b) =>
      b.addEventListener("click", () => {
        activeCat = b.dataset.cat;
        resetForm();
        buildTabs();
        if (activeCat === "ekip") {
          overlay.querySelector("#adminForm").style.display = "none";
          overlay.querySelector("#adminList").innerHTML = "";
          renderTeamAdmin();
        } else {
          overlay.querySelector("#adminForm").style.display = "";
          overlay.querySelector("#adminTeamPanel") && overlay.querySelector("#adminTeamPanel").remove();
          renderList();
          updateSubcatOptions(activeCat, null);
        }
      })
    );
  }

  /* ---- team admin panel ---- */
  function renderTeamAdmin() {
    const list = overlay.querySelector("#adminList");
    const T = window.StudioTeam;
    if (!T) { list.innerHTML = `<div class="admin-empty">team.js yüklü değil.</div>`; return; }
    const members = T.load();

    let html = `<div id="adminTeamPanel">`;
    members.forEach((m, i) => {
      html += `
        <div class="admin-team-member" data-tid="${m.id}">
          <div class="atm-head">
            <label class="admin-drop atm-photo-label" title="Fotoğraf seç">
              <span class="thumb atm-thumb" id="atmThumb_${m.id}">${m.photo ? `<img src="${m.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"/>` : "📷"}</span>
              <span>Fotoğraf yükle</span>
              <input type="file" accept="image/*" class="atm-photo-file" data-tid="${m.id}" hidden />
            </label>
            <div class="atm-fields">
              <div class="admin-field"><label>İsim</label><input type="text" class="atm-name" data-tid="${m.id}" value="${m.name || ""}"/></div>
              <div class="admin-field"><label>Ünvan / Rol</label><input type="text" class="atm-title" data-tid="${m.id}" value="${m.title || ""}"/></div>
            </div>
          </div>
          <div class="admin-field"><label>Bio</label><textarea class="atm-bio" data-tid="${m.id}" rows="3" placeholder="Kısa özgeçmiş...">${m.bio || ""}</textarea></div>
          <div class="admin-field"><label>Eğitim / Okul</label><input type="text" class="atm-school" data-tid="${m.id}" placeholder="Ör: Bilkent Üniversitesi, Endüstri Tasarımı" value="${m.school || ""}"/></div>
          <div class="admin-field"><label>Uzmanlıklar <span style="color:var(--faint);text-transform:none;letter-spacing:0;font-size:0.68rem;">virgülle ayır</span></label><input type="text" class="atm-skills" data-tid="${m.id}" placeholder="UI/UX, Figma, Prototipler" value="${(m.skills||[]).join(", ")}"/></div>
          <button type="button" class="btn-sm solid atm-save" data-tid="${m.id}" style="margin-top:6px;">Kaydet</button>
        </div>
        ${i < members.length - 1 ? '<hr style="border:none;border-top:1px solid var(--line);margin:28px 0;"/>' : ""}
      `;
    });
    html += `</div>`;
    list.innerHTML = html;

    // photo upload
    list.querySelectorAll(".atm-photo-file").forEach((inp) => {
      inp.addEventListener("change", (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        downscale(URL.createObjectURL(f), (b64) => {
          const tid = inp.dataset.tid;
          const thumb = overlay.querySelector(`#atmThumb_${tid}`);
          if (thumb) thumb.innerHTML = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"/>`;
          inp._pending = b64;
        });
      });
    });

    // save
    list.querySelectorAll(".atm-save").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tid = btn.dataset.tid;
        const members2 = T.load();
        const m = members2.find((x) => x.id === tid);
        if (!m) return;
        const nameEl   = overlay.querySelector(`.atm-name[data-tid="${tid}"]`);
        const titleEl  = overlay.querySelector(`.atm-title[data-tid="${tid}"]`);
        const bioEl    = overlay.querySelector(`.atm-bio[data-tid="${tid}"]`);
        const schoolEl = overlay.querySelector(`.atm-school[data-tid="${tid}"]`);
        const skillsEl = overlay.querySelector(`.atm-skills[data-tid="${tid}"]`);
        const photoInp = overlay.querySelector(`.atm-photo-file[data-tid="${tid}"]`);
        m.name   = nameEl ? nameEl.value.trim() : m.name;
        m.title  = titleEl ? titleEl.value.trim() : m.title;
        m.bio    = bioEl ? bioEl.value.trim() : m.bio;
        m.school = schoolEl ? schoolEl.value.trim() : m.school;
        m.skills = skillsEl ? skillsEl.value.split(",").map((s) => s.trim()).filter(Boolean) : m.skills;
        if (photoInp && photoInp._pending) m.photo = photoInp._pending;
        T.save(members2);
        showToast("Ekip üyesi kaydedildi ✓");
      });
    });
  }

  function setThumb(b64) {
    const thumb = overlay.querySelector("#adminThumb");
    if (b64) thumb.innerHTML = `<img src="${b64}" alt=""/>`;
    else thumb.textContent = "görsel";
  }

  function bindForm() {
    const form = overlay.querySelector("#adminForm");
    const file = overlay.querySelector("#adminFile");
    const drop = overlay.querySelector("#adminDrop");

    file.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) handleImage(f);
    });
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.style.borderColor = "var(--lime)"; });
    drop.addEventListener("dragleave", () => { drop.style.borderColor = ""; });
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.style.borderColor = "";
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) handleImage(f);
    });

    // ---- hero video binding ----
    const heroUrlInp = overlay.querySelector("#adminHeroUrl");
    const heroFileInp = overlay.querySelector("#adminHeroFile");
    const adminHeroDrop = overlay.querySelector("#adminHeroDrop");
    if (heroUrlInp) heroUrlInp.addEventListener("input", () => {
      pendingHeroVideo = null;
      setHeroThumb(heroUrlInp.value.trim() || null);
    });
    if (heroFileInp) heroFileInp.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        pendingHeroVideo = reader.result;
        if (heroUrlInp) heroUrlInp.value = "";
        setHeroThumb(pendingHeroVideo);
      };
      reader.readAsDataURL(f);
    });
    if (adminHeroDrop) {
      adminHeroDrop.addEventListener("dragover", (e) => { e.preventDefault(); adminHeroDrop.style.borderColor = "var(--lime)"; });
      adminHeroDrop.addEventListener("dragleave", () => { adminHeroDrop.style.borderColor = ""; });
      adminHeroDrop.addEventListener("drop", (e) => {
        e.preventDefault(); adminHeroDrop.style.borderColor = "";
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
          pendingHeroVideo = reader.result;
          if (heroUrlInp) heroUrlInp.value = "";
          setHeroThumb(pendingHeroVideo);
        };
        reader.readAsDataURL(f);
      });
    }
    // ---- gallery binding ----
    const addGalleryBtn = overlay.querySelector("#adminAddGallery");
    if (addGalleryBtn) addGalleryBtn.addEventListener("click", () => {
      pendingGallery.push({ image: null, caption: "" });
      renderGalleryItems();
    });
    renderGalleryItems();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      saveWork();
    });
    overlay.querySelector("#adminNew").addEventListener("click", resetForm);
  }

  function handleImage(file) {
    const reader = new FileReader();
    reader.onload = () => downscale(reader.result, (b64) => { pendingImage = b64; setThumb(b64); });
    reader.readAsDataURL(file);
  }
  function downscale(dataUrl, cb) {
    const img = new Image();
    img.onload = () => {
      const max = 1280;
      let { width: w, height: h } = img;
      if (w > max || h > max) {
        if (w >= h) { h = Math.round((h * max) / w); w = max; }
        else { w = Math.round((w * max) / h); h = max; }
      }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      cb(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => cb(dataUrl);
    img.src = dataUrl;
  }

  function resetForm() {
    editingId = null;
    pendingImage = null;
    pendingHeroVideo = null;
    pendingGallery = [];
    const f = overlay.querySelector("#adminForm");
    f.reset();
    setThumb(null);
    setHeroThumb(null);
    renderGalleryItems();
    updateSubcatOptions(activeCat, null);
    overlay.querySelector("#adminSave").textContent = "Ekle";
    overlay.querySelector("#adminNew").style.display = "none";
    overlay.querySelector("#adminEditing").textContent = "";
  }

  function saveWork() {
    const title = overlay.querySelector("#adminTitle").value.trim();
    const desc = overlay.querySelector("#adminDesc").value.trim();
    const subcat = (overlay.querySelector("#adminSubcat") && overlay.querySelector("#adminSubcat").value) || "";
    const tags = overlay.querySelector("#adminTags").value
      .split(",").map((t) => t.trim()).filter(Boolean);
    if (!title && !pendingImage) { showToast("En az başlık veya görsel ekleyin."); return; }

    const all = W.load();
    if (editingId) {
      const w = all.find((x) => x.id === editingId);
      if (w) {
        w.title = title; w.desc = desc; w.tags = tags;
        if (pendingImage) w.image = pendingImage;
        const heroUrlSv = overlay.querySelector("#adminHeroUrl");
        const hv = (heroUrlSv && heroUrlSv.value.trim()) || pendingHeroVideo || null;
        w.heroVideo = hv;
        w.subcat = subcat;
        w.gallery = pendingGallery.filter((g) => g.image);
      }
    } else {
      const heroUrlSv = overlay.querySelector("#adminHeroUrl");
      const hv = (heroUrlSv && heroUrlSv.value.trim()) || pendingHeroVideo || null;
      all.push({ id: W.uid(), cat: activeCat, subcat, title, desc, tags, image: pendingImage || null, heroVideo: hv, gallery: pendingGallery.filter((g) => g.image) });
    }
    if (W.save(all)) {
      resetForm();
      renderList();
      showToast(editingId ? "Güncellendi." : "İş eklendi.");
    }
  }

  function editWork(id) {
    const w = W.load().find((x) => x.id === id);
    if (!w) return;
    editingId = id;
    pendingImage = null;
    overlay.querySelector("#adminTitle").value = w.title || "";
    overlay.querySelector("#adminDesc").value = w.desc || "";
    overlay.querySelector("#adminTags").value = (w.tags || []).join(", ");
    setThumb(w.image || null);
    // hero video
    pendingHeroVideo = null;
    const heroUrlEl = overlay.querySelector("#adminHeroUrl");
    if (heroUrlEl) {
      if (w.heroVideo && w.heroVideo.startsWith("data:")) {
        pendingHeroVideo = w.heroVideo; heroUrlEl.value = "";
      } else {
        heroUrlEl.value = w.heroVideo || "";
      }
    }
    setHeroThumb(w.heroVideo || null);
    updateSubcatOptions(w.cat || activeCat, w.subcat || null);
    // gallery
    pendingGallery = Array.isArray(w.gallery)
      ? w.gallery.map((g) => ({ image: g.image || null, caption: g.caption || "" }))
      : [];
    renderGalleryItems();
    overlay.querySelector("#adminSave").textContent = "Kaydet";
    overlay.querySelector("#adminNew").style.display = "";
    overlay.querySelector("#adminEditing").textContent = "düzenleniyor…";
  }

  function delWork(id) {
    if (!confirm("Bu iş silinsin mi?")) return;
    const all = W.load().filter((x) => x.id !== id);
    W.save(all);
    if (editingId === id) resetForm();
    renderList();
    showToast("Silindi.");
  }

  function renderList() {
    const list = overlay.querySelector("#adminList");
    const items = W.load().filter((w) => w.cat === activeCat);
    if (!items.length) {
      list.innerHTML = `<div class="admin-empty">Bu kategoride henüz iş yok. Yukarıdan ekleyin.</div>`;
      return;
    }
    list.innerHTML = items
      .map((w) => `
        <div class="admin-item" data-id="${w.id}">
          <span class="ai-thumb">${w.image ? `<img src="${w.image}" alt=""/>` : "yok"}</span>
          <div class="ai-meta">
            <div class="t">${escapeHtml(w.title) || "Başlıksız"}</div>
            <div class="d">${escapeHtml(w.desc) || "—"}</div>
          </div>
          <button class="btn-sm ai-edit">Düzenle</button>
          <button class="ai-del">Sil</button>
        </div>`)
      .join("");
    list.querySelectorAll(".admin-item").forEach((el) => {
      const id = el.dataset.id;
      el.querySelector(".ai-edit").addEventListener("click", () => editWork(id));
      el.querySelector(".ai-del").addEventListener("click", () => delWork(id));
    });
  }
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ---------- publish / import / pin ---------- */
  var GH_OWNER = "oyaniktaha";
  var GH_REPO = "studiobluer";
  var GH_BRANCH = "main";
  var GH_PATH = "works-data.js";
  var GH_TOKEN_KEY = "studiolume_gh_token";

  function buildContent() {
    const works = W.load();
    return "/* studiolume — YAYINLANMIŞ İŞLER (yönetim panelinden üretildi) */\n" +
           "window.STUDIOLUME_WORKS = " + JSON.stringify(works, null, 2) + ";\n";
  }

  function buildTeamContent() {
    const T = window.StudioTeam;
    const members = T ? T.load() : (window.STUDIOBLEUR_TEAM || []);
    return "/* studiobleur — EKİP VERİSİ (yönetim panelinden üretildi) */\n" +
           "window.STUDIOBLEUR_TEAM = " + JSON.stringify(members, null, 2) + ";\n";
  }

  // UTF-8 güvenli base64 (Türkçe karakterler için)
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function getToken() {
    let t = localStorage.getItem(GH_TOKEN_KEY);
    if (!t) {
      t = prompt("GitHub Personal Access Token girin (sadece bu tarayıcıda saklanır):");
      if (t) { t = t.trim(); localStorage.setItem(GH_TOKEN_KEY, t); }
    }
    return t;
  }

  async function pushFile(token, path, content, message) {
    const apiUrl = "https://api.github.com/repos/" + GH_OWNER + "/" + GH_REPO + "/contents/" + path;
    const headers = { "Authorization": "token " + token, "Accept": "application/vnd.github+json" };
    let sha = null;
    const getRes = await fetch(apiUrl + "?ref=" + GH_BRANCH, { headers });
    if (getRes.status === 200) { sha = (await getRes.json()).sha; }
    else if (getRes.status === 401) { throw new Error("TOKEN_INVALID"); }
    const putRes = await fetch(apiUrl, {
      method: "PUT", headers,
      body: JSON.stringify({ message, content: utf8ToBase64(content), branch: GH_BRANCH, sha: sha || undefined })
    });
    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.message || putRes.status);
    }
    return true;
  }

  async function publish() {
    const token = getToken();
    if (!token) { showToast("Token girilmedi — yayınlanamadı."); return; }

    showToast("GitHub'a gönderiliyor…");
    const ts = new Date().toLocaleString("tr-TR");

    try {
      await pushFile(token, "works-data.js",  buildContent(),     "İşler güncellendi — " + ts);
      await pushFile(token, "team-data.js",   buildTeamContent(), "Ekip güncellendi — " + ts);
      showToast("✓ Yayınlandı! 30 sn içinde canlıda.");
    } catch (e) {
      if (e.message === "TOKEN_INVALID") {
        localStorage.removeItem(GH_TOKEN_KEY);
        showToast("Token geçersiz — silindi, tekrar deneyin.");
        return;
      }
      showToast("Hata: " + e.message + " — dosyalar indiriliyor.");
      downloadFallback(buildContent());
    }
  }

  function downloadFallback(content) {
    const blob = new Blob([content], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "works-data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function downloadOnly() {
    downloadFallback(buildContent());
    showToast("works-data.js indirildi.");
  }

  function importFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let txt = String(reader.result).trim();
        const i = txt.indexOf("[");
        const j = txt.lastIndexOf("]");
        const json = i !== -1 && j !== -1 ? txt.slice(i, j + 1) : txt;
        const arr = JSON.parse(json);
        if (!Array.isArray(arr)) throw new Error("dizi değil");
        W.save(arr);
        renderList();
        showToast("İçe aktarıldı.");
      } catch (err) {
        showToast("Dosya okunamadı.");
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  }

  function changePin() {
    const cur = prompt("Mevcut şifre:");
    if (cur === null) return;
    if (cur !== getPin()) { showToast("Mevcut şifre hatalı."); return; }
    const nw = prompt("Yeni şifre (en az 4 hane):");
    if (!nw || nw.length < 4) { showToast("Şifre çok kısa."); return; }
    localStorage.setItem(PIN_KEY, nw);
    showToast("Şifre güncellendi.");
  }

  /* ---------- triggers ---------- */
  // Dışarıdan açmak için (örn. işler sayfasındaki "düzenle" butonu)
  window.studiobleurAdmin = {
    open: (cat) => { if (cat && W.CATS.includes(cat)) activeCat = cat; open(); },
    isAuthed,
  };
  if (location.hash === "#yonetim") setTimeout(open, 60);
  window.addEventListener("hashchange", () => { if (location.hash === "#yonetim") open(); });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "Y" || e.key === "y")) { e.preventDefault(); open(); }
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });

  /* ---- tablet erişim butonu (gizli floating ikon) ---- */
  const tabBtn = document.createElement("button");
  tabBtn.id = "adminTabBtn";
  tabBtn.setAttribute("aria-label", "Yönetim panelini aç");
  tabBtn.innerHTML = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18"><circle cx="10" cy="10" r="3"/><path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.22 3.22l1.42 1.42M15.36 15.36l1.42 1.42M3.22 16.78l1.42-1.42M15.36 4.64l1.42-1.42"/></svg>`;
  document.body.appendChild(tabBtn);

  // 5-parmak-dokunuş veya 3 saniye uzun basış ile de aç (tablet için)
  let holdTimer = null;
  tabBtn.addEventListener("pointerdown", () => { holdTimer = setTimeout(open, 0); });
  tabBtn.addEventListener("pointerup", () => clearTimeout(holdTimer));
  tabBtn.addEventListener("click", open);
})();
