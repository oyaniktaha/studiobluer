# studiobleur — Google Stitch Tasarım Brief'i

> Bu dosyayı Google Stitch'e prompt olarak yapıştırın. Tek seferde tüm sayfayı vermek yerine, isterseniz her bölümü ayrı ayrı da girebilirsiniz (Stitch ekran ekran daha iyi sonuç verir).

---

## 1. Ürün / Genel Tanım

**studiobleur**, üç hizmet sunan yaratıcı bir dijital stüdyodur: **UI/UX tasarım**, **3D modelleme & görselleştirme** ve **yapay zekâ çözümleri**. Tek sayfalık (landing page), animasyonlu, koyu temalı, cesur ve deneysel bir tanıtım sitesi.

**Dil:** Türkçe
**Tip:** Tek sayfa, dikey scroll, koyu (dark) tema
**Hedef his:** Sinematik, fütüristik, premium, büyük tipografi, bol hareket

---

## 2. Tasarım Sistemi (Design Tokens)

### Renkler
- Arka plan (canvas): `#0b0b0c` (neredeyse siyah, hafif sıcak)
- İkincil yüzey: `#16161a` / `#1d1d22`
- Metin: `#f3f2ec` (kırık beyaz)
- Soluk metin: `#9b9aa1`
- **Vurgu (signature):** elektrik lime/fıstık yeşili `#bef078`
- İkincil aksan: mor `#a78bff` (yapay zekâ vurgusu için)
- Kozmik sahne tonları: derin lacivert → mavi `#16244e`, pembe nebula `#ff0066`, mavi nebula `#0033ff`

### Tipografi
- **Başlıklar:** "Bricolage Grotesque" (deneysel, ifadeli grotesk) — 700 weight, çok büyük (clamp ~3rem–11rem), `letter-spacing: -0.04em`
- **Gövde / etiketler:** "Space Grotesk" — 400/500/600
- Etiketler/eyebrow: küçük, büyük harf, geniş harf aralığı (`letter-spacing: 0.28em`), lime renkte

### Form
- Köşe yuvarlaklığı: kartlar 18px, butonlar tam yuvarlak (pill, 100px)
- İnce çizgiler: `rgba(255,255,255,0.085)`
- Hover: kartlar 8px yukarı kalkar + ince glow

### Butonlar
- Birincil: lime dolgu, koyu metin, pill form, hover'da beyaza döner, sağ ok "→"
- İkincil (ghost): şeffaf, ince kenarlık, hover'da lime kenarlık

---

## 3. Bölümler (Sırasıyla)

### 3.1 — Üst Menü (Nav)
Sabit (fixed) üst bar. Solda logo: lime nokta + "studiobleur" (lowercase, bold). Ortada/sağda linkler: Hizmetler · Süreç · Stüdyo · SSS. En sağda lime pill buton: "Proje başlat →". Scroll'da arka plan blur + ince alt çizgi.

### 3.2 — Hero (Kozmik 3D Giriş)
**Tam ekran, sinematik kozmik sahne.** Derin uzay gradyanı (siyahtan laciverte), yıldız alanı, ufukta parlayan ışık, mor/pembe nebula bulutu, altta dağ siluetleri. Ortada çok büyük başlık: **"studiobleur"** (harf harf yükselen animasyon). Üstte eyebrow: "UI/UX · 3D GÖRSELLEŞTİRME · YAPAY ZEKÂ". Altında alt başlık: *"Tasarım, üç boyutlu görselleştirme ve yapay zekânın buluştuğu yaratıcı stüdyo. Markaları ufkun ötesine taşıyoruz."* İki buton: "Bir proje başlat →" (lime), "Ne yapıyoruz?" (ghost). Solda dikey "studiobleur" yazısı + menü ikonu. Sağ altta SCROLL ilerleme göstergesi + sayaç (01 / 03).
> Scroll'da kamera sahnenin içinden uçar (parallax), metin "Ufkun ötesini tasarlıyoruz." fazına geçer.

### 3.3 — Kayan Şerit (Marquee)
Yatay sonsuz kayan büyük yazılar: "Arayüz Tasarımı · 3D Render · Marka Deneyimi · Üretken YZ · Ürün Görselleştirme · Prototipleme" (lime nokta ayraçlarla, bazıları soluk renkte).

### 3.4 — Hizmetler
Başlık: **"Üç disiplin, tek bir vizyon."** ("vizyon" lime). 3 kolonlu kart grid'i:

**01 — UI/UX · Arayüz & Deneyim Tasarımı**
Kullanıcı araştırmasından yüksek sadakatli prototiplere; akışları sezgisel, ölçülebilir ve ölçeklenebilir hale getiriyoruz. Tasarım sistemleriyle tutarlılık garanti.
Etiketler: Araştırma · Wireframe · Tasarım Sistemi · Prototip

**02 — 3D · Modelleme & Görselleştirme**
Ürünlerinizi fotogerçekçi sahnelerde hayata geçiriyoruz. Render, animasyon ve etkileşimli 3D konfigüratörlerle hikâyenizi gözle görülür kılıyoruz.
Etiketler: Modelleme · Render · Animasyon · WebGL

**03 — AI · Yapay Zekâ Çözümleri**
Üretken yapay zekâ ve otomasyonla iş akışlarınızı hızlandırıyoruz. Akıllı arayüzler, özel modeller ve uçtan uca entegrasyon ile fark yaratın.
Etiketler: Üretken YZ · Otomasyon · Entegrasyon · Asistanlar

> Her kartta: numara, ikon (kutucuk içinde), başlık, açıklama, etiket çipleri. Hover'da yukarı kalkar + renkli glow (01 lime, 02 mercan, 03 mor).

### 3.5 — İstatistikler
Yatay 4 kolon, ince ayraçlarla. Büyük sayılar (count-up animasyonu), lime son ek:
- 120+ tamamlanan proje
- 40+ mutlu müşteri
- 9 yıl stüdyo deneyimi
- 14 farklı ülkeden iş

### 3.6 — Çalışma Süreci
Başlık: **"Kaostan netliğe."** 4 adımlı grid (üstte ince çizgi, hover'da lime):
1. **01 / KEŞİF — Anlamak:** Hedefleri, kullanıcıları ve kısıtları dinliyoruz. Doğru soruları sorarak problemi keskinleştiriyoruz.
2. **02 / KONSEPT — Tasarlamak:** Yön, dil ve sistemleri belirliyoruz. Hızlı prototiplerle fikirleri erkenden test ediyoruz.
3. **03 / ÜRETİM — İnşa etmek:** Pikseli, modeli ve modeli üretiyoruz. Detaylar, animasyon ve performans burada parlıyor.
4. **04 / LANSMAN — Yayınlamak:** Teslim eder, ölçer ve iyileştiririz. Lansman bir bitiş değil, büyümenin başlangıcıdır.

### 3.7 — Stüdyo / Ekip
İki kolon. Solda: eyebrow "Stüdyo", başlık **"Küçük ekip, büyük ışık."**, açıklama: *"studiobleur, farklı disiplinlerden gelen tasarımcı, 3D sanatçısı ve mühendislerden oluşan çevik bir kolektif..."* Altında 3 ekip üyesi (yuvarlak portre + isim + rol): Eda K. (Kurucu · UX), Mert A. (3D Lead), Defne S. (YZ Mühendisi). Sağda: büyük dikey görsel (4:5, stüdyo görseli / reel placeholder).

### 3.8 — Müşteri Yorumları
Başlık: **"Birlikte çalıştığımız ekipler."** 3 kolonlu alıntı kartları (büyük lime tırnak işareti, yorum, altta yuvarlak avatar + isim + rol):
- *"Arayüzümüzü baştan kurguladılar ve dönüşüm oranımız iki ay içinde belirgin şekilde arttı..."* — Selin Yıldız, Ürün Direktörü, Fintech
- *"3D ürün görsellerimiz fuarda en çok konuşulan şeydi. Fotogerçekçilik beklentimizin çok ötesindeydi."* — Kerem Aydın, Pazarlama Lideri, Donanım
- *"Kurdukları yapay zekâ asistanı destek ekibimizin yükünü yarı yarıya azalttı."* — Asya Demir, Operasyon, SaaS

### 3.9 — SSS (FAQ)
İki kolon: solda başlık **"Merak edilenler."**, sağda akordeon liste (tıklayınca açılır, + / − ikonu, açık olan lime):
- Bir proje ne kadar sürer?
- Tek bir hizmet için de çalışır mısınız?
- Fiyatlandırma nasıl işliyor?
- Mevcut ekibimizle entegre olur musunuz?
- Lansmandan sonra destek var mı?

### 3.10 — İletişim / CTA
Ortalanmış, kozmik glow arka plan. Çok büyük başlık: **"Hadi birlikte parlayalım."** ("parlayalım" italik lime). Alt metin: *"Aklınızdaki proje ister bir fikir ister hazır bir brief olsun — kahve eşliğinde konuşalım."* Butonlar: "Proje başlat →" (lime), "Sunum dosyasını indir" (ghost). Altında büyük e-posta linki: **merhaba@studiobleur.studio**

### 3.11 — Footer
Solda logo + kısa açıklama. Sağda 3 kolon link: Hizmetler / Stüdyo / Sosyal. Altta: © 2026 studiobleur · "Türkiye · uzaktan, her yerden".

---

## 4. Stitch için Kısa Özet Prompt (tek satır)

> "Create a single-page dark-themed animated landing page for **studiobleur**, a creative studio offering UI/UX design, 3D modeling/visualization, and AI solutions. Bold experimental aesthetic with huge Bricolage Grotesque headlines, electric lime (#bef078) accent on near-black (#0b0b0c) canvas, Space Grotesk body. Sections: cosmic full-screen hero, scrolling marquee, 3-column services, stats row, 4-step process, team, testimonials, FAQ accordion, big centered contact CTA, footer. Turkish language. Pill buttons, rounded cards, subtle glows, generous spacing."

---

## 5. Notlar
- Görseller şu an placeholder (çizgili). Stitch'te gerçek görsel/ikon önerileri ekleyebilirsiniz.
- Lime + mor aksan dışında yeni renk eklemeyin; tutarlılık önemli.
- Tipografi kontrastı (devasa başlık + küçük etiket) bu tasarımın imzasıdır.
