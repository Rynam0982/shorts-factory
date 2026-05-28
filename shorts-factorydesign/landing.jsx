/* global React, Icon, Btn, Pill, Logo, ShortFrame, PlatformDot, PIPELINE_STEPS, QUALITIES */
// landing.jsx — page d'accueil marketing
const { useState: useStateL, useEffect: useEffectL } = React;

function FloatingShorts() {
  const items = [
    { seed: 0, cap: "L'espace SENT le métal", x: 0, y: 20, rot: -6, w: 132, d: 0 },
    { seed: 2, cap: "Personne ne le savait", x: 150, y: 0, rot: 3, w: 150, d: 0.2 },
    { seed: 4, cap: "1920 vs aujourd'hui", x: 318, y: 36, rot: 7, w: 122, d: 0.4 },
  ];
  return (
    <div style={{ position: "relative", height: 320, width: 460 }}>
      {items.map((it, i) => (
        <div key={i} style={{ position: "absolute", left: it.x, top: it.y, transform: `rotate(${it.rot}deg)`,
          filter: "drop-shadow(0 20px 40px oklch(0 0 0 / 0.5))" }}>
          <ShortFrame seed={it.seed} w={it.w} caption={it.cap} playing={i === 1} progress={0.3 + i * 0.2}
            badge={i === 1 ? <Pill tone="accent" icon="sparkles" style={{ fontSize: 9, padding: "2px 6px" }}>AUTO</Pill> : null} />
        </div>
      ))}
    </div>
  );
}

function PublicHeader({ onEnter, onNav, active = "home" }) {
  const links = [{ id: "how", l: "Fonctionnement" }, { id: "pricing-public", l: "Tarifs" }, { id: "examples", l: "Exemples" }];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "oklch(0.155 0.012 280 / 0.94)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", maxWidth: 1240, margin: "0 auto" }}>
        <button onClick={() => onNav("landing")}><Logo size={30} /></button>
        <nav style={{ display: "flex", gap: 30, alignItems: "center" }}>
          {links.map(x => (
            <button key={x.id} onClick={() => onNav(x.id)} style={{ fontSize: 14, fontWeight: 600, color: active === x.id ? "var(--tx-0)" : "var(--tx-2)", position: "relative" }}>
              {x.l}
              {active === x.id && <span style={{ position: "absolute", bottom: -6, left: 0, right: 0, height: 2, borderRadius: 2, background: "var(--accent-bright)" }} />}
            </button>
          ))}
          <Btn variant="ghost" size="sm" onClick={onEnter}>Se connecter</Btn>
          <Btn size="sm" icon="arrow-right" iconRight onClick={onEnter}>Commencer</Btn>
        </nav>
      </div>
    </header>
  );
}

function PublicFooter({ onNav }) {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 40 }}>
      <div style={{ padding: "30px 40px", maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Logo size={24} />
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--tx-3)" }}>
          <button onClick={() => onNav && onNav("how")}>Fonctionnement</button>
          <button onClick={() => onNav && onNav("pricing-public")}>Tarifs</button>
          <button onClick={() => onNav && onNav("examples")}>Exemples</button>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>© 2026 Shorts Factory</div>
      </div>
    </footer>
  );
}

function Landing({ onEnter, onNav }) {
  return (
    <div style={{ minHeight: "100vh", overflow: "auto" }}>
      <PublicHeader onEnter={onEnter} onNav={onNav} active="home" />

      {/* HERO */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 40px 40px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 40, alignItems: "center" }}>
        <div>
          <Pill tone="accent" icon="sparkles" style={{ marginBottom: 22 }}>Propulsé par 6 modèles d'IA</Pill>
          <h1 style={{ fontSize: 58, lineHeight: 1.02, letterSpacing: "-0.03em", marginBottom: 22 }}>
            Un prompt.<br />Une vidéo virale.<br /><span style={{ background: "linear-gradient(110deg, var(--accent-bright), oklch(0.7 0.18 330))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Zéro montage.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--tx-2)", lineHeight: 1.6, maxWidth: 480, marginBottom: 30 }}>
            Shorts Factory transforme une simple idée en short prêt à publier — scénario, voix off, vidéo, musique et sous-titres générés et assemblés automatiquement pour TikTok, YouTube & Reels.
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <Btn size="lg" icon="player-play-filled" onClick={onEnter}>Créer mon premier short</Btn>
            <Btn size="lg" variant="ghost" icon="player-play" onClick={onEnter}>Voir une démo</Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, color: "var(--tx-3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="circle-check" size={15} style={{ color: "var(--ok)" }} />Sans carte</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="bolt" size={15} style={{ color: "var(--accent-bright)" }} />~90s par vidéo</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="repeat" size={15} style={{ color: "var(--tx-2)" }} />Mode pilote auto</span>
          </div>
        </div>
        <div style={{ display: "grid", placeItems: "center" }}>
          <FloatingShorts />
        </div>
      </section>

      {/* LOGOS / trust */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 40px 40px" }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)", textAlign: "center", letterSpacing: "0.15em", marginBottom: 20 }}>PUBLIE EN UN CLIC SUR</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
          {["youtube", "tiktok", "instagram"].map(p => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--tx-2)" }}>
              <PlatformDot id={p} size={30} /><span style={{ fontWeight: 600, fontSize: 15 }}>{PLATFORMS[p].label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE — comment ça marche */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", marginBottom: 12 }}>LA CHAÎNE DE PRODUCTION</div>
          <h2 style={{ fontSize: 38, marginBottom: 14 }}>5 IA travaillent à la chaîne</h2>
          <p style={{ fontSize: 16, color: "var(--tx-2)", maxWidth: 540, margin: "0 auto" }}>Chaque étape est confiée au meilleur modèle. Toi, tu n'écris qu'une phrase.</p>
        </div>
        <div style={{ display: "flex", gap: 0, alignItems: "stretch", justifyContent: "center" }}>
          {PIPELINE_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="card" style={{ flex: 1, padding: "24px 18px", textAlign: "center", maxWidth: 200 }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px", display: "grid", placeItems: "center",
                  background: "var(--accent-soft)", color: "var(--accent-bright)", border: "1px solid var(--accent-line)" }}>
                  <Icon name={s.icon} size={23} />
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--tx-3)", marginBottom: 6 }}>0{i + 1} · {s.engine}</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--tx-0)", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "var(--tx-3)", lineHeight: 1.4 }}>{s.sub}</div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div style={{ display: "grid", placeItems: "center", padding: "0 4px", color: "var(--tx-3)" }}><Icon name="chevron-right" size={18} /></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* DEUX MODES */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 40px 70px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          <div className="card" style={{ padding: 34, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "var(--accent-soft)", filter: "blur(40px)" }} />
            <Pill tone="accent" icon="bolt">MODE STUDIO</Pill>
            <h3 style={{ fontSize: 26, margin: "18px 0 12px" }}>Crée à la demande</h3>
            <p style={{ fontSize: 14.5, color: "var(--tx-2)", lineHeight: 1.6, marginBottom: 22 }}>Contrôle total : prompt libre, qualité Standard à Cinema, durée, sous-titres, plateformes. Paiement aux crédits, sans engagement.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["3 niveaux de qualité IA", "Estimateur de coût en temps réel", "Aperçu plan par plan"].map(f => (
                <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--tx-1)" }}><Icon name="circle-check-filled" size={17} style={{ color: "var(--accent-bright)" }} />{f}</li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ padding: 34, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "oklch(0.7 0.18 330 / 0.14)", filter: "blur(40px)" }} />
            <Pill tone="cinema" icon="repeat">MODE AUTO</Pill>
            <h3 style={{ fontSize: 26, margin: "18px 0 12px" }}>Pilote automatique</h3>
            <p style={{ fontSize: 14.5, color: "var(--tx-2)", lineHeight: 1.6, marginBottom: 22 }}>Configure une série (sujet + format + fréquence) avec un avatar récurrent. L'app génère et publie toute seule, chaque jour. Abonnement fixe.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Avatars IA récurrents", "Sujets via tendances Google", "Publication programmée"].map(f => (
                <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--tx-1)" }}><Icon name="circle-check-filled" size={17} style={{ color: "var(--cinema)" }} />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 80px" }}>
        <div className="card glow-accent" style={{ padding: 54, textAlign: "center", background: "linear-gradient(160deg, var(--bg-1), var(--bg-0))" }}>
          <h2 style={{ fontSize: 40, marginBottom: 16 }}>Ta chaîne tourne sans toi.</h2>
          <p style={{ fontSize: 17, color: "var(--tx-2)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>Commence gratuitement. Génère ton premier short en moins de deux minutes.</p>
          <Btn size="lg" icon="arrow-right" iconRight onClick={onEnter}>Entrer dans le studio</Btn>
        </div>
      </section>

      <PublicFooter onNav={onNav} />
    </div>
  );
}

window.Landing = Landing;
window.FloatingShorts = FloatingShorts;
window.PublicHeader = PublicHeader;
window.PublicFooter = PublicFooter;
