/* studiobleur — İLETİŞİM BİLGİLERİ (yönetim panelinden düzenlenir) */
window.StudioContact = (function () {
  const KEY = "studiobleur_contact";
  const DEFAULTS = {
    phone:    "+90 555 000 00 00",
    email:    "info@studiobleur.com",
    address:  "Alanya, Antalya / Türkiye",
    mapUrl:   "https://maps.google.com/maps?q=alanya+antalya&output=embed",
    instagram:"",
    behance:  "",
    linkedin: "",
    twitter:  ""
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch(e){}
    // fall back to published data
    if (window.STUDIOBLEUR_CONTACT) return Object.assign({}, DEFAULTS, window.STUDIOBLEUR_CONTACT);
    return Object.assign({}, DEFAULTS);
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("contact-updated", { detail: data }));
  }

  function buildJS(data) {
    return "/* studiobleur — İLETİŞİM (yönetim panelinden üretildi) */\n" +
           "window.STUDIOBLEUR_CONTACT = " + JSON.stringify(data, null, 2) + ";\n";
  }

  return { load, save, buildJS, DEFAULTS };
})();
