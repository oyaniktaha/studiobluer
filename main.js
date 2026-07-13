/* studiolume — interactions (hero 3D lives in hero3d.js) */
(() => {
  "use strict";

  /* ---- Spline card spotlight + loader ---- */
  const splineCard = document.getElementById("splineCard");
  const splineGlow = document.getElementById("splineGlow");
  if (splineCard && splineGlow) {
    splineCard.addEventListener("mousemove", (e) => {
      const r = splineCard.getBoundingClientRect();
      splineGlow.style.setProperty("--mx", (e.clientX - r.left) + "px");
      splineGlow.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }
  const splineViewer = document.getElementById("splineViewer");
  const splineLoader = document.getElementById("splineLoader");
  if (splineViewer && splineLoader) {
    splineViewer.addEventListener("load", () => splineLoader.classList.add("gone"));
    setTimeout(() => splineLoader.classList.add("gone"), 8000); // fallback
  }

  /* ---- nav background on scroll ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile hamburger menu ---- */
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    const closeMenu = () => {
      menuBtn.classList.remove("open");
      mobileMenu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
    };
    menuBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      menuBtn.classList.toggle("open", isOpen);
      menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.classList.toggle("menu-open", isOpen);
    });
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* ---- scroll reveal ---- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---- count-up stats ---- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suf = el.dataset.suf || "";
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target) + suf;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          statIo.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => statIo.observe(el));

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      if (open) {
        item.classList.remove("open");
        a.style.maxHeight = null;
      } else {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---- project modal (service cards) ---- */
  const modal = document.getElementById("projectModal");
  if (modal) {
    const panels = modal.querySelectorAll(".modal-panel");
    const closeBtn = document.getElementById("modalClose");
    let lastFocus = null;

    const openModal = (key) => {
      panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === key));
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      modal.scrollTop = 0;
      if (closeBtn) closeBtn.focus();
    };
    const closeModal = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocus) lastFocus.focus();
    };

    document.querySelectorAll(".service[data-service]").forEach((card) => {
      const open = () => { lastFocus = card; openModal(card.dataset.service); };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });

    // expose for the cosmos field tiles
    window.__openProjectModal = (key, origin) => { lastFocus = origin || null; openModal(key); };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    modal.querySelectorAll("[data-close-modal]").forEach((el) =>
      el.addEventListener("click", closeModal)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---- marquee: JS-driven seamless loop (works under reduced-motion too) ---- */
  const mWrap = document.querySelector(".marquee");
  const mTrack = document.querySelector(".marquee-track");
  if (mWrap && mTrack) {
    let x = 0, lastT = 0, paused = false;
    mWrap.addEventListener("mouseenter", () => { paused = true; });
    mWrap.addEventListener("mouseleave", () => { paused = false; });
    const baseSpeed = 62; // px per second
    const step = (t) => {
      if (!lastT) lastT = t;
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      if (!paused) {
        const calm = document.body.classList.contains("calm");
        x -= baseSpeed * (calm ? 0.45 : 1) * dt;
        const half = mTrack.scrollWidth / 2;
        if (half > 0 && -x >= half) x += half;
        mTrack.style.transform = `translateX(${x.toFixed(2)}px)`;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---- site-wide parallax (scroll-driven depth) ---- */
  const targets = [];
  const add = (sel, sp, perIndex) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      targets.push([el, perIndex ? perIndex(i) : sp]);
    });
  };
  add(".section-head .eyebrow", 0.10);
  add(".section-head h2", 0.05);
  add(".section-head p", 0.03);
  add(".service .ico", 0.07, (i) => 0.05 + i * 0.03);
  add(".stat .big", 0.07, (i) => 0.04 + i * 0.025);
  add(".step", 0.05, (i) => 0.03 + i * 0.022);
  add(".about-visual", -0.06);
  add(".about-copy .team", 0.05);
  add(".quote .mark", 0.11);
  add(".cta h2", 0.08);
  add(".cta p", 0.05);
  add(".footer-top", 0.03);

  if (targets.length) {
    let tick = false;
    const update = () => {
      const vh = window.innerHeight;
      for (const [el, sp] of targets) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const d = r.top + r.height / 2 - vh / 2;
        let ty = -d * sp;
        ty = Math.max(-90, Math.min(90, ty));
        el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
      }
      tick = false;
    };
    window.addEventListener("scroll", () => {
      if (!tick) { tick = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- HERO dönen kart şeridi (işlerden görseller, video gibi, tıklanmaz) ---- */
  (function heroStrip() {
    const rowA = document.getElementById("heroRowA");
    const rowB = document.getElementById("heroRowB");
    if (!rowA || !rowB) return;

    const CAT = {
      uiux:    { label: "UI/UX",   c: "var(--lime)",   glow: "var(--lime-glow)" },
      "3d":    { label: "3D",      c: "var(--sky)",    glow: "oklch(0.74 0.14 233 / 0.4)" },
      ai:      { label: "AI",      c: "var(--violet)", glow: "var(--violet-glow)" },
      product: { label: "Ürün",    c: "var(--coral)",  glow: "oklch(0.74 0.2 32 / 0.4)" },
    };

    function collect() {
      let works = [];
      try {
        if (window.StudioWorks && typeof window.StudioWorks.load === "function") works = window.StudioWorks.load() || [];
      } catch (e) {}
      if (!works.length && Array.isArray(window.STUDIOLUME_WORKS)) works = window.STUDIOLUME_WORKS;
      // görseli olan işleri al (ana görsel veya galeri ilk kare)
      const cards = [];
      works.forEach((w) => {
        const img = w.image || (Array.isArray(w.gallery) && w.gallery[0] && w.gallery[0].image);
        if (img && CAT[w.cat]) cards.push({ img, cat: w.cat });
      });
      return cards;
    }

    function placeholders() {
      // iş yoksa: 4 kategori renkli kart (görselsiz, sadece fikir versin)
      return ["uiux", "3d", "ai", "product", "uiux", "3d", "ai", "product"].map((c) => ({ img: null, cat: c }));
    }

    function makeCard(item) {
      const meta = CAT[item.cat] || CAT.uiux;
      const el = document.createElement("div");
      el.className = "hero-card";
      el.style.setProperty("--hc-c", meta.c);
      el.style.setProperty("--hc-glow", meta.glow);
      if (item.img) {
        const im = document.createElement("img");
        im.loading = "lazy";
        im.decoding = "async";
        im.alt = "";
        im.src = item.img;
        el.appendChild(im);
      } else {
        const ph = document.createElement("div");
        ph.className = "hc-ph";
        el.appendChild(ph);
      }
      const cat = document.createElement("span");
      cat.className = "hc-cat";
      cat.textContent = meta.label;
      el.appendChild(cat);
      return el;
    }

    function build() {
      let cards = collect();
      if (cards.length < 5) cards = cards.concat(placeholders());
      // en az 6 kart, kesintisiz döngü için her satırda 2 kopya
      const a = cards.slice();
      const b = cards.slice().reverse();
      rowA.innerHTML = "";
      rowB.innerHTML = "";
      [...a, ...a].forEach((it) => rowA.appendChild(makeCard(it)));
      [...b, ...b].forEach((it) => rowB.appendChild(makeCard(it)));
    }

    build();
    // IndexedDB hydrate edince (gerçek işler gelince) yeniden kur
    let rebuilt = false;
    window.addEventListener("works-updated", () => {
      if (rebuilt) return;
      rebuilt = true;
      build();
    });
  })();
})();
