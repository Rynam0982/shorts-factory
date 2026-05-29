import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Eye } from "lucide-react";

const QUALITY_STYLES: Record<string, { bg: string; color: string }> = {
  standard: { bg: "var(--bg-2)",        color: "var(--tx-2)" },
  premium:  { bg: "var(--accent-soft)", color: "var(--accent-bright)" },
  cinema:   { bg: "oklch(0.7 0.16 300 / 0.14)", color: "var(--cinema)" },
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  QUEUED:                { bg: "var(--bg-2)",                        color: "var(--tx-3)",          label: "En attente" },
  PROCESSING_STORYBOARD: { bg: "var(--accent-soft)",                 color: "var(--accent-bright)", label: "Scénario…" },
  GENERATING_SCENES:     { bg: "var(--accent-soft)",                 color: "var(--accent-bright)", label: "Scènes…" },
  ASSEMBLING:            { bg: "var(--accent-soft)",                 color: "var(--accent-bright)", label: "Assemblage…" },
  READY:                 { bg: "oklch(0.74 0.16 155 / 0.13)",        color: "var(--ok)",            label: "Prête" },
  DONE:                  { bg: "oklch(0.74 0.16 155 / 0.13)",        color: "var(--ok)",            label: "Publiée" },
  FAILED:                { bg: "oklch(0.66 0.2 22 / 0.13)",          color: "var(--bad)",           label: "Échec" },
};

export default async function JobsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const snap = await adminDb
    .collection("jobs")
    .where("userId", "==", userId)
    .limit(50)
    .get();

  const jobs = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0;
      const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0;
      return tb - ta;
    });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          Bibliothèque
        </div>
        <h1 style={{ fontSize: 26 }}>Historique des vidéos</h1>
      </div>

      {jobs.length === 0 ? (
        <div className="sf-card" style={{ padding: 48, textAlign: "center" }}>
          <Film size={40} style={{ color: "var(--tx-3)", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--tx-2)", fontSize: 14 }}>Aucune vidéo générée encore.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 18 }}>
          {(jobs as Record<string, unknown>[]).map(job => {
            const st = STATUS_STYLES[(job.status as string) ?? "QUEUED"] ?? STATUS_STYLES.QUEUED;
            const qt = QUALITY_STYLES[(job.videoQuality as string) ?? "standard"] ?? QUALITY_STYLES.standard;
            return (
              <Link
                key={job.id as string}
                href={`/jobs/${job.id}`}
                className="sf-card"
                style={{ padding: 12, textDecoration: "none", transition: "border-color .14s" }}
              >
                {/* Thumbnail */}
                <div style={{
                  aspectRatio: "9/16", borderRadius: 10, overflow: "hidden", marginBottom: 12, position: "relative",
                  background: "linear-gradient(150deg, var(--accent-deep), var(--bg-3))",
                  border: "1px solid var(--line-strong)",
                }}>
                  {job.thumbnailUrl ? (
                    <img src={job.thumbnailUrl as string} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                      <Film size={24} style={{ color: "var(--tx-3)" }} />
                    </div>
                  )}
                  {/* Status badge */}
                  <div style={{
                    position: "absolute", top: 7, left: 7,
                    display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 99,
                    fontSize: 9.5, fontWeight: 600, fontFamily: "var(--font-mono)",
                    background: st.bg, color: st.color,
                  }}>
                    {st.label}
                  </div>
                </div>

                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--tx-0)", marginBottom: 8, lineHeight: 1.3, minHeight: 34, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {(job.userPrompt as string) ?? "Sans titre"}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    display: "inline-flex", padding: "1.5px 7px", borderRadius: 99, fontSize: 10.5,
                    fontWeight: 600, fontFamily: "var(--font-mono)", background: qt.bg, color: qt.color,
                  }}>
                    {(job.videoQuality as string) ?? "standard"}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--tx-3)", display: "flex", gap: 4, alignItems: "center" }}>
                    <Eye size={12} />{(job.durationSeconds as number) ?? "?"}s
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
