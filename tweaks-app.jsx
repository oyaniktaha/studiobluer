/* studiolume — Tweaks island
   Mounts only the Tweaks panel; applies choices to the vanilla page
   via CSS custom properties + body classes. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#bef078",
  "bg": "charcoal",
  "displayFont": "Bricolage Grotesque",
  "radius": 18,
  "marqueeDur": 28,
  "motion": "tam",
  "grain": true,
  "scene3d": true
}/*EDITMODE-END*/;

const BG_THEMES = {
  charcoal: { "--bg": "#0b0b0c", "--bg-2": "#101012", "--surface": "#16161a", "--surface-2": "#1d1d22" },
  siyah:    { "--bg": "#000000", "--bg-2": "#080808", "--surface": "#111113", "--surface-2": "#19191c" },
  sicak:    { "--bg": "#0d0c0a", "--bg-2": "#131210", "--surface": "#1a1815", "--surface-2": "#23201a" }
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    // accent (glow tracks it via color-mix in CSS)
    root.style.setProperty("--lime", t.accent);
    root.style.setProperty("--lime-deep", `color-mix(in oklab, ${t.accent}, black 16%)`);
    // background theme
    const theme = BG_THEMES[t.bg] || BG_THEMES.charcoal;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v));
    // type + shape + speed
    root.style.setProperty("--display", `"${t.displayFont}", "Space Grotesk", sans-serif`);
    root.style.setProperty("--r", t.radius + "px");
    root.style.setProperty("--marquee-dur", t.marqueeDur + "s");
    // body classes
    document.body.classList.toggle("calm", t.motion === "sakin");
    document.body.classList.toggle("no-grain", !t.grain);
    document.body.classList.toggle("no-3d", !t.scene3d);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Renk" />
      <TweakColor
        label="Vurgu rengi"
        value={t.accent}
        options={["#bef078", "#5ea0ff", "#a78bff", "#ff8a5c", "#ff5cc8"]}
        onChange={(v) => setTweak("accent", v)}
      />
      <TweakRadio
        label="Arka plan"
        value={t.bg}
        options={["charcoal", "siyah", "sicak"]}
        onChange={(v) => setTweak("bg", v)}
      />

      <TweakSection label="Tipografi & form" />
      <TweakSelect
        label="Başlık fontu"
        value={t.displayFont}
        options={["Bricolage Grotesque", "Syne", "Archivo", "Space Grotesk"]}
        onChange={(v) => setTweak("displayFont", v)}
      />
      <TweakSlider
        label="Köşe yuvarlaklığı"
        value={t.radius}
        min={0}
        max={28}
        step={1}
        unit="px"
        onChange={(v) => setTweak("radius", v)}
      />

      <TweakSection label="Hareket" />
      <TweakRadio
        label="Mod"
        value={t.motion}
        options={["tam", "sakin"]}
        onChange={(v) => setTweak("motion", v)}
      />
      <TweakSlider
        label="Marquee süresi"
        value={t.marqueeDur}
        min={12}
        max={56}
        step={2}
        unit="sn"
        onChange={(v) => setTweak("marqueeDur", v)}
      />
      <TweakToggle
        label="Film dokusu"
        value={t.grain}
        onChange={(v) => setTweak("grain", v)}
      />
      <TweakToggle
        label="3D arka plan"
        value={t.scene3d}
        onChange={(v) => setTweak("scene3d", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
