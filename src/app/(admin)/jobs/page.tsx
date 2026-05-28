import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";

export default async function AdminJobsPage() {
  const snap = await adminDb
    .collection("jobs")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    QUEUED:                { bg: "var(--bg-2)",                    color: "var(--tx-3)" },
    PROCESSING_STORYBOARD: { bg: "var(--accent-soft)",             color: "var(--accent-bright)" },
    GENERATING_SCENES:     { bg: "var(--accent-soft)",             color: "var(--accent-bright)" },
    ASSEMBLING:            { bg: "var(--accent-soft)",             color: "var(--accent-bright)" },
    READY:                 { bg: "oklch(0.74 0.16 155 / 0.13)",    color: "var(--ok)" },
    DONE:                  { bg: "oklch(0.74 0.16 155 / 0.13)",    color: "var(--ok)" },
    FAILED:                { bg: "oklch(0.66 0.2 22 / 0.13)",      color: "var(--bad)" },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          Monitoring
        </div>
        <h1 style={{ fontSize: 26 }}>Tous les jobs</h1>
      </div>

      <div className="sf-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["Prompt", "User", "Qualité", "Durée", "Statut", "Crédits", ""].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--tx-3)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(jobs as Record<string, unknown>[]).map(job => {
              const st = STATUS_STYLES[(job.status as string) ?? "QUEUED"] ?? STATUS_STYLES.QUEUED;
              return (
                <tr key={job.id as string} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--tx-0)", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(job.userPrompt as string)?.slice(0, 50) ?? "—"}
                  </td>
                  <td style={{ padding: "11px 14px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>
                    {(job.userId as string)?.slice(0, 12) ?? "admin"}
                    {!!job.isAdminTest && <span style={{ marginLeft: 5, color: "oklch(0.78 0.15 75)" }}>TEST</span>}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>
                    {job.videoQuality as string}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>
                    {job.durationSeconds as number}s
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 99, fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-mono)", background: st.bg, color: st.color }}>
                      {job.status as string}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--tx-3)" }}>
                    {job.actualCredits != null ? `${job.actualCredits} cr` : job.estimatedCredits != null ? `~${job.estimatedCredits}` : "—"}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <Link href={`/jobs/${job.id}`} style={{ fontSize: 12.5, color: "var(--accent-bright)", textDecoration: "none", fontWeight: 600 }}>
                      →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
