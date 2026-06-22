/* studiobleur — 3D İŞLER GALERİSİ (statik grid)
   Projeler alt alta / yan yana grid olarak dizilir. Kayma yok.
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

    const track = root.querySelector("#track3d");
    const hint = root.querySelector("#s3Hint");
    if (hint) hint.hidden = true;     // kayma ipucu artık gerekmiyor
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
        if (w && w.id) {
          location.href = "proje.html?id=" + encodeURIComponent(w.id);
        } else if (openLB) {
          openLB(w);
        }
      });
      return el;
    }

    const frag = document.createDocumentFragment();
    baseItems.forEach((w, i) => frag.appendChild(makeCard(w, i + 1)));
    track.appendChild(frag);

    return {
      destroy() {
        track.innerHTML = "";
        root.hidden = true;
      },
    };
  };
})();
