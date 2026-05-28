"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw, CheckCircle, AlertCircle, Loader2, ArrowLeft, Film } from "lucide-react";
import Link from "next/link";

const PIPELINE_STEPS = [
  { id: "storyboard", label: "Scénario",   statuses: ["PROCESSING_STORYBOARD"] },
  { id: "scenes",     label: "Scènes",     statuses: ["GENERATING_SCENES"] },
  { id: "assemble",   label: "Assemblage", statuses: ["ASSEMBLING"] },
  { id: "upload",     label: "Upload",     statuses: ["READY", "DONE"] },
];

function stepState(stepIndex: number, currentStatus: string) {
  const doneStatuses = ["READY", "DONE"];
  const orderMap: Record<string, number> = {
    QUEUED: -1,
    PROCESSING_STORYBOARD: 0,
    GENERATING_SCENES: 1,
    ASSEMBLING: 2,
    READY: 3,
    DONE: 3,
    FAILED: -2,
    PUBLISHING: 3,
  };
  const currentOrder = orderMap[currentStatus] ?? -1;
  if (currentOrder > stepIndex) return "done";
  if (currentOrder === stepIndex) return "active";
  return "todo";
}

export default function JobDetailClient({
  job: initialJob,
  isAdmin,
}: {
  job: Record<string, unknown>;
  isAdmin: boolean;
}) {
  const [job, setJob] = useState(initialJob);
  const isTerminal = ["READY", "DONE", "FAILED"].includes(job.status as string);

  useEffect(() => {
    if (isTerminal) return;
    const evtSource = new EventSource(`/api/jobs/${job.id}/status`);
    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.status) {
        setJob(prev => ({ ...prev, ...data }));
      }
    };
    return () => evtSource.close();
  }, [job.id, isTerminal]);

  const status = job.status as string;
  const failed = status === "FAILED";
  const ready = status === "READY" || status === "DONE";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Back */}
      <Link href="/jobs" style={{
        display: "inline-flex", alignItems: "center", gap: 7, color: "var(--tx-2)",
        fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={15} />Retour à l&apos;historique
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28, alignItems: "start" }}>
        {/* Thumbnail / video preview */}
        <div>
          <div style={{
            aspectRatio: "9/16", borderRadius: 16, overflow: "hidden",
            background: "linear-gradient(150deg, var(--accent-deep), var(--bg-3))",
            border: "1px solid var(--line-strong)", display: "grid", placeItems: "center",
          }}>
            {job.thumbnailUrl ? (
              <img
                src={job.thumbnailUrl as string}
                alt="thumbnail"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Film size={32} style={{ color: "var(--tx-3)" }} />
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Status header */}
          <div className="sf-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)", marginBottom: 6 }}>
                  JOB · {(job.id as string).slice(0, 12).toUpperCase()}
                  {isAdmin && <span style={{ marginLeft: 8, color: "oklch(0.78 0.15 75)" }}>ADMIN</span>}
                </div>
                <h1 style={{ fontSize: 22, lineHeight: 1.3 }}>
                  {(job.userPrompt as string)?.slice(0, 80) ?? "Vidéo sans titre"}
                </h1>
              </div>

              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99,
                fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)",
                background: failed ? "oklch(0.66 0.2 22 / 0.13)" : ready ? "oklch(0.74 0.16 155 / 0.13)" : "var(--accent-soft)",
                color: failed ? "var(--bad)" : ready ? "var(--ok)" : "var(--accent-bright)",
                border: `1px solid ${failed ? "oklch(0.66 0.2 22 / 0.3)" : ready ? "oklch(0.74 0.16 155 / 0.3)" : "var(--accent-line)"}`,
              }}>
                {failed ? <AlertCircle size={12} /> : ready ? <CheckCircle size={12} /> : <Loader2 size={12} style={{ animation: "spin 0.9s linear infinite" }} />}
                {status}
              </span>
            </div>

            {/* Meta */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { label: "QUALITÉ",  value: (job.videoQuality as string)?.toUpperCase() ?? "—" },
                { label: "DURÉE",    value: `${job.durationSeconds ?? "?"}s` },
                { label: "CRÉDITS",  value: job.actualCredits != null ? `${job.actualCredits} cr` : job.estimatedCredits != null ? `~${job.estimatedCredits} cr` : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--tx-0)" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline steps (while generating) */}
          {!ready && !failed && (
            <div className="sf-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--tx-2)", marginBottom: 14 }}>Progression</div>
              <div style={{ display: "flex", gap: 8 }}>
                {PIPELINE_STEPS.map((step, i) => {
                  const s = stepState(i, status);
                  return (
                    <div key={step.id} style={{
                      flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center",
                      background: s === "active" ? "var(--accent-soft)" : "var(--bg-1)",
                      border: `1px solid ${s === "active" ? "var(--accent-line)" : "var(--line)"}`,
                      transition: "all .25s",
                    }}>
                      <div style={{
                        display: "grid", placeItems: "center", marginBottom: 6,
                        color: s === "done" ? "var(--ok)" : s === "active" ? "var(--accent-bright)" : "var(--tx-3)",
                      }}>
                        {s === "done" ? <CheckCircle size={18} /> :
                          s === "active" ? <Loader2 size={18} style={{ animation: "spin 0.9s linear infinite" }} /> :
                            <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid var(--line)" }} />}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: s === "todo" ? "var(--tx-3)" : "var(--tx-0)" }}>{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {failed && !!job.errorMsg && (
            <div style={{
              padding: 16, borderRadius: 12, background: "oklch(0.66 0.2 22 / 0.1)",
              border: "1px solid oklch(0.66 0.2 22 / 0.3)",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AlertCircle size={16} style={{ color: "var(--bad)", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bad)", marginBottom: 4 }}>Erreur</div>
                  <div style={{ fontSize: 12.5, color: "var(--tx-2)" }}>{job.errorMsg as string}</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions when ready */}
          {ready && (
            <div className="sf-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-0)", marginBottom: 14 }}>Actions</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!!job.finalVideoUrl && (
                  <a
                    href={job.finalVideoUrl as string}
                    download
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: "var(--bg-2)", color: "var(--tx-0)",
                      border: "1px solid var(--line)", textDecoration: "none",
                    }}
                  >
                    <Download size={14} />Télécharger
                  </a>
                )}
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "transparent", color: "var(--tx-2)",
                    border: "1px solid var(--line)", cursor: "pointer",
                  }}
                >
                  <RefreshCw size={14} />Rafraîchir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
