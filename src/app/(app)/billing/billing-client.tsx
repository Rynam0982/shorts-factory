"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2, ExternalLink, Zap } from "lucide-react";

const PLANS = [
  {
    id: "starter_creator",
    name: "Creator",
    price: "19.99€/mois",
    features: ["1 série AUTO", "3 vidéos/série/semaine", "Standard quality", "50 crédits bonus", "Suggestions de tendances"],
  },
  {
    id: "creator_pro",
    name: "Creator Pro",
    price: "34.99€/mois",
    features: ["3 séries AUTO", "7 vidéos/série/semaine", "Standard + Premium", "200 crédits bonus", "Multi-langue", "Thumbnails IA"],
    highlighted: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "44.99€/mois",
    features: ["5000 crédits/mois", "Toutes les qualités incl. Cinema", "50 jobs/jour", "File prioritaire", "Musique Suno"],
  },
  {
    id: "agency",
    name: "Agency",
    price: "79.99€/mois",
    features: ["10 séries AUTO", "14 vidéos/série/semaine", "3000 crédits/mois", "5 jobs concurrent", "3 sièges équipe"],
  },
];

export default function BillingClient({ user, stripeConfigured = true }: { user: Record<string, unknown>; stripeConfigured?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function subscribe(planId: string) {
    if (!stripeConfigured) {
      toast.error("Les paiements ne sont pas encore configurés. Contacte l'administrateur.");
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      let data: { url?: string; error?: string } = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) { toast.error(data.error ?? `Erreur serveur (${res.status})`); return; }
      if (data.url) window.location.href = data.url;
      else toast.error("Erreur lors du checkout — URL manquante");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      let data: { url?: string; error?: string } = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) { toast.error(data.error ?? `Erreur portail (${res.status})`); return; }
      if (data.url) window.open(data.url, "_blank");
      else toast.error("Erreur portail Stripe — URL manquante");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(null);
    }
  }

  const currentPlan = user.plan as string;
  const isActive = user.subscriptionStatus === "active";

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          Facturation
        </div>
        <h1 style={{ fontSize: 26 }}>Abonnement</h1>
      </div>

      {/* Current plan banner */}
      {currentPlan !== "free" && (
        <div className="sf-card" style={{
          padding: "18px 22px", marginBottom: 28,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "linear-gradient(120deg, var(--accent-soft), transparent)",
        }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--tx-2)", marginBottom: 4 }}>Plan actuel</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--tx-0)" }}>
              {currentPlan.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, padding: "2px 8px",
              borderRadius: 99, fontSize: 11, fontFamily: "var(--font-mono)",
              background: isActive ? "oklch(0.74 0.16 155 / 0.13)" : "oklch(0.78 0.15 75 / 0.13)",
              color: isActive ? "var(--ok)" : "var(--warn)",
              border: `1px solid ${isActive ? "oklch(0.74 0.16 155 / 0.3)" : "oklch(0.78 0.15 75 / 0.3)"}`,
            }}>
              {isActive ? "ACTIF" : (user.subscriptionStatus as string)?.toUpperCase()}
            </div>
          </div>
          <button
            onClick={openPortal}
            disabled={loading === "portal"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10,
              fontSize: 13, fontWeight: 600, background: "var(--bg-2)", color: "var(--tx-0)",
              border: "1px solid var(--line)", cursor: "pointer",
            }}
          >
            {loading === "portal" ? <Loader2 size={14} style={{ animation: "spin 0.9s linear infinite" }} /> : <ExternalLink size={14} />}
            Gérer l&apos;abonnement
          </button>
        </div>
      )}

      {/* Plans grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className="sf-card"
              style={{
                padding: 26, position: "relative", overflow: "hidden",
                border: plan.highlighted ? "1.5px solid var(--accent-line)" : "1px solid var(--line)",
                boxShadow: plan.highlighted ? "0 0 30px var(--accent-soft)" : "none",
              }}
            >
              {plan.highlighted && (
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: "var(--accent)", color: "#fff",
                  fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                  padding: "3px 12px", borderBottomLeftRadius: 8,
                }}>
                  POPULAIRE
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--accent-bright)" }}>
                  {plan.price}
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13, color: "var(--tx-1)" }}>
                    <CheckCircle size={14} style={{ color: "var(--ok)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div style={{
                  width: "100%", padding: "10px 0", textAlign: "center", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)",
                  background: "var(--accent-soft)", color: "var(--accent-bright)",
                  border: "1px solid var(--accent-line)",
                }}>
                  ✓ Plan actuel
                </div>
              ) : (
                <button
                  onClick={() => subscribe(plan.id)}
                  disabled={!!loading}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "11px 0", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    background: plan.highlighted
                      ? "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))"
                      : "var(--bg-2)",
                    color: plan.highlighted ? "#fff" : "var(--tx-0)",
                    border: plan.highlighted ? "none" : "1px solid var(--line)",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: plan.highlighted ? "0 6px 20px oklch(0.66 0.21 var(--accent-h) / 0.4)" : "none",
                  }}
                >
                  {loading === plan.id ? <Loader2 size={14} style={{ animation: "spin 0.9s linear infinite" }} /> : <Zap size={14} />}
                  {currentPlan === "free" ? "Commencer" : "Changer de plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
