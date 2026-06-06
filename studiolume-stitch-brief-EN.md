# studiobleur — Google Stitch Design Brief

> Paste this into Google Stitch as a prompt. You can feed the whole page at once, or — for better results — give each section as its own prompt (Stitch works best screen-by-screen).

---

## 1. Product / Overview

**studiobleur** is a creative digital studio offering three services: **UI/UX design**, **3D modeling & visualization**, and **AI solutions**. A single-page, animated, dark-themed, bold and experimental marketing landing page.

**Language:** Turkish (copy provided below; translate if needed)
**Type:** Single page, vertical scroll, dark theme
**Target feel:** Cinematic, futuristic, premium, huge typography, lots of motion
**Motion:** Fully parallax — a cinematic 3D scroll hero plus scroll-driven depth on every section

---

## 2. Design System (Design Tokens)

### Colors
- Background (canvas): `#0b0b0c` (near-black, slightly warm)
- Secondary surfaces: `#16161a` / `#1d1d22`
- Text: `#f3f2ec` (off-white)
- Muted text: `#9b9aa1`
- **Accent (signature):** electric lime `#bef078`
- Secondary accent: violet `#a78bff` (used for the AI service)
- Cosmic scene tones: deep navy → blue `#16244e`, pink nebula `#ff0066`, blue nebula `#0033ff`

### Typography
- **Headings:** "Bricolage Grotesque" (expressive, experimental grotesque) — weight 700, very large (clamp ~3rem–11rem), `letter-spacing: -0.04em`
- **Body / labels:** "Space Grotesk" — 400/500/600
- Eyebrow labels: small, uppercase, wide tracking (`letter-spacing: 0.28em`), lime colored

### Shape
- Corner radius: cards 18px, buttons fully rounded (pill, 100px)
- Hairlines: `rgba(255,255,255,0.085)`
- Hover: cards lift 8px + subtle glow

### Buttons
- Primary: lime fill, dark text, pill shape, turns white on hover, trailing arrow "→"
- Secondary (ghost): transparent, thin border, lime border on hover

---

## 3. Sections (in order)

### 3.1 — Top Nav
Fixed top bar. Left: logo — lime dot + "studiobleur" (lowercase, bold). Center/right links: Services · Process · Studio · FAQ. Far right lime pill button: "Start a project →". On scroll: blurred background + thin bottom border.

### 3.2 — Hero (Cosmic 3D Intro)
**Full-screen cinematic cosmic scene.** Deep-space gradient (black to navy), starfield, glowing light on the horizon, purple/pink nebula clouds, mountain silhouettes at the bottom. Centered giant headline: **"studiobleur"** (characters rise in one by one). Eyebrow above: "UI/UX · 3D VISUALIZATION · AI". Subhead below: *"A creative studio where design, 3D visualization, and AI meet. We take brands beyond the horizon."* Two buttons: "Start a project →" (lime), "What we do?" (ghost). Left side: vertical "studiobleur" text + menu icon. Bottom-right: SCROLL progress indicator + counter (01 / 03).
> **Parallax:** as you scroll, the camera flies through the scene (pinned), and the text cross-fades to a second phase: "We design beyond the horizon." The hero stays pinned for ~2 viewports, then hands off to the content.

### 3.3 — Marquee
Infinite horizontal scrolling large text: "Interface Design · 3D Render · Brand Experience · Generative AI · Product Visualization · Prototyping" (separated by lime dots, some words dimmed).

### 3.4 — Services
Heading: **"Three disciplines, one vision."** ("vision" in lime). 3-column card grid:

**01 — UI/UX · Interface & Experience Design**
From user research to high-fidelity prototypes, we make flows intuitive, measurable, and scalable. Consistency guaranteed with design systems.
Tags: Research · Wireframe · Design System · Prototype

**02 — 3D · Modeling & Visualization**
We bring your products to life in photorealistic scenes. Render, animation, and interactive 3D configurators make your story visible.
Tags: Modeling · Render · Animation · WebGL

**03 — AI · AI Solutions**
We accelerate your workflows with generative AI and automation. Make a difference with smart interfaces, custom models, and end-to-end integration.
Tags: Generative AI · Automation · Integration · Assistants

> Each card: number, icon (in a rounded square), title, description, tag chips. On hover: lifts up + colored glow (01 lime, 02 coral, 03 violet). Card contents have layered parallax.

### 3.5 — Stats
Horizontal 4-column row with thin dividers. Large numbers (count-up animation), lime suffix:
- 120+ projects completed
- 40+ happy clients
- 9 years studio experience
- 14 countries served

### 3.6 — Process
Heading: **"From chaos to clarity."** 4-step grid (thin top line, lime on hover):
1. **01 / DISCOVER — Understand:** We listen to goals, users, and constraints. We sharpen the problem by asking the right questions.
2. **02 / CONCEPT — Design:** We define direction, language, and systems. We test ideas early with rapid prototypes.
3. **03 / BUILD — Create:** We produce the pixels, the model, and the model. Details, animation, and performance shine here.
4. **04 / LAUNCH — Ship:** We deliver, measure, and improve. Launch isn't an end — it's the start of growth.

### 3.7 — Studio / Team
Two columns. Left: eyebrow "Studio", heading **"Small team, big light."**, description: *"studiobleur is an agile collective of designers, 3D artists, and engineers from different disciplines..."* Below: 3 team members (round portrait + name + role): Eda K. (Founder · UX), Mert A. (3D Lead), Defne S. (AI Engineer). Right: large vertical image (4:5, studio image / reel placeholder).

### 3.8 — Testimonials
Heading: **"Teams we've worked with."** 3-column quote cards (large lime quotation mark, quote, round avatar + name + role at bottom):
- *"They redesigned our interface and our conversion rate rose noticeably within two months..."* — Selin Yıldız, Product Director, Fintech
- *"Our 3D product visuals were the most talked-about thing at the trade show. The photorealism far exceeded our expectations."* — Kerem Aydın, Marketing Lead, Hardware
- *"The AI assistant they built cut our support team's load in half."* — Asya Demir, Operations, SaaS

### 3.9 — FAQ
Two columns: left heading **"Frequently asked."**, right accordion list (expands on click, + / − icon, open item in lime):
- How long does a project take?
- Do you work on a single service too?
- How does pricing work?
- Do you integrate with our existing team?
- Is there support after launch?

### 3.10 — Contact / CTA
Centered, cosmic glow background. Huge heading: **"Let's shine together."** ("shine" italic lime). Subtext: *"Whether your project is just an idea or a ready brief — let's talk over coffee."* Buttons: "Start a project →" (lime), "Download deck" (ghost). Below: large email link: **hello@studiobleur.studio**

### 3.11 — Footer
Left: logo + short description. Right: 3 link columns: Services / Studio / Social. Bottom: © 2026 studiobleur · "Turkey · remote, everywhere".

---

## 4. One-line summary prompt for Stitch

> "Create a single-page dark-themed, fully parallax animated landing page for **studiobleur**, a creative studio offering UI/UX design, 3D modeling/visualization, and AI solutions. Bold experimental aesthetic with huge Bricolage Grotesque headlines, electric lime (#bef078) accent on near-black (#0b0b0c) canvas, Space Grotesk body. A cinematic cosmic 3D hero (starfield, nebula, mountains) where the camera flies through on scroll, plus scroll-driven parallax depth on every section. Sections: hero, scrolling marquee, 3-column services, stats row, 4-step process, team, testimonials, FAQ accordion, big centered contact CTA, footer. Pill buttons, rounded cards, subtle glows, generous spacing."

---

## 5. Notes
- Images are currently placeholders (striped). In Stitch you can add real image/icon suggestions.
- Don't introduce new colors beyond lime + violet accent; consistency matters.
- The typographic contrast (massive headline + tiny label) is the signature of this design.
- Motion is core: a pinned cosmic hero journey, plus layered parallax (different scroll speeds per element) across all sections.
