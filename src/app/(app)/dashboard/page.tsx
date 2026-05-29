import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Repeat, Eye, Coins, Plus, ChevronRight, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  QUEUED:                  { bg: "var(--bg-2)",                fg: "var(--tx-3)",           label: "En attente" },
  PROCESSING_STORYBOARD:   { bg: "var(--accent-soft)",         fg: "var(--accent-bright)",  label: "Scénario…" },
  GENERATING_SCENES:       { bg: "var(--accent-soft)",         fg: "var(--accent-bright)",  label: "Génération…" },
  ASSEMBLING:              { bg: "var(--accent-soft)",         fg: "var(--accent-bright)",  label: "Assemblage…" },
  READY:                   { bg: "oklch(0.74 0.16 155 / 0.13)", fg: "var(--ok)",            label: "Prête" },
  DONE:                    { bg: "oklch(0.74 0.16 155 / 0.13)", fg: "var(--ok)",            label: "Publiée" },
  FAILED:                  { bg: "oklch(0.66 0.2 22 / 0.13)", fg: "var(--bad)",             label: "Échec" },
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userDoc = await adminDb.collection("users").doc(userId).get();
  const user = userDoc.data()!;

  const recentSnap = await adminDb
    .collection("jobs")
    .where("userId", "==", userId)
    .limit(20)
    .get();

  const recentJobs = recentSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0;
      const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0;
      return tb - ta;
    })
    .slice(0, 4);

  const seriesSnap = await adminDb
    .collection("series")
    .where("userId", "==", userId)
    .where("isActive", "==", true)
    .limit(3)
    .get();

  const activeSeries = seriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const firstName = user.name?.split(" ")[0] ?? null;
  const balance: number = user.creditsBalance ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {/* Hero card */}
      <div className="sf-card glow-accent" style={{
        padding: 26,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
        background: "linear-gradient(120deg, var(--accent-soft), transparent 60%), var(--panel)",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.1em", marginBottom: 8 }}>
            BONJOUR{firstName ? `, ${firstName.toUpperCase()}` : ""} 👋
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Prêt à produire ?</h1>
          <p style={{ fontSize: 14, color: "var(--tx-2)" }}>
            Tu as{" "}
            <strong style={{ fontFamily: "var(--font-mono)", color: "var(--accent-bright)" }}>
              {balance.toLocaleString("fr")} crédits
            </strong>
            {" "}· soit ≈ {Math.floor(balance / 217)} vidéos Standard.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/create" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 10, fontSize: 14.5, fontWeight: 600,
            background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
            color: "#fff", textDecoration: "none",
            boxShadow: "0 6px 20px oklch(0.66 0.21 var(--accent-h) / 0.4)",
          }}>
            <Plus size={17} />Créer un short
          </Link>
          <Link href="/series/new" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 10, fontSize: 14.5, fontWeight: 600,
            background: "transparent", color: "var(--tx-1)",
            border: "1px solid var(--line)", textDecoration: "none",
          }}>
            <Repeat size={17} />Nouvelle série
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Vidéos générées", value: recentJobs.length.toString(), sub: "récentes", icon: Film },
          { label: "Séries actives", value: activeSeries.length.toString(), sub: "en auto-pilote", icon: Repeat },
          { label: "Vues cumulées", value: "—", sub: "via plateformes", icon: Eye },
          { label: "Crédits", value: balance.toLocaleString("fr"), sub: `Plan ${user.plan}`, icon: Coins },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="sf-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--tx-2)", fontWeight: 600 }}>{label}</span>
              <Icon size={17} style={{ color: "var(--accent-bright)" }} />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--tx-0)", letterSpacing: "-0.02em" }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "var(--tx-3)" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent videos + series */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, alignItems: "start" }}>
        {/* Recent jobs */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>Production</div>
              <h2 style={{ fontSize: 22 }}>Vidéos récentes</h2>
            </div>
            <Link href="/jobs" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--tx-2)", textDecoration: "none" }}>
              Tout voir <ChevronRight size={14} />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="sf-card" style={{ padding: 32, textAlign: "center" }}>
              <Film size={32} style={{ color: "var(--tx-3)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--tx-3)", fontSize: 13, marginBottom: 16 }}>Aucune vidéo encore. Crée ton premier short !</p>
              <Link href="/create" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px",
                borderRadius: 10, fontSize: 13, fontWeight: 600, background: "var(--accent-soft)",
                color: "var(--accent-bright)", border: "1px solid var(--accent-line)", textDecoration: "none",
              }}>
                <Plus size={14} />Créer maintenant
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(recentJobs as Record<string, unknown>[]).map(job => {
                const st = STATUS_COLORS[(job.status as string) ?? "QUEUED"] ?? STATUS_COLORS.QUEUED;
                return (
                  <Link key={job.id as string} href={`/jobs/${job.id}`} className="sf-card" style={{
                    display: "flex", gap: 14, padding: 12, alignItems: "center",
                    textDecoration: "none", transition: "border-color .14s",
                  }}>
                    {/* Thumbnail placeholder 9:16 */}
                    <div style={{
                      width: 46, height: 82, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(150deg, var(--accent-deep), var(--bg-3))",
                      border: "1px solid var(--line-strong)",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--tx-0)", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {(job.userPrompt as string) ?? "Sans titre"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 99,
                          fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)",
                          background: "var(--accent-soft)", color: "var(--accent-bright)", border: "1px solid var(--accent-line)",
                        }}>
                          {(job.videoQuality as string) ?? "standard"}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>
                          {(job.durationSeconds as number) ?? "?"}s
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 99,
                        fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)",
                        background: st.bg, color: st.fg, border: `1px solid ${st.fg}33`,
                      }}>
                        {st.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Active series */}
        <div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>Mode auto</div>
            <h2 style={{ fontSize: 22 }}>Prochaines séries</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(activeSeries as Record<string, unknown>[]).map(s => (
              <Link key={s.id as string} href={`/series/${s.id}`} className="sf-card" style={{ padding: 16, textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: "var(--accent-soft)", color: "var(--accent-bright)",
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    <Repeat size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name as string}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--tx-3)" }}>
                      {s.frequency as string}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--tx-2)", display: "flex", gap: 6, alignItems: "center" }}>
                    <Clock size={13} style={{ color: "var(--accent-bright)" }} />
                    Prochaine génération auto
                  </span>
                </div>
              </Link>
            ))}

            <Link href="/series/new" className="sf-card" style={{
              padding: 16, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, color: "var(--tx-2)", fontWeight: 600, fontSize: 13,
              borderStyle: "dashed", textDecoration: "none",
            }}>
              <Plus size={16} />Configurer une série
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
