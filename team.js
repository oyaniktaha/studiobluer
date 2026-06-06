/* studiobleur — ekip kartları + CV modal
   Bağımlılık: team-data.js (window.STUDIOBLEUR_TEAM)
   LocalStorage: studiobleur_team_v1 */
(function () {
  "use strict";

  const LS_KEY = "studiobleur_team_v1";

  /* ---- veri ---- */
  window.StudioTeam = {
    load() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return (window.STUDIOBLEUR_TEAM || []).map((m) => Object.assign({}, m));
    },
    save(arr) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (_) {}
      window.dispatchEvent(new CustomEvent("team-updated"));
    },
    uid() { return "tm" + Math.random().toString(36).slice(2, 10); },
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
    );
  }

  /* ---- kart render ---- */
  function renderCards() {
    const container = document.getElementById("teamCards");
    if (!container) return;
    const members = window.StudioTeam.load();
    container.innerHTML = members.map((m, i) => `
      <button class="team-card${i === 1 ? " tc-offset" : ""}" data-id="${esc(m.id)}" aria-label="${esc(m.name)} — CV'yi aç">
        <div class="tc-photo">
          ${m.photo
            ? `<img src="${m.photo}" alt="${esc(m.name)}" />`
            : `<div class="tc-ph"><span class="ph-lbl">portre</span></div>`}
          <div class="tc-overlay"><span class="tc-cue">CV →</span></div>
        </div>
        <div class="tc-info">
          <span class="tc-name">${esc(m.name)}</span>
          <span class="tc-role">${esc(m.title)}</span>
        </div>
      </button>
    `).join("");

    container.querySelectorAll(".team-card").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.dataset.id));
    });
  }

  /* ---- modal ---- */
  function openModal(id) {
    const members = window.StudioTeam.load();
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const modal = document.getElementById("teamModal");
    const photoWrap = document.getElementById("teamModalPhotoWrap");
    const body = document.getElementById("teamModalBody");
    if (!modal || !photoWrap || !body) return;

    const skills = (m.skills || []).filter(Boolean);

    photoWrap.innerHTML = m.photo
      ? `<img class="tm-photo" src="${m.photo}" alt="${esc(m.name)}" />`
      : `<div class="tm-photo tc-ph"><span class="ph-lbl">portre</span></div>`;

    body.innerHTML = `
      <h3 class="tm-name">${esc(m.name)}</h3>
      <span class="tm-title">${esc(m.title)}</span>
      ${m.bio ? `<p class="tm-bio">${esc(m.bio)}</p>` : ""}
      ${m.school ? `<div class="tm-row"><span class="tm-lbl">Eğitim</span><span class="tm-val">${esc(m.school)}</span></div>` : ""}
      ${skills.length ? `<div class="tm-row"><span class="tm-lbl">Uzmanlık</span><div class="tm-tags">${skills.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>` : ""}
    `;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = document.getElementById("teamModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* ---- init ---- */
  function init() {
    renderCards();
    const closeBtn = document.getElementById("teamModalClose");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    const modal = document.getElementById("teamModal");
    if (modal) modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("team-updated", renderCards);
})();
