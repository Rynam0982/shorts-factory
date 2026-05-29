import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Repeat, Plus, Clock, Film } from "lucide-react";

const FREQ_LABELS: Record<string, string> = {
  daily: "Quotidien",
  twice_weekly: "2×/semaine",
  three_weekly: "3×/semaine",
  weekly: "Hebdomadaire",
};

export default async function SeriesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const snap = await adminDb
    .collection("series")
    .where("userId", "==", userId)
    .get();

  const series = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0;
      const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0;
      return tb - ta;
    });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
            Pilote automatique
          </div>
          <h1 style={{ fontSize: 26 }}>Mes séries</h1>
        </div>
        <Link href="/series/new" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
          fontSize: 13.5, fontWeight: 600,
          background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
          color: "#fff", textDecoration: "none",
          boxShadow: "0 6px 20px oklch(0.66 0.21 var(--accent-h) / 0.4)",
        }}>
          <Plus size={16} />Nouvelle série
        </Link>
      </div>

      {series.length === 0 ? (
        <div className="sf-card" style={{ padding: 48, textAlign: "center" }}>
          <Repeat size={40} style={{ color: "var(--tx-3)", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Aucune série encore</h2>
          <p style={{ color: "var(--tx-2)", fontSize: 14, marginBottom: 24 }}>
            Configure une série pour que l&apos;IA génère et publie automatiquement.
          </p>
          <Link href="/series/new" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 600, background: "var(--accent-soft)",
            color: "var(--accent-bright)", border: "1px solid var(--accent-line)", textDecoration: "none",
          }}>
            <Plus size={15} />Créer ma première série
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
          {(series as Record<string, unknown>[]).map(s => (
            <Link
              key={s.id as string}
              href={`/series/${s.id}`}
              className="sf-card"
              style={{ padding: 22, textDecoration: "none", transition: "border-color .14s", display: "flex", gap: 18 }}
            >
              {/* Thumbnail placeholder */}
              <div style={{
                width: 80, height: 142, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(150deg, var(--accent-deep), var(--bg-3))",
                border: "1px solid var(--line-strong)", display: "grid", placeItems: "center",
              }}>
                <Repeat size={20} style={{ color: "var(--tx-3)" }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, lineHeight: 1.3 }}>{s.name as string}</h3>
                  <span style={{
                    display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 99,
                    fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-mono)", flexShrink: 0,
                    background: s.isActive ? "oklch(0.74 0.16 155 / 0.13)" : "var(--bg-2)",
                    color: s.isActive ? "var(--ok)" : "var(--tx-3)",
                    border: `1px solid ${s.isActive ? "oklch(0.74 0.16 155 / 0.3)" : "var(--line)"}`,
                  }}>
                    {s.isActive ? "Active" : "En pause"}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "var(--tx-2)", marginBottom: 14, lineHeight: 1.4 }}>
                  {(s.topicPrompt as string)?.slice(0, 80)}
                </p>

                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--tx-3)" }}>
                  <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <Clock size={12} />{FREQ_LABELS[s.frequency as string] ?? s.frequency as string}
                  </span>
                  <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <Film size={12} />{s.totalVideosGenerated as number} vidéos
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
