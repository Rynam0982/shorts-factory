/* global React, ReactDOM, Icon, Logo, Btn, Pill, Landing, Studio, Dashboard, Series, History, VideoPlayer, Credits, Admin,
   useTweaks, TweaksPanel, TweakSection, TweakColor, TweakSlider, TweakRadio */
// app.jsx — shell + navigation
const { useState: useApp, useEffect: useAppE } = React;

const NAV = [
  { id: "dashboard", label: "Tableau de bord", icon: "layout-dashboard" },
  { id: "studio", label: "Studio", icon: "wand", badge: "Créer" },
  { id: "series", label: "Séries auto", icon: "repeat" },
  { id: "history", label: "Historique", icon: "movie" },
  { id: "credits", label: "Crédits", icon: "diamond" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 285,
  "glow": 1,
  "captionStyle": "bold_center",
  "navStyle": "labels"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useApp("landing");
  const [balance, setBalance] = useApp(3411);
  const [openVideo, setOpenVideo] = useApp(null);

  // applique les tweaks aux variables CSS
  useAppE(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent-h", t.accentHue);
    r.style.setProperty("--glow", t.glow);
  }, [t.accentHue, t.glow]);

  const isLanding = route === "landing";
  const isAdmin = route === "admin";
  const publicRoutes = { landing: Landing, how: HowItWorks, "pricing-public": PricingPublic, examples: Examples };
  const PublicPage = publicRoutes[route];

  const titles = { dashboard: "Tableau de bord", studio: "Nouveau short", series: "Séries automatiques", history: "Historique", credits: "Crédits & abonnement", admin: "Administration" };

  return (
    <>
      {PublicPage ? (
        <PublicPage onEnter={() => setRoute("dashboard")} onNav={(r) => setRoute(r)} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "var(--sidebar-w) 1fr", minHeight: "100vh" }}>
          {/* SIDEBAR */}
          <aside style={{ borderRight: "1px solid var(--line)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 6,
            position: "sticky", top: 0, height: "100vh", background: "oklch(0.17 0.013 280 / 0.94)", backdropFilter: "blur(10px)" }}>
            <div style={{ padding: "6px 8px 18px", cursor: "pointer" }} onClick={() => setRoute("landing")}><Logo size={28} /></div>

            <Btn full icon="plus" onClick={() => setRoute("studio")} style={{ marginBottom: 14 }}>Créer un short</Btn>

            {NAV.map(n => {
              const active = route === n.id;
              return (
                <button key={n.id} onClick={() => setRoute(n.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, textAlign: "left",
                  background: active ? "var(--accent-soft)" : "transparent", color: active ? "var(--tx-0)" : "var(--tx-2)",
                  border: `1px solid ${active ? "var(--accent-line)" : "transparent"}`, fontSize: 14, fontWeight: 600, transition: "all .14s", position: "relative",
                }}>
                  <Icon name={n.icon} size={19} style={{ color: active ? "var(--accent-bright)" : "var(--tx-3)" }} />
                  {n.label}
                  {active && <div style={{ position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 3, background: "var(--accent-bright)" }} />}
                </button>
              );
            })}

            <div style={{ flex: 1 }} />

            {/* solde mini */}
            <div className="card" style={{ padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--tx-3)", letterSpacing: "0.08em" }}>CRÉDITS</span>
                <Icon name="diamond" size={13} style={{ color: "var(--accent-bright)" }} />
              </div>
              <div className="mono tnum" style={{ fontSize: 22, fontWeight: 700, color: "var(--tx-0)" }}>{balance.toLocaleString("fr")}</div>
              <button onClick={() => setRoute("credits")} style={{ fontSize: 11.5, color: "var(--accent-bright)", fontWeight: 600, marginTop: 6, display: "flex", gap: 4, alignItems: "center" }}>
                <Icon name="bolt" size={12} />Recharger
              </button>
            </div>

            {/* admin + user */}
            <button onClick={() => setRoute("admin")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10,
              background: isAdmin ? "oklch(0.66 0.2 22 / 0.12)" : "transparent", color: isAdmin ? "var(--bad)" : "var(--tx-3)", fontSize: 13, fontWeight: 600,
              border: `1px solid ${isAdmin ? "oklch(0.66 0.2 22 / 0.3)" : "transparent"}` }}>
              <Icon name="shield-lock" size={17} />Admin
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: "radial-gradient(circle at 35% 30%, var(--accent-bright), var(--accent-deep))", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>S</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-0)" }}>Sofiane</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--tx-3)" }}>Plan Studio</div>
              </div>
              <Icon name="settings" size={16} style={{ color: "var(--tx-3)" }} />
            </div>
          </aside>

          {/* CONTENU */}
          <main style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* topbar */}
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid var(--line)",
              position: "sticky", top: 0, zIndex: 20, background: "oklch(0.155 0.012 280 / 0.94)", backdropFilter: "blur(12px)" }}>
              <div>
                <h1 style={{ fontSize: 19 }}>{titles[route]}</h1>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line)", color: "var(--tx-2)", display: "grid", placeItems: "center" }}><Icon name="bell" size={18} /></button>
                <button style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line)", color: "var(--tx-2)", display: "grid", placeItems: "center" }}><Icon name="help" size={18} /></button>
              </div>
            </header>

            <div style={{ padding: "28px 32px", flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto" }} key={route}>
              {route === "dashboard" && <Dashboard balance={balance} onOpenVideo={setOpenVideo} onNav={setRoute} />}
              {route === "studio" && <Studio balance={balance} onConsume={(c) => setBalance(b => b - c)} captionStyleDefault={t.captionStyle} />}
              {route === "series" && <Series onNav={setRoute} />}
              {route === "history" && <History onOpenVideo={setOpenVideo} />}
              {route === "credits" && <Credits balance={balance} />}
              {route === "admin" && <Admin />}
            </div>
          </main>
        </div>
      )}

      {openVideo && <VideoPlayer v={openVideo} onClose={() => setOpenVideo(null)} />}

      {/* TWEAKS */}
      <TweaksPanel>
        <TweakSection label="Identité visuelle" />
        <TweakColor label="Accent" value={accentToHex(t.accentHue)}
          options={["#7c5cff", "#ff5c7a", "#19c37d", "#2a9bf5", "#ff8a3d"]}
          onChange={(hex) => setTweak("accentHue", hexToHue(hex))} />
        <TweakSlider label="Intensité du glow" value={t.glow} min={0} max={1.8} step={0.1} onChange={(v) => setTweak("glow", v)} />
        <TweakSection label="Studio" />
        <TweakRadio label="Sous-titres par défaut" value={t.captionStyle} options={["bold_center", "karaoke", "minimal"]} onChange={(v) => setTweak("captionStyle", v)} />
      </TweaksPanel>
    </>
  );
}

// mapping accent hex <-> hue (chroma/lightness fixes)
const HUE_MAP = { "#7c5cff": 285, "#ff5c7a": 12, "#19c37d": 155, "#2a9bf5": 245, "#ff8a3d": 50 };
function hexToHue(hex) { return HUE_MAP[hex] ?? 258; }
function accentToHex(hue) { return Object.keys(HUE_MAP).find(k => HUE_MAP[k] === hue) ?? "#7c5cff"; }

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
