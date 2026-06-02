import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Eye } from "lucide-react";

// Always read fresh from Firestore — never use stale build-time cache
export const dynamic = "force-dynamic";

const QUALITY_STYLES: Record<string, { bg: string; color: string }> = {
  standard: { bg: "var(--bg-2)",        color: "var(--tx-2)" },
  premium:  { bg: "var(--accent-soft)", color: "var(--accent-bright)" },
  cinema:   { bg: "oklch(0.7 0.16 300 / 0.14)", color: "var(--cinema)" },
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  QUEUED:                { bg: "var(--bg-2)",                  color: "var(--tx-3)",          label: "En attente" },
  PROCESSING_STORYBOARD: { bg: "var(--accent-soft)",           color: "var(--accent-bright)", label: "Scénario…" },
  GENERATING_SCENES:     { bg: "var(--accent-soft)",           color: "var(--accent-bright)", label: "Scènes…" },
  ASSEMBLING:            { bg: "var(--accent-soft)",           color: "var(--accent-bright)", label: "Assemblage…" },
  READY:                 { bg: "oklch(0.74 0.16 155 / 0.13)", color: "var(--ok)",            label: "Prête" },
  DONE:                  { bg: "oklch(0.74 0.16 155 / 0.13)", color: "var(--ok)",            label: "Publiée" },
  FAILED:                { bg: "oklch(0.66 0.2 22 / 0.13)",   color: "var(--bad)",           label: "Échec" },
};

interface JobSummary {
  id: string;
  userPrompt: string;
  status: string;
  videoQuality: string;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  createdAtSeconds: number;
}

export default async function JobsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let jobs: JobSummary[] = [];
  try {
    const snap = await adminDb
      .collection("jobs")
      .where("userId", "==", userId)
      .limit(50)
      .get();

    // Only extract the fields we actually render — avoids issues with
    // complex nested objects (Timestamps, simulationDebug, etc.)
    jobs = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id:              d.id,
          userPrompt:      typeof data.userPrompt === "string" ? data.userPrompt : "Sans titre",
          status:          typeof data.status      === "string" ? data.status      : "QUEUED",
          videoQuality:    typeof data.videoQuality === "string" ? data.videoQuality : "standard",
          durationSeconds: typeof data.durationSeconds === "number" ? data.durationSeconds : null,
          thumbnailUrl:    typeof data.thumbnailUrl === "string"  ? data.thumbnailUrl  : null,
          createdAtSeconds: (data.createdAt as { seconds?: number })?.seconds ?? 0,
        };
      })
      .sort((a, b) => b.createdAtSeconds - a.createdAtSeconds);
  } catch (err) {
    console.error("[JobsPage] Firestore error:", err);
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)",
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7,
        }}>
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 18,
        }}>
          {jobs.map(job => {
            const st = STATUS_STYLES[job.status] ?? STATUS_STYLES.QUEUED;
            const qt = QUALITY_STYLES[job.videoQuality] ?? QUALITY_STYLES.standard;

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="sf-card"
                style={{ padding: 12, textDecoration: "none", transition: "border-color .14s" }}
              >
                {/* Thumbnail */}
                <div style={{
                  aspectRatio: "9/16", borderRadius: 10, overflow: "hidden",
                  marginBottom: 12, position: "relative",
                  background: "linear-gradient(150deg, var(--accent-deep), var(--bg-3))",
                  border: "1px solid var(--line-strong)",
                }}>
                  {job.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.thumbnailUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "grid", placeItems: "center",
                    }}>
                      <Film size={24} style={{ color: "var(--tx-3)" }} />
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{
                    position: "absolute", top: 7, left: 7,
                    display: "inline-flex", alignItems: "center",
                    padding: "2px 7px", borderRadius: 99,
                    fontSize: 9.5, fontWeight: 600, fontFamily: "var(--font-mono)",
                    background: st.bg, color: st.color,
                  }}>
                    {st.label}
                  </div>
                </div>

                {/* Title — simple two-line clamp via CSS class */}
                <p style={{
                  fontWeight: 600, fontSize: 13, color: "var(--tx-0)",
                  marginBottom: 8, lineHeight: 1.3, minHeight: 34,
                  overflow: "hidden",
                  maxHeight: "2.6em",   // 2 lines × 1.3 line-height
                }}>
                  {job.userPrompt}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    display: "inline-flex", padding: "1.5px 7px", borderRadius: 99,
                    fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-mono)",
                    background: qt.bg, color: qt.color,
                  }}>
                    {job.videoQuality}
                  </span>
                  <span style={{
                    fontSize: 11.5, color: "var(--tx-3)",
                    display: "flex", gap: 4, alignItems: "center",
                  }}>
                    <Eye size={12} />
                    {job.durationSeconds !== null ? `${job.durationSeconds}s` : "?"}
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
