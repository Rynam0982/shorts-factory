import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import type { SimulationDebug } from "@/lib/content-intelligence/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        color: "oklch(0.78 0.15 75)", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: 10, borderBottom: "1px solid var(--line)",
        paddingBottom: 6,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 6 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)",
        minWidth: 160, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: "var(--tx-1)", wordBreak: "break-word" }}>
        {value}
      </span>
    </div>
  );
}

// ── Simulation debug panel ─────────────────────────────────────────────────────

function SimulationPanel({ job }: { job: Record<string, unknown> }) {
  const debug = job.simulationDebug as SimulationDebug | null;
  if (!debug) {
    return (
      <div style={{
        padding: "32px 24px", background: "var(--panel-solid)",
        borderRadius: 12, border: "1px solid var(--line)",
        color: "var(--tx-3)", textAlign: "center", fontSize: 13,
      }}>
        Aucune donnée de simulation — le job utilise peut-être Claude ou est toujours en cours.
      </div>
    );
  }

  const storyboard = job.storyboard as { title?: string; suggestedMood?: string; scenes?: unknown[] } | null;
  const sceneDebugs = Object.values(debug.sceneDebugs ?? {});

  return (
    <div style={{
      background: "var(--panel-solid)", borderRadius: 12,
      border: "1px solid var(--line)", padding: "24px 28px",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "oklch(0.68 0.22 155)", marginBottom: 4 }}>
          SIMULATION DEBUG — RuleBasedContentProvider
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--tx-0)" }}>
          {storyboard?.title ?? debug.originalPrompt.slice(0, 60)}
        </div>
        <div style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 4 }}>
          Job ID: <code style={{ fontFamily: "var(--font-mono)", color: "var(--tx-2)" }}>{job.id as string}</code>
        </div>
      </div>

      {/* Step 1: Prompt analysis */}
      <Section title="Étape 1 — Analyse du prompt">
        <KVRow label="Prompt original"    value={debug.originalPrompt} />
        <KVRow label="Sujet principal"    value={<Badge color="oklch(0.68 0.22 155)">{debug.analysis.mainSubject}</Badge>} />
        <KVRow label="Sujet secondaire"   value={debug.analysis.secondarySubject || "—"} />
        <KVRow label="Catégorie"          value={<Badge color="oklch(0.78 0.15 75)">{debug.analysis.category}</Badge>} />
        <KVRow label="Ton"                value={debug.analysis.tone} />
        <KVRow label="Émotion"            value={debug.analysis.emotion} />
        <KVRow label="Énergie"            value={<Badge color={debug.analysis.energy === "high" ? "oklch(0.66 0.2 22)" : "oklch(0.68 0.22 155)"}>{debug.analysis.energy}</Badge>} />
      </Section>

      {/* Step 2: Keywords */}
      <Section title="Étape 2 — Mots-clés générés">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {debug.generatedKeywords.map((kw, i) => (
            <span key={i} style={{
              padding: "3px 10px", borderRadius: 99, fontSize: 12,
              background: "var(--bg-2)", color: "var(--tx-1)",
              border: "1px solid var(--line)", fontFamily: "var(--font-mono)",
            }}>
              {kw}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--tx-3)" }}>
          {debug.generatedKeywords.length} mots-clés générés
        </div>
      </Section>

      {/* Steps 3+4: Script */}
      <Section title="Étapes 3 & 4 — Scènes + Script généré">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {debug.generatedScript.map((line, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "8px 12px", background: "var(--bg-2)",
              borderRadius: 8, border: "1px solid var(--line)",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10, color: "oklch(0.78 0.15 75)",
                background: "oklch(0.78 0.15 75 / 0.12)", border: "1px solid oklch(0.78 0.15 75 / 0.3)",
                padding: "2px 8px", borderRadius: 99, flexShrink: 0,
              }}>
                Scène {i + 1}
              </span>
              <span style={{ fontSize: 13, color: "var(--tx-0)" }}>{line}</span>
            </div>
          ))}
        </div>
        <KVRow label="Durée totale" value={`${debug.totalDuration}s — ${debug.generatedScript.length} scènes`} />
      </Section>

      {/* Step 7: Music */}
      <Section title="Étape 7 — Musique Pixabay">
        <KVRow label="Catégorie mood"  value={<Badge color="oklch(0.78 0.15 75)">{storyboard?.suggestedMood ?? "—"}</Badge>} />
        <KVRow label="Requête Pixabay" value={<code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--tx-1)" }}>{debug.musicQuery}</code>} />
      </Section>

      {/* Step 8: SFX */}
      <Section title="Étape 8 — Effets sonores">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {debug.sfxTriggers.length === 0
            ? <span style={{ color: "var(--tx-3)", fontSize: 13 }}>Aucun SFX détecté</span>
            : debug.sfxTriggers.map((sfx, i) => (
              <Badge key={i} color="oklch(0.68 0.2 55)">{sfx}</Badge>
            ))
          }
        </div>
      </Section>

      {/* Steps 5+6: Per-scene media selection */}
      {sceneDebugs.length > 0 && (
        <Section title="Étapes 5 & 6 — Sélection média Pixabay (Score détaillé)">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sceneDebugs.map((sd, i) => (
              <div key={i} style={{
                padding: "12px 16px", background: "var(--bg-2)",
                borderRadius: 10, border: "1px solid var(--line)",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <Badge color="oklch(0.78 0.15 75)">Scène {sd.index + 1}</Badge>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>
                    Requêtes : {sd.queriesRan.join(" · ")}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--tx-0)", marginBottom: 10 }}>
                  {sd.voiceoverText}
                </div>

                {/* Keywords */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)", marginRight: 4 }}>KW:</span>
                  {[sd.primaryKeyword, ...sd.secondaryKeywords].filter(Boolean).map((kw, j) => (
                    <span key={j} style={{ fontSize: 11, padding: "1px 8px", background: "var(--panel-solid)", borderRadius: 99, color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Top results */}
                {sd.topResults.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                      <thead>
                        <tr>
                          {["#", "Score", "Pertinence", "Orientation", "Qualité", "Durée", "Diversité", "Tags"].map(h => (
                            <th key={h} style={{ padding: "4px 8px", textAlign: "left", color: "var(--tx-3)", borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sd.topResults.slice(0, 5).map((r, j) => (
                          <tr key={j} style={{
                            background: j === 0 ? "oklch(0.68 0.22 155 / 0.08)" : "transparent",
                            borderBottom: "1px solid var(--line)",
                          }}>
                            <td style={{ padding: "4px 8px", color: j === 0 ? "oklch(0.68 0.22 155)" : "var(--tx-3)" }}>{j === 0 ? "★" : j + 1}</td>
                            <td style={{ padding: "4px 8px", fontWeight: 700, color: "var(--tx-0)" }}>{r.totalScore}</td>
                            <td style={{ padding: "4px 8px", color: "var(--tx-1)" }}>{r.breakdown.relevance}</td>
                            <td style={{ padding: "4px 8px", color: "var(--tx-1)" }}>{r.breakdown.orientation}</td>
                            <td style={{ padding: "4px 8px", color: "var(--tx-1)" }}>{r.breakdown.quality}</td>
                            <td style={{ padding: "4px 8px", color: "var(--tx-1)" }}>{r.breakdown.duration}</td>
                            <td style={{ padding: "4px 8px", color: "var(--tx-1)" }}>{r.breakdown.diversity}</td>
                            <td style={{ padding: "4px 8px", color: "var(--tx-3)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.tags}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function SimulationPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job: selectedJobId } = await searchParams;

  // Fetch recent simulation jobs (admin test or free plan)
  const snap = await adminDb
    .collection("jobs")
    .where("isAdminTest", "==", true)
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];

  // Fetch selected job detail
  let selectedJob: Record<string, unknown> | null = null;
  if (selectedJobId) {
    const doc = await adminDb.collection("jobs").doc(selectedJobId).get();
    if (doc.exists) selectedJob = { id: doc.id, ...doc.data() };
  } else if (jobs.length > 0) {
    selectedJob = jobs[0];
  }

  const STATUS_COLOR: Record<string, string> = {
    DONE: "oklch(0.68 0.22 155)",
    READY: "oklch(0.68 0.22 155)",
    FAILED: "oklch(0.66 0.2 22)",
    QUEUED: "var(--tx-3)",
  };

  return (
    <div style={{ display: "flex", gap: 20, height: "100%" }}>
      {/* Left: job list */}
      <div style={{
        width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0,
        background: "var(--panel-solid)", borderRadius: 12,
        border: "1px solid var(--line)", overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid var(--line)",
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
          color: "oklch(0.78 0.15 75)", letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          Jobs Simulation ({jobs.length})
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {jobs.length === 0 && (
            <div style={{ padding: 20, color: "var(--tx-3)", fontSize: 13, textAlign: "center" }}>
              Aucun job admin test trouvé.{" "}
              <a href="/admin/test-create" style={{ color: "oklch(0.78 0.15 75)" }}>
                Créer un test →
              </a>
            </div>
          )}
          {jobs.map(job => {
            const isSelected = (job.id as string) === (selectedJob?.id as string);
            const status = job.status as string;
            const color = STATUS_COLOR[status] ?? "var(--tx-3)";
            return (
              <Link
                key={job.id as string}
                href={`/admin/simulation?job=${job.id}`}
                style={{
                  display: "block", padding: "10px 14px",
                  borderBottom: "1px solid var(--line)", textDecoration: "none",
                  background: isSelected ? "oklch(0.78 0.15 75 / 0.1)" : "transparent",
                  borderLeft: isSelected ? "3px solid oklch(0.78 0.15 75)" : "3px solid transparent",
                  transition: "all .1s",
                }}
              >
                <div style={{ fontSize: 12.5, color: "var(--tx-0)", fontWeight: 600, marginBottom: 3 }}>
                  {((job.userPrompt as string) ?? "—").slice(0, 38)}{(job.userPrompt as string)?.length > 38 ? "…" : ""}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color }}>
                    {status}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)" }}>
                    {job.durationSeconds as number}s
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: debug panel */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(0.78 0.15 75)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>
            Claude Simulation Engine
          </div>
          <h1 style={{ fontSize: 26, color: "var(--tx-0)", margin: 0 }}>Debug — RuleBasedContentProvider</h1>
          <p style={{ fontSize: 13, color: "var(--tx-3)", marginTop: 6 }}>
            Visualise les décisions prises par le moteur de règles pour chaque job de simulation.
          </p>
        </div>

        {selectedJob
          ? <SimulationPanel job={selectedJob} />
          : (
            <div style={{
              padding: "48px 24px", background: "var(--panel-solid)",
              borderRadius: 12, border: "1px solid var(--line)",
              color: "var(--tx-3)", textAlign: "center",
            }}>
              Sélectionne un job dans la liste pour voir le debug.
            </div>
          )
        }
      </div>
    </div>
  );
}
