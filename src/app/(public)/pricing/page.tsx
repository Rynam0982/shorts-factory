import Link from "next/link";
import { CheckCircle, ChevronRight } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Gratuit",
    price: "0€",
    sub: "pour toujours",
    features: ["1 vidéo/jour", "Qualité Standard", "Stockage local", "Watermark SF"],
    cta: "Commencer",
    href: "/sign-up",
    highlight: false,
  },
  {
    id: "starter_creator",
    name: "Creator",
    price: "19.99€",
    sub: "/mois",
    features: ["1 série AUTO", "3 vidéos/série/sem.", "Standard quality", "50 crédits bonus/mois", "Tendances Google"],
    cta: "Essayer Creator",
    href: "/sign-up",
    highlight: false,
  },
  {
    id: "creator_pro",
    name: "Creator Pro",
    price: "34.99€",
    sub: "/mois",
    features: ["3 séries AUTO", "Quotidien", "Standard + Premium 4K", "200 crédits bonus", "Multi-langue", "Thumbnails IA"],
    cta: "Essayer Creator Pro",
    href: "/sign-up",
    highlight: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "44.99€",
    sub: "/mois",
    features: ["5 000 crédits/mois", "Toutes qualités incl. Cinema", "50 jobs/jour", "File prioritaire", "Musique IA Suno"],
    cta: "Essayer Studio",
    href: "/sign-up",
    highlight: false,
  },
];

const CREDIT_PACKS = [
  { credits: 500,   price: "4.99€",  label: "Starter" },
  { credits: 2000,  price: "17.99€", label: "Pro" },
  { credits: 5000,  price: "39.99€", label: "Studio" },
  { credits: 15000, price: "99.99€", label: "Agency" },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Back to home */}
      <div style={{ padding: "20px 40px" }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--tx-2)", textDecoration: "none", fontWeight: 600 }}>
          ← Shorts<span style={{ color: "var(--accent-bright)" }}>Factory</span>
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontSize: 46, marginBottom: 14 }}>Tarifs simples et transparents</h1>
          <p style={{ fontSize: 17, color: "var(--tx-2)", maxWidth: 500, margin: "0 auto" }}>
            Commence gratuitement. Passe à un abonnement quand tu veux.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 70 }}>
          {PLANS.map(p => (
            <div
              key={p.id}
              className="sf-card"
              style={{
                padding: 26, display: "flex", flexDirection: "column",
                border: p.highlight ? "1.5px solid var(--accent-line)" : "1px solid var(--line)",
                boxShadow: p.highlight ? "0 0 30px var(--accent-soft)" : "none",
                position: "relative", overflow: "hidden",
              }}
            >
              {p.highlight && (
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: "var(--accent)", color: "#fff",
                  fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-mono)",
                  padding: "3px 10px", borderBottomLeftRadius: 8,
                }}>
                  POPULAIRE
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tx-0)", marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent-bright)" }}>
                    {p.price}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--tx-3)" }}>{p.sub}</span>
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, flex: 1, display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--tx-1)" }}>
                    <CheckCircle size={13} style={{ color: "var(--ok)", flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={p.href} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                background: p.highlight ? "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))" : "var(--bg-2)",
                color: p.highlight ? "#fff" : "var(--tx-0)",
                border: p.highlight ? "none" : "1px solid var(--line)",
                textDecoration: "none",
                boxShadow: p.highlight ? "0 6px 20px oklch(0.66 0.21 var(--accent-h) / 0.4)" : "none",
              }}>
                {p.cta} <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>

        {/* Credit packs */}
        <div>
          <h2 style={{ fontSize: 26, textAlign: "center", marginBottom: 8 }}>Packs de crédits</h2>
          <p style={{ fontSize: 14, color: "var(--tx-2)", textAlign: "center", marginBottom: 36 }}>
            Complète ton abonnement ou utilise sans abonnement. 1 crédit = 0.01€.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {CREDIT_PACKS.map(pack => (
              <div key={pack.credits} className="sf-card" style={{ padding: 22, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--tx-3)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>{pack.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>
                  {pack.credits.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "var(--tx-3)", marginBottom: 16 }}>crédits</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--accent-bright)", marginBottom: 16 }}>
                  {pack.price}
                </div>
                <Link href="/sign-up" style={{
                  display: "block", padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600,
                  background: "var(--accent-soft)", color: "var(--accent-bright)",
                  border: "1px solid var(--accent-line)", textDecoration: "none",
                }}>
                  Acheter
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
