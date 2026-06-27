/* studiobleur — proje detay sayfası mantığı
   URL: proje.html?id=<workId>
   - Projeyi StudioWorks'ten yükler (yayınlı + localStorage)
   - Hero video/GIF'i render eder (URL, YouTube iframe, base64)
   - Galeri karelerini + opsiyonel açıklamalarını oluşturur
   - Admin floating edit butonu (sadece giriş yapılınca görünür) */
(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const META = {
    uiux:    { num: "01", label: "UI/UX",   color: "var(--lime)" },
    "3d":    { num: "02", label: "3D",       color: "var(--coral)" },
    ai:      { num: "03", label: "AI",       color: "var(--violet)" },
    product: { num: "04", label: "Product",  color: "var(--sky)" },
  };

  function loadWork() {
    // YAYINLANMIŞ veri ana kaynak; ?draft=1 ile admin yerel taslağı önizler
    const wantDraft = new URLSearchParams(location.search).get("draft") === "1";
    const baked = Array.isArray(window.STUDIOLUME_WORKS) ? window.STUDIOLUME_WORKS : [];
    if (!wantDraft && baked.length) {
      const found = baked.find(function (w) { return w.id === id; });
      if (found) return found;
    }
    if (window.StudioWorks) {
      const w = window.StudioWorks.load().find(function (w) { return w.id === id; });
      if (w) return w;
    }
    return baked.find(function (w) { return w.id === id; }) || null;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }

  function heroMarkup(src) {
    if (!src) return "";
    // YouTube
    var ytM = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytM) {
      var vid = ytM[1];
      return '<iframe src="https://www.youtube.com/embed/' + vid +
        '?autoplay=1&mute=1&loop=1&playlist=' + vid +
        '&controls=0&rel=0&playsinline=1" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    }
    // data URI or .gif
    if (/^data:image\/gif|\.gif($|\?)/i.test(src) || /^data:image\//.test(src)) {
      return '<img class="hero-media-el" src="' + src + '" alt="Hero" />';
    }
    // video file
    return '<video autoplay loop muted playsinline preload="auto"><source src="' + esc(src) + '" /></video>';
  }

  function render() {
    var w = loadWork();

    if (!w) {
      document.title = "Proje bulunamadı — studiobleur";
      var t = document.getElementById("projeTitle");
      if (t) t.textContent = "Proje bulunamadı.";
      var d = document.getElementById("projeDesc");
      if (d) d.textContent = "Bu proje mevcut değil ya da kaldırılmış.";
      return;
    }

    var m = META[w.cat] || META.uiux;
    document.documentElement.style.setProperty("--cat", m.color);
    document.title = (w.title || "Proje") + " — studiobleur";

    // nav + back links
    var backUrl = new URLSearchParams(location.search).get("back") ||
      ("isler.html?kategori=" + (w.cat || "uiux"));
    var backBtn = document.getElementById("backBtn");
    if (backBtn) backBtn.href = backUrl;
    var footBack = document.getElementById("footBack");
    if (footBack) footBack.href = backUrl;
    var pnavCat = document.getElementById("pnavCat");
    if (pnavCat) pnavCat.textContent = m.label;

    // hero video kaldırıldı

    // project info
    var catEl = document.getElementById("projeCat");
    if (catEl) catEl.textContent = m.num + " — " + m.label;

    var titleEl = document.getElementById("projeTitle");
    if (titleEl) titleEl.textContent = w.title || "Başlıksız";

    var yearEl = document.getElementById("projeYear");
    if (yearEl && w.year) { yearEl.textContent = w.year; yearEl.hidden = false; }

    var tagsEl = document.getElementById("projeTags");
    if (tagsEl) tagsEl.innerHTML = (w.tags || []).map(function (t) {
      return "<span>" + esc(t) + "</span>";
    }).join("");

    var descEl = document.getElementById("projeDesc");
    if (descEl) descEl.textContent = w.desc || "";

    // gallery
    var gallery = Array.isArray(w.gallery) ? w.gallery.filter(function (g) { return g && g.image; }) : [];
    var emptyEl = document.getElementById("galleryEmpty");
    var framesEl = document.getElementById("galleryFrames");
    var galleryLbl = document.getElementById("galleryLabel");
    var isMobile = false; // telefon prototip modu kapalı — tüm işler standart galeri

    if (emptyEl) emptyEl.hidden = gallery.length > 0;

    if (framesEl && gallery.length) {
      if (galleryLbl) galleryLbl.textContent = "Galeri — " + gallery.length + " ekran";

      if (isMobile) {
        document.querySelector(".proje-gallery").classList.add("gallery-phone-mode");
        framesEl.classList.add("g-phones");

        var n = gallery.length;
        var RADIUS = Math.max(380, n * 85);
        var ANG = 360 / n;

        var phoneHTML = gallery.map(function(g, i) {
          return '<div class="circ-item" data-idx="' + i + '" style="transform:rotateY(' + (i*ANG) + 'deg) translateZ(' + RADIUS + 'px)">' +
            '<div class="g-phone-body">' +
              '<div class="g-phone-edge-left"></div>' +
              '<div class="g-phone-edge-right"></div>' +
              '<div class="g-phone-edge-top"></div>' +
              '<div class="g-phone-edge-bottom"></div>' +
              '<div class="g-pb-side left">' +
                '<div class="g-pb-btn action"></div>' +
                '<div class="g-pb-btn vol"></div>' +
                '<div class="g-pb-btn vol"></div>' +
              '</div>' +
              '<div class="g-pb-side right">' +
                '<div class="g-pb-btn power"></div>' +
                '<div class="g-pb-btn camctrl"></div>' +
              '</div>' +
              '<div class="g-phone-screen">' +
                '<div class="g-phone-island"></div>' +
                '<div class="g-phone-display">' +
                  '<img src="' + g.image + '" alt="' + esc(g.caption||'Ekran '+(i+1)) + '" draggable="false"/>' +
                  '<div class="g-scroll-hint"><span>↕</span> kaydır</div>' +
                '</div>' +
                '<div class="g-phone-homebar"></div>' +
              '</div>' +
            '</div>' +
            '<p class="circ-cap">' + esc(g.caption||'') + '</p>' +
          '</div>';
        }).join('');

        framesEl.innerHTML =
          '<div class="circ-scroll-notice"><span class="csn-icon">↕</span> Ekranları sol tık basılı tutarak sürükleyerek kaydırabilirsiniz</div>' +
          '<div class="circ-gallery" id="circGallery">' +
            '<div class="circ-hint">↔ sürükle · kaydır</div>' +
            '<div class="circ-scene" id="circScene">' + phoneHTML + '</div>' +
          '</div>' +
          '<div class="g-phones-dots" id="phoneDots">' +
            gallery.map(function(_,i){ return '<button class="g-dot'+(i===0?' active':'')+'" data-goto="'+i+'"></button>'; }).join('') +
          '</div>';

        setTimeout(function() {
          var gallery2 = document.getElementById("circGallery");
          var scene   = document.getElementById("circScene");
          var dots    = document.querySelectorAll(".g-dot");
          var items   = scene.querySelectorAll(".circ-item");
          var rot = 0, targetRot = 0, veloc = 0;
          var dragActive = false, dragStartX = 0, dragStartRot = 0;
          var rafId;

          function updateScene() {
            scene.style.transform = "rotateY(" + rot + "deg)";
            items.forEach(function(item, i) {
              var rel = ((i * ANG + rot) % 360 + 360) % 360;
              var norm = rel > 180 ? 360 - rel : rel;
              var op = Math.max(0.18, 1 - norm / 160);
              var sc = Math.max(0.72, 1 - norm / 520);
              item.style.opacity = op;
              item.style.transform = "rotateY("+(i*ANG)+"deg) translateZ("+RADIUS+"px) scale("+sc+")";
            });
            var front = Math.round(((-rot / ANG) % n + n * 100) % n) % n;
            dots.forEach(function(d,i){ d.classList.toggle("active", i===front); });
          }

          function frame() {
            if (!dragActive) {
              veloc += (targetRot - rot) * 0.06;
              veloc *= 0.88;
              targetRot += 0.018; // auto-rotate
              rot += veloc + 0.018;
            }
            updateScene();
            rafId = requestAnimationFrame(frame);
          }

          // Telefon ekranı — sol click + sürükleme ile scroll
          scene.querySelectorAll(".g-phone-display").forEach(function(display) {
            var isDown = false, startY = 0, startScroll = 0;
            display.addEventListener("mousedown", function(e) {
              isDown = true; startY = e.clientY; startScroll = display.scrollTop;
              display.style.cursor = "ns-resize"; e.stopPropagation(); e.preventDefault();
            });
            document.addEventListener("mousemove", function(e) {
              if (!isDown) return;
              display.scrollTop = startScroll - (e.clientY - startY);
            });
            document.addEventListener("mouseup", function() {
              if (!isDown) return;
              isDown = false; display.style.cursor = "";
            });
          });

          // drag — mouse (ekran üzerindeyken yoksay)
          gallery2.addEventListener("mousedown", function(e) {
            if (e.target.closest(".g-phone-display")) return;
            dragActive = true; dragStartX = e.clientX; dragStartRot = rot;
            gallery2.style.cursor = "grabbing"; e.preventDefault();
          });
          document.addEventListener("mousemove", function(e) {
            if (!dragActive) return;
            rot = dragStartRot + (e.clientX - dragStartX) * 0.35;
            targetRot = rot;
          });
          document.addEventListener("mouseup", function() {
            if (!dragActive) return;
            dragActive = false; gallery2.style.cursor = "";
            targetRot = rot;
          });

          // drag — touch (ekran scroll ile çakışmasın)
          gallery2.addEventListener("touchstart", function(e) {
            if (e.target.closest(".g-phone-display")) return;
            dragStartX = e.touches[0].clientX; dragStartRot = rot; dragActive = true;
          }, {passive:true});
          gallery2.addEventListener("touchmove", function(e) {
            if (!dragActive) return;
            rot = dragStartRot + (e.touches[0].clientX - dragStartX) * 0.35;
            targetRot = rot;
          }, {passive:true});
          gallery2.addEventListener("touchend", function(e) {
            if (!dragActive) return;
            dragActive = false;
          });

          // scroll in gallery area (ekran üzerindeyken yoksay)
          gallery2.addEventListener("wheel", function(e) {
            if (e.target.closest(".g-phone-display")) return;
            targetRot += e.deltaY * 0.25;
            e.preventDefault();
          }, {passive:false});

          // dots
          dots.forEach(function(d, i) {
            d.addEventListener("click", function() {
              targetRot = rot - ((rot/ANG % n + n*100) % n)*ANG + (n - i)*ANG;
              // simpler: snap to item i at front
              var currentFront = Math.round(((-rot / ANG) % n + n * 100) % n) % n;
              var diff = ((i - currentFront) + n) % n;
              if (diff > n/2) diff -= n;
              targetRot = rot - diff * ANG;
            });
          });

          frame();
        }, 150);
      } else {
        // ---- STANDART GALERİ MODU ----
        if (galleryLbl) galleryLbl.textContent = "Galeri — " + gallery.length + " fotoğraf";
        framesEl.innerHTML = gallery.map(function (g, i) {
          var hasCap = g.caption && g.caption.trim();
          var isAlt = i % 2 === 1;
          var cls = "g-frame" + (hasCap ? (" has-cap" + (isAlt ? " alt" : "")) : "");
          return '<div class="' + cls + '">' +
            '<div class="g-img">' +
              '<span class="g-img-n">' + String(i + 1).padStart(2, "0") + '</span>' +
              '<img src="' + g.image + '" alt="' + esc(g.caption || ("Fotoğraf " + (i + 1))) + '" loading="lazy" />' +
            '</div>' +
            (hasCap ? (
              '<div class="g-cap">' +
                '<span class="g-cap-n">' + String(i + 1).padStart(2, "0") + ' / ' + String(gallery.length).padStart(2, "0") + '</span>' +
                '<div class="g-cap-text">' + esc(g.caption) + '</div>' +
              '</div>'
            ) : "") +
          '</div>';
        }).join("");

        // Dikey (mobil) ekran görüntülerini otomatik algıla → telefon penceresi (SADECE UI/UX)
        var tallImgs = (w.cat === "uiux")
          ? Array.prototype.slice.call(framesEl.querySelectorAll(".g-img img"))
          : [];
        function checkTall() {
          var pending = false;
          tallImgs.forEach(function (img) {
            if (img.dataset.checked) return;
            if (img.naturalWidth && img.naturalHeight) {
              img.dataset.checked = "1";
              if (img.naturalHeight / img.naturalWidth >= 1.5) {
                var fr = img.closest(".g-frame");
                if (fr) {
                  fr.classList.add("is-tall");
                  var imgWrap = fr.querySelector(".g-img");
                  if (imgWrap && !imgWrap.querySelector(".g-tall-hint")) {
                    var hint = document.createElement("span");
                    hint.className = "g-tall-hint";
                    hint.textContent = "↕ kaydır";
                    imgWrap.appendChild(hint);
                    imgWrap.addEventListener("scroll", function () {
                      hint.style.opacity = imgWrap.scrollTop > 30 ? "0" : "1";
                    }, { passive: true });
                  }
                }
              }
            } else {
              pending = true;
            }
          });
          if (pending) setTimeout(checkTall, 250);
        }
        checkTall();
      }
    }

    // floating edit button — show only when admin is authed
    var editBtn = document.getElementById("projeEditBtn");
    if (editBtn) {
      function refreshEdit() {
        var ok = window.studiobleurAdmin && window.studiobleurAdmin.isAuthed && window.studiobleurAdmin.isAuthed();
        editBtn.hidden = !ok;
      }
      editBtn.addEventListener("click", function () {
        if (window.studiobleurAdmin) window.studiobleurAdmin.open(w.cat);
      });
      setTimeout(refreshEdit, 250);
      window.addEventListener("focus", refreshEdit);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  window.addEventListener("works-updated", render);
})();
