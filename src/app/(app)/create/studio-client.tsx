"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TEMPLATES } from "@/data/templates";
import QualitySelector from "@/components/quality-selector";
import CostEstimator from "@/components/cost-estimator";
import { Sparkles, Music, Image as ImageIcon, Film, Loader2 } from "lucide-react";

const CAPTION_STYLES = [
  { id: "wordbyword",  label: "Mot par mot" },
  { id: "karaoke",    label: "Karaoké" },
  { id: "bold_center",label: "Bold Center" },
  { id: "boxed",      label: "Boxed" },
  { id: "minimal",    label: "Minimal" },
];

const DURATIONS = [20, 30, 60];

const PLATFORMS = [
  { id: "tiktok",    label: "TikTok",   color: "var(--tk)" },
  { id: "youtube",   label: "YouTube",  color: "var(--yt)" },
  { id: "instagram", label: "Reels",    color: "var(--ig)" },
];

const SUGGESTIONS = [
  "Faits sur l'océan profond",
  "Mystères de l'Égypte ancienne",
  "Records du monde animal",
  "Histoire secrète de l'IA",
];

interface StudioClientProps {
  creditsBalance: number;
  isAdminTestMode: boolean;
  allowedQualities: string[];
}

export default function StudioClient({ creditsBalance, isAdminTestMode, allowedQualities }: StudioClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [template, setTemplate]       = useState("top5-facts");
  const [prompt, setPrompt]           = useState("");
  const [quality, setQuality]         = useState<"standard" | "premium" | "cinema">("standard");
  const [duration, setDuration]       = useState(30);
  const [captionStyle, setCaptionStyle] = useState("bold_center");
  const [platforms, setPlatforms]     = useState<string[]>(["tiktok", "youtube"]);
  const [useSuno, setUseSuno]         = useState(false);
  const [useThumb, setUseThumb]       = useState(true);
  const [estimatedCredits, setEstimatedCredits] = useState(0);

  const tpl = TEMPLATES.find(t => t.id === template)!;

  function togglePlatform(id: string) {
    setPlatforms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) { toast.error("Décris ton sujet"); return; }

    startTransition(async () => {
      try {
        const res = await fetch("/api/jobs/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPrompt: prompt,
            templateId: template,
            videoQuality: quality,
            durationSeconds: duration,
            captionStyle,
            platforms,
            useSunoMusic: useSuno,
            useThumbnailAI: useThumb,
            creationMode: "FULL_AUTO",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur");
        toast.success("Job créé ! Génération en cours…");
        router.push(`/jobs/${data.jobId}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
      }
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          {isAdminTestMode ? "⚗️ MODE TEST — crédits illimités" : "Studio"}
        </div>
        <h1 style={{ fontSize: 26 }}>Créer un short</h1>
      </div>

      <form id="studio-form" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, alignItems: "start" }}>
          {/* ── Colonne gauche ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Templates */}
            <div className="sf-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>1 · Choisis un format viral</div>
              <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginBottom: 16 }}>Un canevas narratif optimisé pour la rétention.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {TEMPLATES.map(t => {
                  const sel = template === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id)}
                      style={{
                        textAlign: "left", padding: 14, borderRadius: 12, transition: "all .14s",
                        background: sel ? "var(--accent-soft)" : "var(--bg-1)",
                        border: `1.5px solid ${sel ? "var(--accent-line)" : "var(--line)"}`,
                      }}
                    >
                      <div style={{ color: sel ? "var(--accent-bright)" : "var(--tx-2)", marginBottom: 9, fontSize: 20 }}>
                        {t.icon === "list-ordered" ? "📋" : t.icon === "arrows-left-right" ? "↔️" : t.icon === "clapperboard" ? "🎬" : t.icon === "lightbulb" ? "💡" : t.icon === "arrow-left-right" ? "🔄" : "✏️"}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", marginBottom: 3 }}>{t.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt */}
            <div className="sf-card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>2 · Décris ton sujet</div>
                  <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 4 }}>Une phrase suffit. L&apos;IA s&apos;occupe du reste.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrompt(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)])}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9,
                    fontSize: 12.5, fontWeight: 600, background: "var(--bg-2)", color: "var(--tx-1)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <Sparkles size={13} style={{ color: "var(--accent-bright)" }} />Suggérer
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                placeholder={`Ex : « ${tpl.name === "Prompt libre" ? "Un astronaute découvre une cité sous la glace de Mars" : "Les faits les plus fous sur les fonds marins"} »`}
                style={{
                  width: "100%", resize: "none",
                  background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12,
                  padding: 14, color: "var(--tx-0)", fontSize: 14.5, lineHeight: 1.5,
                  outline: "none", fontFamily: "var(--font-body)",
                }}
              />
              <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPrompt(s)}
                    style={{
                      fontSize: 12, padding: "6px 11px", borderRadius: 8,
                      background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--tx-2)",
                    }}
                  >
                    📈 {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="sf-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>3 · Niveau de qualité</div>
              <QualitySelector value={quality} onChange={setQuality} allowedQualities={allowedQualities} />
            </div>

            {/* Options */}
            <div className="sf-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>4 · Réglages</div>

              {/* Duration */}
              <div>
                <div style={{ fontSize: 12.5, color: "var(--tx-2)", marginBottom: 9, fontWeight: 600 }}>Durée</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      style={{
                        padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                        background: duration === d ? "var(--bg-3)" : "var(--bg-1)",
                        color: duration === d ? "var(--tx-0)" : "var(--tx-2)",
                        border: `1px solid ${duration === d ? "var(--line-strong)" : "var(--line)"}`,
                        transition: "all .14s",
                      }}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption style */}
              <div>
                <div style={{ fontSize: 12.5, color: "var(--tx-2)", marginBottom: 9, fontWeight: 600 }}>Style de sous-titres</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CAPTION_STYLES.map(cs => (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => setCaptionStyle(cs.id)}
                      style={{
                        padding: "8px 13px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                        background: captionStyle === cs.id ? "var(--bg-3)" : "var(--bg-1)",
                        color: captionStyle === cs.id ? "var(--tx-0)" : "var(--tx-2)",
                        border: `1px solid ${captionStyle === cs.id ? "var(--line-strong)" : "var(--line)"}`,
                        transition: "all .14s",
                      }}
                    >
                      {cs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <div style={{ fontSize: 12.5, color: "var(--tx-2)", marginBottom: 9, fontWeight: 600 }}>Publier sur</div>
                <div style={{ display: "flex", gap: 9 }}>
                  {PLATFORMS.map(({ id, label, color }) => {
                    const on = platforms.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => togglePlatform(id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "8px 13px", borderRadius: 10,
                          background: on ? "var(--bg-3)" : "var(--bg-1)",
                          border: `1px solid ${on ? "var(--line-strong)" : "var(--line)"}`,
                          color: on ? "var(--tx-0)" : "var(--tx-3)", fontSize: 13, fontWeight: 600, transition: "all .14s",
                        }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: 8, background: color, opacity: 0.8 }} />
                        {label}
                        {on && <span style={{ color: "var(--accent-bright)", fontSize: 12 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "Musique IA (Suno)", sub: "+5 cr · piste originale", icon: <Music size={16} />, on: useSuno, toggle: () => setUseSuno(v => !v) },
                  { label: "Miniature IA",      sub: "Thumbnail générée",       icon: <ImageIcon size={16} />, on: useThumb, toggle: () => setUseThumb(v => !v) },
                ].map(({ label, sub, icon, on, toggle }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={toggle}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", gap: 11, padding: 13, borderRadius: 11,
                      background: on ? "var(--accent-soft)" : "var(--bg-1)",
                      border: `1px solid ${on ? "var(--accent-line)" : "var(--line)"}`,
                      textAlign: "left", transition: "all .14s",
                    }}
                  >
                    <div style={{ color: on ? "var(--accent-bright)" : "var(--tx-3)" }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-0)" }}>{label}</div>
                      <div style={{ fontSize: 10.5, color: "var(--tx-3)" }}>{sub}</div>
                    </div>
                    <div style={{ width: 34, height: 20, borderRadius: 99, background: on ? "var(--accent)" : "var(--bg-3)", position: "relative", transition: "all .16s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 99, background: "#fff", transition: "all .16s" }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Colonne droite (sticky) ── */}
          <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {isPending ? (
              <div className="sf-card" style={{ padding: 40, display: "grid", placeItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <Loader2 size={32} style={{ animation: "spin 0.9s linear infinite", color: "var(--accent-bright)" }} />
                  <p style={{ color: "var(--tx-2)", fontSize: 14 }}>Création du job…</p>
                </div>
              </div>
            ) : (
              <CostEstimator
                quality={quality}
                durationSeconds={duration}
                useSunoMusic={useSuno}
                creditsBalance={isAdminTestMode ? 999999 : creditsBalance}
                onEstimate={setEstimatedCredits}
                disabled={isPending}
                promptFilled={prompt.trim().length > 0}
              />
            )}

            {/* Preview placeholder */}
            <div className="sf-card" style={{ padding: 16 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Aperçu format</div>
              <div style={{
                aspectRatio: "9/16",
                borderRadius: 12,
                background: "linear-gradient(150deg, var(--accent-deep), var(--bg-3))",
                border: "1px solid var(--line-strong)",
                display: "grid", placeItems: "center",
              }}>
                <Film size={28} style={{ color: "var(--tx-3)" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)", textAlign: "center", marginTop: 8 }}>
                {duration}s · {quality}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
