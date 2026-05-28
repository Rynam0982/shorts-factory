import Link from "next/link";
import { CheckCircle, Zap, Repeat, ChevronRight } from "lucide-react";

const PIPELINE_STEPS = [
  { label: "Scénario",    engine: "Claude",      icon: "✍️", sub: "Storyboard + narration" },
  { label: "Vidéo IA",   engine: "fal.ai",       icon: "🎬", sub: "Hailuo / Kling / Wan" },
  { label: "Voix off",   engine: "ElevenLabs",   icon: "🎙️", sub: "Flash v2.5 ou Multi v3" },
  { label: "Musique",    engine: "Pixabay/Suno",  icon: "🎵", sub: "BGM libre ou IA" },
  { label: "Montage",    engine: "FFmpeg",        icon: "✂️", sub: "Sous-titres + assemblage" },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "oklch(0.155 0.012 280 / 0.94)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", maxWidth: 1240, margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(150deg, var(--accent-bright), var(--accent-deep))",
              display: "grid", placeItems: "center",
              boxShadow: "0 4px 16px oklch(0.66 0.21 var(--accent-h) / 0.5)",
            }}>
              <div style={{ display: "flex", gap: "2.5px", alignItems: "flex-end", height: "13px" }}>
                <span style={{ width: "3.5px", height: "55%",  background: "#fff", borderRadius: 2 }} />
                <span style={{ width: "3.5px", height: "100%", background: "#fff", borderRadius: 2 }} />
                <span style={{ width: "3.5px", height: "72%",  background: "#fff", borderRadius: 2 }} />
              </div>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--tx-0)" }}>
              Shorts<span style={{ color: "var(--accent-bright)" }}>Factory</span>
            </span>
          </div>

          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link href="/pricing" style={{ fontSize: 14, fontWeight: 600, color: "var(--tx-2)", textDecoration: "none" }}>Tarifs</Link>
            <Link href="/sign-in" style={{ fontSize: 14, fontWeight: 600, color: "var(--tx-2)", textDecoration: "none" }}>Se connecter</Link>
            <Link href="/sign-up" style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9,
              fontSize: 14, fontWeight: 600,
              background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 4px 16px oklch(0.66 0.21 var(--accent-h) / 0.4)",
            }}>
              Commencer <ChevronRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "70px 40px 50px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center" }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 99, marginBottom: 26,
            background: "var(--accent-soft)", color: "var(--accent-bright)",
            border: "1px solid var(--accent-line)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-mono)",
          }}>
            ✨ Propulsé par 6 modèles d&apos;IA
          </div>

          <h1 style={{ fontSize: 58, lineHeight: 1.02, letterSpacing: "-0.03em", marginBottom: 24 }}>
            Un prompt.<br />Une vidéo virale.<br />
            <span style={{ background: "linear-gradient(110deg, var(--accent-bright), oklch(0.7 0.18 330))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Zéro montage.
            </span>
          </h1>

          <p style={{ fontSize: 17, color: "var(--tx-2)", lineHeight: 1.6, maxWidth: 480, marginBottom: 34 }}>
            Shorts Factory transforme une simple idée en short prêt à publier — scénario, voix off, vidéo, musique et sous-titres générés automatiquement pour TikTok, YouTube & Reels.
          </p>

          <div style={{ display: "flex", gap: 14, marginBottom: 30 }}>
            <Link href="/sign-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", borderRadius: 11,
              fontSize: 15.5, fontWeight: 600,
              background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 8px 24px oklch(0.66 0.21 var(--accent-h) / 0.4)",
            }}>
              ▶ Créer mon premier short
            </Link>
            <Link href="/pricing" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 22px", borderRadius: 11,
              fontSize: 15.5, fontWeight: 600, background: "transparent", color: "var(--tx-1)",
              border: "1px solid var(--line)", textDecoration: "none",
            }}>
              Voir les tarifs
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 13, color: "var(--tx-3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={15} style={{ color: "var(--ok)" }} />Sans carte bancaire
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={15} style={{ color: "var(--accent-bright)" }} />~90s par vidéo
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Repeat size={15} style={{ color: "var(--tx-2)" }} />Mode pilote auto
            </span>
          </div>
        </div>

        {/* Hero illustration — video cards */}
        <div style={{ display: "grid", placeItems: "center" }}>
          <div style={{ position: "relative", height: 320, width: 420 }}>
            {[
              { x: 0,   y: 20, rot: -6, w: 130, seed: 0, cap: "L&apos;espace SENT le métal" },
              { x: 148, y: 0,  rot: 3,  w: 148, seed: 2, cap: "Personne ne le savait" },
              { x: 308, y: 36, rot: 7,  w: 120, seed: 4, cap: "1920 vs aujourd&apos;hui" },
            ].map((it, i) => (
              <div key={i} style={{
                position: "absolute", left: it.x, top: it.y,
                transform: `rotate(${it.rot}deg)`,
                filter: "drop-shadow(0 20px 40px oklch(0 0 0 / 0.5))",
              }}>
                <div style={{
                  width: it.w, height: it.w * (16/9), borderRadius: Math.max(10, it.w * 0.08),
                  position: "relative", overflow: "hidden", border: "1px solid var(--line-strong)", flexShrink: 0,
                  background: i === 0
                    ? "radial-gradient(120% 90% at 30% 15%, oklch(0.55 0.2 280), transparent 60%), radial-gradient(120% 90% at 80% 90%, oklch(0.42 0.18 320), transparent 55%), var(--bg-3)"
                    : i === 1
                    ? "radial-gradient(120% 90% at 30% 15%, oklch(0.5 0.18 200), transparent 60%), radial-gradient(120% 90% at 80% 90%, oklch(0.42 0.16 260), transparent 55%), var(--bg-3)"
                    : "radial-gradient(120% 90% at 30% 15%, oklch(0.58 0.17 30), transparent 60%), radial-gradient(120% 90% at 80% 90%, oklch(0.45 0.18 350), transparent 55%), var(--bg-3)",
                }}>
                  <div style={{
                    position: "absolute", left: 0, right: 0, bottom: "22%",
                    display: "flex", justifyContent: "center", padding: "0 8%",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, textAlign: "center",
                      fontSize: Math.max(9, it.w * 0.085), lineHeight: 1.1, textTransform: "uppercase",
                      color: "#fff", textShadow: "0 2px 8px oklch(0 0 0 / 0.7)",
                    }}
                    dangerouslySetInnerHTML={{ __html: it.cap }}
                    />
                  </div>
                  <div style={{ position: "absolute", left: 6, right: 6, bottom: 6, height: 3, borderRadius: 3, background: "oklch(1 0 0 / 0.22)" }}>
                    <div style={{ height: "100%", width: i === 1 ? "55%" : `${30 + i * 20}%`, background: "#fff", borderRadius: 3 }} />
                  </div>
                  {i === 1 && (
                    <div style={{ position: "absolute", top: 7, left: 7, display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: 99, fontSize: 9, fontWeight: 600, fontFamily: "var(--font-mono)", background: "var(--accent-soft)", color: "var(--accent-bright)", border: "1px solid var(--accent-line)" }}>
                      ✨ AUTO
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 40px 50px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)", letterSpacing: "0.15em", marginBottom: 20, textTransform: "uppercase" }}>
          Publie en un clic sur
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
          {[
            { label: "TikTok",   color: "var(--tk)", icon: "Tk" },
            { label: "YouTube",  color: "var(--yt)", icon: "▶" },
            { label: "Reels",    color: "var(--ig)", icon: "◉" },
          ].map(p => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--tx-2)" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: p.color, fontWeight: 700, fontSize: 14 }}>
                {p.icon}
              </div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            La chaîne de production
          </div>
          <h2 style={{ fontSize: 38, marginBottom: 14 }}>5 IA travaillent à la chaîne</h2>
          <p style={{ fontSize: 16, color: "var(--tx-2)", maxWidth: 540, margin: "0 auto" }}>
            Chaque étape est confiée au meilleur modèle. Toi, tu n&apos;écris qu&apos;une phrase.
          </p>
        </div>
        <div style={{ display: "flex", gap: 0, alignItems: "stretch", justifyContent: "center" }}>
          {PIPELINE_STEPS.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
              <div className="sf-card" style={{ flex: 1, padding: "24px 20px", textAlign: "center", width: 190 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px",
                  display: "grid", placeItems: "center", fontSize: 24,
                  background: "var(--accent-soft)", border: "1px solid var(--accent-line)",
                }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)", marginBottom: 6 }}>
                  0{i + 1} · {s.engine}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--tx-0)", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "var(--tx-3)", lineHeight: 1.4 }}>{s.sub}</div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div style={{ padding: "0 6px", color: "var(--tx-3)", fontSize: 18 }}>›</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Two modes */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 40px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="sf-card" style={{ padding: 34, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "var(--accent-soft)", filter: "blur(40px)" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-mono)", background: "var(--accent-soft)", color: "var(--accent-bright)", border: "1px solid var(--accent-line)", marginBottom: 18 }}>
              ⚡ MODE STUDIO
            </div>
            <h3 style={{ fontSize: 26, margin: "0 0 12px" }}>Crée à la demande</h3>
            <p style={{ fontSize: 14.5, color: "var(--tx-2)", lineHeight: 1.6, marginBottom: 22 }}>
              Contrôle total : prompt libre, qualité Standard à Cinema, durée, sous-titres. Paiement aux crédits, sans engagement.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["3 niveaux de qualité IA", "Estimateur de coût live", "Aperçu plan par plan"].map(f => (
                <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--tx-1)" }}>
                  <CheckCircle size={16} style={{ color: "var(--accent-bright)", flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
          </div>

          <div className="sf-card" style={{ padding: 34, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "oklch(0.7 0.18 330 / 0.14)", filter: "blur(40px)" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-mono)", background: "oklch(0.7 0.16 300 / 0.14)", color: "var(--cinema)", border: "1px solid oklch(0.7 0.16 300 / 0.32)", marginBottom: 18 }}>
              🔄 MODE AUTO
            </div>
            <h3 style={{ fontSize: 26, margin: "0 0 12px" }}>Pilote automatique</h3>
            <p style={{ fontSize: 14.5, color: "var(--tx-2)", lineHeight: 1.6, marginBottom: 22 }}>
              Configure une série et l&apos;app génère et publie automatiquement chaque jour. Abonnement fixe mensuel.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Avatars IA récurrents", "Sujets via tendances Google", "Publication programmée"].map(f => (
                <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--tx-1)" }}>
                  <CheckCircle size={16} style={{ color: "var(--cinema)", flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px 80px" }}>
        <div className="sf-card glow-accent" style={{
          padding: 54, textAlign: "center",
          background: "linear-gradient(160deg, var(--bg-1), var(--bg-0))",
        }}>
          <h2 style={{ fontSize: 40, marginBottom: 16 }}>Ta chaîne tourne sans toi.</h2>
          <p style={{ fontSize: 17, color: "var(--tx-2)", marginBottom: 30, maxWidth: 480, margin: "0 auto 30px" }}>
            Commence gratuitement. Génère ton premier short en moins de deux minutes.
          </p>
          <Link href="/sign-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 11,
            fontSize: 15.5, fontWeight: 600,
            background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
            color: "#fff", textDecoration: "none",
            boxShadow: "0 8px 24px oklch(0.66 0.21 var(--accent-h) / 0.4)",
          }}>
            Entrer dans le studio <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--line)", marginTop: 20 }}>
        <div style={{ padding: "28px 40px", maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--tx-0)" }}>
            Shorts<span style={{ color: "var(--accent-bright)" }}>Factory</span>
          </span>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--tx-3)" }}>
            <Link href="/pricing" style={{ textDecoration: "none", color: "inherit" }}>Tarifs</Link>
            <Link href="/legal/terms" style={{ textDecoration: "none", color: "inherit" }}>CGU</Link>
            <Link href="/legal/privacy" style={{ textDecoration: "none", color: "inherit" }}>Confidentialité</Link>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>© 2026 Shorts Factory</div>
        </div>
      </footer>
    </div>
  );
}
