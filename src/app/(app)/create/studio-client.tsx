"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TEMPLATES } from "@/data/templates";
import {
  VISUAL_STYLES, LIGHTING_TONES, CAMERA_MOVEMENTS,
  RATIOS_BY_PROVIDER, RATIO_LABELS, MUSIC_MOODS,
  SFX_INTENSITIES, CAPTION_STYLES, CAPTION_FONT_FAMILIES,
  CAPTION_FONT_SIZES, CAPTION_POSITIONS, CAPTION_HIGHLIGHT_COLORS,
  TRANSITIONS, FPS_OPTIONS, TREND_NICHES, QUALITY_TO_PROVIDER,
} from "@/data/creation-config";
import type { AspectRatio, VisualStyle, LightingTone, CameraMovement, CaptionStyle, CaptionFontSize, CaptionPosition, SFXIntensity, TransitionStyle } from "@/types/job";
import {
  ChevronRight, ChevronLeft, TrendingUp, Upload, X,
  Play, Pause, Loader2, CheckCircle, Music, Mic,
  Sparkles, Info, Search, RefreshCw, ChevronDown, SkipForward,
} from "lucide-react";

type VoiceProvider = "elevenlabs" | "google";

interface FormState {
  // Step 1
  template: string;
  prompt: string;
  niche: string;
  // Step 2
  visualStyle: VisualStyle;
  lightingTone: LightingTone;
  cameraMovement: CameraMovement;
  // Step 3
  referenceImageUrl: string | null;
  // Step 4
  voiceProvider: VoiceProvider;
  voiceId: string;
  voiceLanguage: string;
  musicMood: string;
  sfxIntensity: SFXIntensity;
  audioVoiceBalance: number;
  audioMusicBalance: number;
  // Step 5
  videoQuality: "standard" | "premium" | "cinema";
  durationSeconds: number;
  aspectRatio: AspectRatio;
  fps: 24 | 30 | 60;
  captionStyle: CaptionStyle;
  captionFontFamily: string;
  captionFontSize: CaptionFontSize;
  captionPosition: CaptionPosition;
  captionHighlightColor: string;
  captionAutoEmoji: boolean;
  transitionStyle: TransitionStyle;
  platforms: string[];
}

const DEFAULT_FORM: FormState = {
  template: "top5-facts",
  prompt: "",
  niche: "science",
  visualStyle: "cinematic",
  lightingTone: "dramatic",
  cameraMovement: "slow_zoom",
  referenceImageUrl: null,
  voiceProvider: "elevenlabs",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  voiceLanguage: "fr-FR",
  musicMood: "epic",
  sfxIntensity: "normal",
  audioVoiceBalance: 80,
  audioMusicBalance: 20,
  videoQuality: "standard",
  durationSeconds: 30,
  aspectRatio: "9:16",
  fps: 30,
  captionStyle: "bold_center",
  captionFontFamily: "Arial Black",
  captionFontSize: "medium",
  captionPosition: "bottom",
  captionHighlightColor: "yellow",
  captionAutoEmoji: false,
  transitionStyle: "cut",
  platforms: ["tiktok", "youtube"],
};

const STEP_LABELS = [
  "Sujet",
  "Visuel",
  "Référence",
  "Audio",
  "Production",
  "Récapitulatif",
];

interface StudioClientProps {
  creditsBalance: number;
  isAdminTestMode: boolean;
  allowedQualities: string[];
}

export default function StudioClient({ creditsBalance, isAdminTestMode, allowedQualities }: StudioClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isPending, startTransition] = useTransition();
  const [estimatedCredits, setEstimatedCredits] = useState(0);

  // Sync form update helper
  function upd<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function canGoNext(): boolean {
    if (step === 1) return form.prompt.trim().length >= 3;
    return true;
  }

  async function handleSubmit() {
    startTransition(async () => {
      try {
        const endpoint = isAdminTestMode ? "/api/admin/test-job" : "/api/jobs/create";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPrompt: form.prompt,
            templateId: form.template,
            videoQuality: form.videoQuality,
            durationSeconds: form.durationSeconds,
            aspectRatio: form.aspectRatio,
            fps: form.fps,
            visualStyle: form.visualStyle,
            lightingTone: form.lightingTone,
            cameraMovement: form.cameraMovement,
            customReferenceImageUrl: form.referenceImageUrl,
            voiceProvider: form.voiceProvider,
            voiceId: form.voiceId,
            voiceLanguage: form.voiceLanguage,
            musicMood: form.musicMood,
            sfxIntensity: form.sfxIntensity,
            audioVoiceBalance: form.audioVoiceBalance,
            audioMusicBalance: form.audioMusicBalance,
            captionStyle: form.captionStyle,
            captionFontFamily: form.captionFontFamily,
            captionFontSize: form.captionFontSize,
            captionPosition: form.captionPosition,
            captionHighlightColor: form.captionHighlightColor,
            captionAutoEmoji: form.captionAutoEmoji,
            transitionStyle: form.transitionStyle,
            platforms: form.platforms,
            niche: form.niche,
            creationMode: "FULL_AUTO",
          }),
        });

        // Parse response before checking status — server may return 5xx with no body
        let data: { jobId?: string; error?: string } = {};
        try { data = await res.json(); } catch { /* empty body */ }

        if (!res.ok) throw new Error(data.error ?? `Erreur serveur (${res.status})`);
        toast.success("Job créé ! Génération en cours…");
        router.push(`/jobs/${data.jobId}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur inconnue");
      }
    });
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isAdminTestMode ? "oklch(0.78 0.15 75)" : "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          {isAdminTestMode ? "⚗️ MODE TEST — Crédits illimités" : "Studio"}
        </div>
        <h1 style={{ fontSize: 26 }}>Créer un short</h1>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 32, overflowX: "auto" }}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const isActive = n === step;
          const isDone = n < step;
          return (
            <button
              key={n}
              onClick={() => n < step && setStep(n)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                borderRadius: 10, flexShrink: 0, cursor: n < step ? "pointer" : "default",
                background: isActive ? "var(--accent-soft)" : isDone ? "oklch(0.74 0.16 155 / 0.1)" : "var(--bg-1)",
                border: `1px solid ${isActive ? "var(--accent-line)" : isDone ? "oklch(0.74 0.16 155 / 0.3)" : "var(--line)"}`,
                transition: "all .15s",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
                background: isActive ? "var(--accent)" : isDone ? "oklch(0.74 0.16 155)" : "var(--bg-3)",
                color: isActive || isDone ? "#fff" : "var(--tx-3)",
              }}>
                {isDone ? "✓" : n}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: isActive ? "var(--tx-0)" : isDone ? "var(--ok)" : "var(--tx-3)", whiteSpace: "nowrap" }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div style={{ display: "grid", gridTemplateColumns: step === 6 ? "1fr" : "1fr 300px", gap: 22, alignItems: "start" }}>
        <div>
          {step === 1 && (
            <Step1Subject form={form} upd={upd} />
          )}
          {step === 2 && (
            <Step2Visual form={form} upd={upd} />
          )}
          {step === 3 && (
            <Step3Reference form={form} upd={upd} />
          )}
          {step === 4 && (
            <Step4Audio form={form} upd={upd} />
          )}
          {step === 5 && (
            <Step5Production form={form} upd={upd} allowedQualities={allowedQualities} />
          )}
          {step === 6 && (
            <Step6Summary
              form={form}
              creditsBalance={isAdminTestMode ? 999999 : creditsBalance}
              estimatedCredits={estimatedCredits}
              onEstimate={setEstimatedCredits}
              isAdminTestMode={isAdminTestMode}
              isPending={isPending}
              onLaunch={handleSubmit}
              onEdit={setStep}
              onUpdate={upd}
            />
          )}
        </div>

        {/* Sticky sidebar (steps 1-5 only) */}
        {step < 6 && (
          <div style={{ position: "sticky", top: 0 }}>
            <CostPreview
              form={form}
              creditsBalance={isAdminTestMode ? 999999 : creditsBalance}
              onEstimate={setEstimatedCredits}
              isAdminTestMode={isAdminTestMode}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 6 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px",
              borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              background: "transparent", color: "var(--tx-2)",
              border: "1px solid var(--line)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={16} />{step === 1 ? "Annuler" : "Précédent"}
          </button>

          <button
            type="button"
            onClick={() => canGoNext() && setStep(s => Math.min(6, s + 1))}
            disabled={!canGoNext()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px",
              borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              background: canGoNext() ? "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))" : "var(--bg-3)",
              color: canGoNext() ? "#fff" : "var(--tx-3)",
              border: "none", cursor: canGoNext() ? "pointer" : "not-allowed",
              boxShadow: canGoNext() ? "0 6px 20px oklch(0.66 0.21 var(--accent-h) / 0.4)" : "none",
              transition: "all .16s",
            }}
          >
            {step === 5 ? "Voir le récapitulatif" : "Continuer"} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 1 — Subject & Trends
// ═══════════════════════════════════════════════════════════════════
function Step1Subject({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const [trends, setTrends] = useState<string[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFetchedNiche = useRef<string>("");

  async function loadTrends(force = false) {
    setLoadingTrends(true);
    try {
      const res = await fetch(`/api/trending?niche=${form.niche}&country=FR${force ? "&force=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        setTrends(data.topics ?? []);
      }
    } finally {
      setLoadingTrends(false);
    }
  }

  // Auto-fetch when niche changes
  useEffect(() => {
    if (hasFetchedNiche.current === form.niche) return;
    hasFetchedNiche.current = form.niche;
    loadTrends(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.niche]);

  // Real-time suggestions while typing
  useEffect(() => {
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    const q = form.prompt.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/trending?niche=${form.niche}&country=FR`);
        if (res.ok) {
          const data = await res.json();
          const all: string[] = data.topics ?? [];
          const filtered = all.filter(t => t.toLowerCase().includes(q.toLowerCase()));
          setSuggestions(filtered.slice(0, 4));
        }
      } catch { /* ignore */ }
    }, 300);
    return () => { if (suggestDebounce.current) clearTimeout(suggestDebounce.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.prompt, form.niche]);

  const tpl = TEMPLATES.find(t => t.id === form.template) ?? TEMPLATES[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Templates */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>1 · Choisis un format viral</div>
        <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginBottom: 16 }}>Un canevas narratif optimisé pour la rétention.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {TEMPLATES.map(t => {
            const sel = form.template === t.id;
            const icons: Record<string, string> = {
              "top5-facts": "📋", "myth-reality": "↔️", "story-drama": "🎬",
              "explain-60s": "💡", "before-after": "🔄", "free": "✏️",
            };
            return (
              <button key={t.id} type="button" onClick={() => upd("template", t.id)} style={{
                textAlign: "left", padding: 14, borderRadius: 12, transition: "all .14s",
                background: sel ? "var(--accent-soft)" : "var(--bg-1)",
                border: `1.5px solid ${sel ? "var(--accent-line)" : "var(--line)"}`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 9 }}>{icons[t.id] ?? "🎬"}</div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", marginBottom: 3 }}>{t.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>2 · Décris ton sujet</div>
        <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginBottom: 14 }}>Une phrase suffit. L&apos;IA s&apos;occupe du reste.</div>

        <div style={{ position: "relative" }}>
          <textarea
            value={form.prompt}
            onChange={e => { upd("prompt", e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            rows={3}
            placeholder={`Ex : « ${tpl.name === "Prompt libre" ? "Un astronaute découvre une cité sous la glace de Mars" : "Les faits les plus fous sur les fonds marins"} »`}
            style={{
              width: "100%", resize: "none",
              background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12,
              padding: 14, color: "var(--tx-0)", fontSize: 14.5, lineHeight: 1.5,
              outline: "none", fontFamily: "var(--font-body)",
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
              background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10,
              marginTop: 4, overflow: "hidden",
              boxShadow: "0 8px 24px oklch(0 0 0 / 0.25)",
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => { upd("prompt", s); setSuggestions([]); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    padding: "10px 14px", fontSize: 13, color: "var(--tx-1)",
                    background: "transparent", border: "none", cursor: "pointer",
                    textAlign: "left", borderBottom: i < suggestions.length - 1 ? "1px solid var(--line)" : "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Search size={12} style={{ color: "var(--tx-3)", flexShrink: 0 }} />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Niche + Trends */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--tx-3)", fontWeight: 600 }}>Niche :</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TREND_NICHES.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => upd("niche", n.id)}
                style={{
                  padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: form.niche === n.id ? "var(--bg-3)" : "var(--bg-2)",
                  border: `1px solid ${form.niche === n.id ? "var(--line-strong)" : "var(--line)"}`,
                  color: form.niche === n.id ? "var(--tx-0)" : "var(--tx-2)",
                }}
              >
                {n.emoji} {n.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => loadTrends(trends.length > 0)}
            disabled={loadingTrends}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
              borderRadius: 9, fontSize: 12, fontWeight: 600,
              background: "var(--accent-soft)", color: "var(--accent-bright)",
              border: "1px solid var(--accent-line)", cursor: "pointer",
            }}
          >
            {loadingTrends
              ? <Loader2 size={12} style={{ animation: "spin 0.9s linear infinite" }} />
              : trends.length > 0 ? <RefreshCw size={12} /> : <TrendingUp size={12} />}
            {trends.length > 0 ? "Nouvelles tendances" : "Tendances du moment →"}
          </button>
        </div>

        {/* Trend chips */}
        {trends.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 7, flexWrap: "wrap" }}>
            {trends.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => upd("prompt", t)}
                style={{
                  fontSize: 12, padding: "6px 11px", borderRadius: 8,
                  background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--tx-2)",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                🔥 {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2 — Visual validation
// ═══════════════════════════════════════════════════════════════════
function Step2Visual({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const [previews, setPreviews] = useState<{ url: string; thumbnail: string; type: string }[]>([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPreviews = useCallback(async () => {
    if (!form.prompt.trim()) return;
    setLoadingPreviews(true);
    try {
      const res = await fetch(`/api/visual-preview?subject=${encodeURIComponent(form.prompt)}&style=${form.visualStyle}`);
      if (res.ok) {
        const data = await res.json();
        setPreviews(data.results ?? []);
      }
    } finally {
      setLoadingPreviews(false);
    }
  }, [form.prompt, form.visualStyle]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(loadPreviews, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [loadPreviews]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Visual style */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>Style visuel</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {VISUAL_STYLES.map(s => (
            <button key={s.id} type="button" onClick={() => upd("visualStyle", s.id)} style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
              background: form.visualStyle === s.id ? "var(--accent-soft)" : "var(--bg-1)",
              border: `1px solid ${form.visualStyle === s.id ? "var(--accent-line)" : "var(--line)"}`,
              color: form.visualStyle === s.id ? "var(--accent-bright)" : "var(--tx-2)",
              cursor: "pointer",
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lighting + Camera */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="sf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--tx-0)", marginBottom: 12 }}>Ton lumineux</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {LIGHTING_TONES.map(l => (
              <button key={l.id} type="button" onClick={() => upd("lightingTone", l.id)} style={{
                padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: form.lightingTone === l.id ? "var(--bg-3)" : "var(--bg-1)",
                border: `1px solid ${form.lightingTone === l.id ? "var(--line-strong)" : "var(--line)"}`,
                color: form.lightingTone === l.id ? "var(--tx-0)" : "var(--tx-2)",
                cursor: "pointer",
              }}>
                {l.emoji} {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--tx-0)", marginBottom: 12 }}>Mouvement caméra</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CAMERA_MOVEMENTS.map(c => (
              <button key={c.id} type="button" onClick={() => upd("cameraMovement", c.id)} style={{
                padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: form.cameraMovement === c.id ? "var(--bg-3)" : "var(--bg-1)",
                border: `1px solid ${form.cameraMovement === c.id ? "var(--line-strong)" : "var(--line)"}`,
                color: form.cameraMovement === c.id ? "var(--tx-0)" : "var(--tx-2)",
                cursor: "pointer",
              }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual previews */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>Aperçu visuel (Pexels)</div>
          {loadingPreviews && <Loader2 size={14} style={{ animation: "spin 0.9s linear infinite", color: "var(--tx-3)" }} />}
        </div>

        {previews.length === 0 && !loadingPreviews && (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--tx-3)", fontSize: 13 }}>
            {form.prompt.trim() ? "Chargement des aperçus…" : "Entre un sujet à l'étape 1 pour voir les aperçus"}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {previews.map((p, i) => (
            <div key={i} style={{
              aspectRatio: "9/16", borderRadius: 10, overflow: "hidden",
              border: "1px solid var(--line-strong)", background: "var(--bg-2)",
              position: "relative",
            }}>
              {p.thumbnail && (
                <img
                  src={p.thumbnail}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              {p.type === "video" && (
                <div style={{
                  position: "absolute", top: 5, right: 5, fontSize: 9.5,
                  fontFamily: "var(--font-mono)", padding: "2px 5px", borderRadius: 4,
                  background: "oklch(0 0 0 / 0.5)", color: "#fff",
                }}>
                  ▶ clip
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3 — Reference photo (optional)
// ═══════════════════════════════════════════════════════════════════
function Step3Reference({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/jobs/upload-reference", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erreur upload");
        return;
      }
      const { url } = await res.json();
      upd("referenceImageUrl", url);
      toast.success("Photo uploadée !");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sf-card" style={{ padding: 28 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 6 }}>Photo de référence (optionnel)</div>
      <div style={{ fontSize: 13, color: "var(--tx-2)", lineHeight: 1.6, marginBottom: 20 }}>
        Uploade une photo de ton sujet ou personnage. L&apos;IA l&apos;utilisera comme référence visuelle pour toutes les scènes.
      </div>

      {/* Impact explanation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
        <div style={{ padding: 14, borderRadius: 10, background: form.referenceImageUrl ? "oklch(0.74 0.16 155 / 0.1)" : "var(--bg-1)", border: `1px solid ${form.referenceImageUrl ? "oklch(0.74 0.16 155 / 0.3)" : "var(--line)"}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: form.referenceImageUrl ? "var(--ok)" : "var(--tx-2)", marginBottom: 6 }}>
            {form.referenceImageUrl ? "✓ Avec ta photo" : "Avec photo"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--tx-3)", lineHeight: 1.5 }}>
            Kling utilise ton image comme référence • DALL-E <strong>désactivé</strong> (économie de 21 crédits)
          </div>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-1)", border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tx-2)", marginBottom: 6 }}>Sans photo</div>
          <div style={{ fontSize: 11.5, color: "var(--tx-3)", lineHeight: 1.5 }}>
            Standard/Premium: text-to-video • Cinema: DALL-E génère les images de référence (+21 cr)
          </div>
        </div>
      </div>

      {/* Upload zone */}
      {form.referenceImageUrl ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={form.referenceImageUrl}
            alt="Reference"
            style={{ width: 180, height: 240, objectFit: "cover", borderRadius: 12, border: "2px solid var(--accent-line)" }}
          />
          <button
            onClick={() => upd("referenceImageUrl", null)}
            style={{
              position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: 99,
              background: "var(--bad)", color: "#fff", display: "grid", placeItems: "center",
              border: "none", cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed var(--line)", borderRadius: 14, padding: 36, textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer", transition: "border-color .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-line)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}
        >
          {uploading ? (
            <Loader2 size={28} style={{ animation: "spin 0.9s linear infinite", color: "var(--accent-bright)", margin: "0 auto 10px" }} />
          ) : (
            <Upload size={28} style={{ color: "var(--tx-3)", margin: "0 auto 10px", display: "block" }} />
          )}
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--tx-0)", marginBottom: 4 }}>
            {uploading ? "Upload en cours…" : "Clique pour uploader"}
          </div>
          <div style={{ fontSize: 12, color: "var(--tx-3)" }}>JPEG, PNG ou WebP · 10 Mo max</div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "flex-start", padding: 12, borderRadius: 10, background: "var(--bg-1)", border: "1px solid var(--line)" }}>
        <Info size={14} style={{ color: "var(--accent-bright)", flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: "var(--tx-3)" }}>
          Cette étape est <strong style={{ color: "var(--tx-2)" }}>optionnelle</strong>. Passe à l&apos;étape suivante si tu ne veux pas de photo de référence.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 4 — Audio
// ═══════════════════════════════════════════════════════════════════
function Step4Audio({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const [voices, setVoices] = useState<{ voiceId: string; name: string; language: string; gender: string; accent: string | null; description: string | null; useCase: string | null; previewUrl: string | null }[]>([]);
  const [voiceSearch, setVoiceSearch] = useState("");
  const [voiceLang, setVoiceLang] = useState("");
  const [voiceGender, setVoiceGender] = useState("");
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playingMusicMood, setPlayingMusicMood] = useState<string | null>(null);
  const [musicTrackIndex, setMusicTrackIndex] = useState<Record<string, number>>({});
  const [musicTotals, setMusicTotals] = useState<Record<string, number>>({});
  const [musicSearch, setMusicSearch] = useState("");
  const [loadingMusic, setLoadingMusic] = useState<string | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices with debounced search
  useEffect(() => {
    if (voiceDebounce.current) clearTimeout(voiceDebounce.current);
    voiceDebounce.current = setTimeout(async () => {
      setLoadingVoices(true);
      try {
        const params = new URLSearchParams({ provider: form.voiceProvider });
        if (voiceLang) params.set("language", voiceLang);
        if (voiceGender) params.set("gender", voiceGender);
        if (voiceSearch) params.set("search", voiceSearch);
        const res = await fetch(`/api/voices?${params}`);
        const d = await res.json();
        setVoices(d.voices ?? []);
      } finally {
        setLoadingVoices(false);
      }
    }, voiceSearch ? 300 : 0);
    return () => { if (voiceDebounce.current) clearTimeout(voiceDebounce.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.voiceProvider, voiceLang, voiceGender, voiceSearch]);

  // Languages available for Google TTS
  const GOOGLE_LANGS = [
    { code: "fr-FR", label: "🇫🇷 Français" },
    { code: "en-US", label: "🇺🇸 English" },
    { code: "es-ES", label: "🇪🇸 Español" },
    { code: "de-DE", label: "🇩🇪 Deutsch" },
  ];

  function playVoicePreview(voiceId: string) {
    if (playingPreview === voiceId) {
      audioRef.current?.pause();
      setPlayingPreview(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(`/api/voices/preview?voiceId=${voiceId}&text=Bonjour, voici un aperçu de ma voix pour ta vidéo.`);
    audioRef.current = audio;
    audio.play();
    setPlayingPreview(voiceId);
    audio.onended = () => setPlayingPreview(null);
  }

  async function playMusicPreview(mood: string, index?: number) {
    if (playingMusicMood === mood && index === undefined) {
      musicAudioRef.current?.pause();
      setPlayingMusicMood(null);
      return;
    }
    if (musicAudioRef.current) { musicAudioRef.current.pause(); musicAudioRef.current = null; }
    setLoadingMusic(mood);
    const idx = index ?? (musicTrackIndex[mood] ?? 0);
    try {
      // Fetch metadata (total track count, title) — separate from stream
      const params = new URLSearchParams({ mood, index: String(idx) });
      if (musicSearch) params.set("search", musicSearch);
      const res = await fetch(`/api/music/preview?${params}`);
      if (res.ok) {
        const d = await res.json();
        setMusicTotals(prev => ({ ...prev, [mood]: d.total ?? 1 }));
      }

      // Stream audio through our proxy to avoid CORS issues
      const streamParams = new URLSearchParams({ mood, index: String(idx) });
      if (musicSearch) streamParams.set("search", musicSearch);
      const audio = new Audio(`/api/music/stream?${streamParams}`);
      musicAudioRef.current = audio;
      audio.onended = () => setPlayingMusicMood(null);
      audio.onerror = () => { setPlayingMusicMood(null); setLoadingMusic(null); };
      await audio.play();
      setPlayingMusicMood(mood);
    } catch {
      setPlayingMusicMood(null);
    } finally {
      setLoadingMusic(null);
    }
  }

  function nextMusicTrack(mood: string) {
    const total = musicTotals[mood] ?? 1;
    const cur = musicTrackIndex[mood] ?? 0;
    const next = (cur + 1) % total;
    setMusicTrackIndex(prev => ({ ...prev, [mood]: next }));
    playMusicPreview(mood, next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Voice off */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>
          <Mic size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--accent-bright)" }} />
          Voix off
        </div>

        {/* Provider selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            { id: "elevenlabs" as VoiceProvider, label: "ElevenLabs", desc: "Premium · 3000+ voix" },
            { id: "google" as VoiceProvider, label: "Google TTS", desc: "Gratuit · 1M chars/mois" },
          ].map(p => (
            <button key={p.id} type="button" onClick={() => { upd("voiceProvider", p.id); setVoiceSearch(""); setVoiceLang(""); setVoiceGender(""); }} style={{
              flex: 1, padding: "12px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
              background: form.voiceProvider === p.id ? "var(--accent-soft)" : "var(--bg-1)",
              border: `1.5px solid ${form.voiceProvider === p.id ? "var(--accent-line)" : "var(--line)"}`,
            }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", marginBottom: 3 }}>{p.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--tx-3)" }}>{p.desc}</div>
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 140, position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--tx-3)", pointerEvents: "none" }} />
            <input
              value={voiceSearch}
              onChange={e => setVoiceSearch(e.target.value)}
              placeholder="Rechercher une voix…"
              style={{
                width: "100%", padding: "8px 10px 8px 30px", borderRadius: 9, fontSize: 12.5,
                background: "var(--bg-1)", border: "1px solid var(--line)", color: "var(--tx-0)", outline: "none",
              }}
            />
          </div>
          {/* Language filter */}
          {form.voiceProvider === "google" ? (
            <select
              value={voiceLang}
              onChange={e => setVoiceLang(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 9, fontSize: 12.5, background: "var(--bg-1)", border: "1px solid var(--line)", color: "var(--tx-0)", cursor: "pointer" }}
            >
              <option value="">Toutes langues</option>
              {GOOGLE_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          ) : (
            <select
              value={voiceLang}
              onChange={e => setVoiceLang(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 9, fontSize: 12.5, background: "var(--bg-1)", border: "1px solid var(--line)", color: "var(--tx-0)", cursor: "pointer" }}
            >
              <option value="">Toutes langues</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="pt">🇧🇷 Português</option>
              <option value="ar">🇸🇦 Arabic</option>
            </select>
          )}
          {/* Gender filter */}
          <select
            value={voiceGender}
            onChange={e => setVoiceGender(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 9, fontSize: 12.5, background: "var(--bg-1)", border: "1px solid var(--line)", color: "var(--tx-0)", cursor: "pointer" }}
          >
            <option value="">Tous genres</option>
            <option value="male">Masculin</option>
            <option value="female">Féminin</option>
          </select>
        </div>

        {/* Voice count */}
        {voices.length > 0 && (
          <div style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
            {voices.length} voix trouvée{voices.length > 1 ? "s" : ""}
          </div>
        )}

        {/* Voice list */}
        {loadingVoices ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--tx-3)", fontSize: 13 }}>
            <Loader2 size={18} style={{ animation: "spin 0.9s linear infinite", margin: "0 auto 8px", display: "block" }} />
            Chargement des voix…
          </div>
        ) : voices.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
            {voices.map(v => (
              <div
                key={v.voiceId}
                onClick={() => { upd("voiceId", v.voiceId); if (form.voiceProvider === "google") upd("voiceLanguage", v.language); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, cursor: "pointer",
                  background: form.voiceId === v.voiceId ? "var(--accent-soft)" : "var(--bg-1)",
                  border: `1px solid ${form.voiceId === v.voiceId ? "var(--accent-line)" : "var(--line)"}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-0)" }}>{v.name}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10.5, color: "var(--tx-3)", fontFamily: "var(--font-mono)" }}>{v.language}</span>
                    {v.gender && <span style={{ fontSize: 10.5, padding: "1px 5px", borderRadius: 4, background: "var(--bg-3)", color: "var(--tx-3)" }}>{v.gender}</span>}
                    {v.accent && <span style={{ fontSize: 10.5, padding: "1px 5px", borderRadius: 4, background: "var(--bg-3)", color: "var(--tx-3)" }}>{v.accent}</span>}
                    {v.useCase && <span style={{ fontSize: 10.5, padding: "1px 5px", borderRadius: 4, background: "var(--bg-2)", color: "var(--tx-3)" }}>{v.useCase}</span>}
                  </div>
                </div>
                {form.voiceProvider === "elevenlabs" && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); playVoicePreview(v.voiceId); }}
                    style={{
                      width: 30, height: 30, borderRadius: 99, display: "grid", placeItems: "center",
                      background: playingPreview === v.voiceId ? "var(--accent)" : "var(--bg-2)",
                      border: "1px solid var(--line)", cursor: "pointer",
                      color: playingPreview === v.voiceId ? "#fff" : "var(--tx-2)",
                      flexShrink: 0,
                    }}
                  >
                    {playingPreview === v.voiceId ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                )}
                {form.voiceId === v.voiceId && <CheckCircle size={14} style={{ color: "var(--ok)", flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: "center", color: "var(--tx-3)", fontSize: 13 }}>
            Aucune voix trouvée. Essaie d&apos;autres filtres.
          </div>
        )}
      </div>

      {/* Background music */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>
          <Music size={15} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--accent-bright)" }} />
          Musique de fond (Pixabay — gratuit)
        </div>

        {/* Music search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--tx-3)", pointerEvents: "none" }} />
          <input
            value={musicSearch}
            onChange={e => setMusicSearch(e.target.value)}
            placeholder="Rechercher un style (ex: lo-fi, jazz, cinematic…)"
            style={{
              width: "100%", padding: "9px 10px 9px 30px", borderRadius: 9, fontSize: 12.5,
              background: "var(--bg-1)", border: "1px solid var(--line)", color: "var(--tx-0)", outline: "none",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {MUSIC_MOODS.map(m => (
            <div
              key={m.id}
              style={{
                display: "flex", flexDirection: "column", gap: 6, padding: "12px 10px",
                borderRadius: 10, cursor: "pointer",
                background: form.musicMood === m.id ? "var(--accent-soft)" : "var(--bg-1)",
                border: `1px solid ${form.musicMood === m.id ? "var(--accent-line)" : "var(--line)"}`,
              }}
              onClick={() => upd("musicMood", m.id)}
            >
              <div style={{ fontSize: 20, textAlign: "center" }}>{m.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--tx-0)", textAlign: "center" }}>{m.label}</div>
              <div style={{ display: "flex", gap: 3 }}>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); upd("musicMood", m.id); playMusicPreview(m.id); }}
                  style={{
                    flex: 1, padding: "4px 0", borderRadius: 6, fontSize: 10, fontWeight: 600,
                    background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--tx-3)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                  }}
                >
                  {loadingMusic === m.id
                    ? <Loader2 size={9} style={{ animation: "spin 0.9s linear infinite" }} />
                    : playingMusicMood === m.id ? <><Pause size={9} />Stop</> : <><Play size={9} />Play</>}
                </button>
                {(musicTotals[m.id] ?? 0) > 1 && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); upd("musicMood", m.id); nextMusicTrack(m.id); }}
                    title={`Piste ${(musicTrackIndex[m.id] ?? 0) + 1}/${musicTotals[m.id]}`}
                    style={{
                      width: 24, padding: "4px 0", borderRadius: 6, fontSize: 10,
                      background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--tx-3)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <SkipForward size={9} />
                  </button>
                )}
              </div>
              {form.musicMood === m.id && (musicTotals[m.id] ?? 0) > 1 && (
                <div style={{ fontSize: 9.5, color: "var(--tx-3)", textAlign: "center", fontFamily: "var(--font-mono)" }}>
                  {(musicTrackIndex[m.id] ?? 0) + 1}/{musicTotals[m.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audio balance */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 16 }}>Balance audio</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Voix off", key: "audioVoiceBalance" as keyof FormState, color: "var(--accent-bright)" },
            { label: "Musique", key: "audioMusicBalance" as keyof FormState, color: "var(--ok)" },
          ].map(({ label, key, color }) => (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12.5 }}>
                <span style={{ color: "var(--tx-2)", fontWeight: 600 }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", color, fontWeight: 700 }}>
                  {form[key] as number}%
                </span>
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={form[key] as number}
                onChange={e => upd(key, parseInt(e.target.value) as FormState[typeof key])}
                style={{ width: "100%", accentColor: color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SFX */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>Effets sonores (Pixabay SFX)</div>
        <div style={{ display: "flex", gap: 8 }}>
          {SFX_INTENSITIES.map(s => (
            <button key={s.id} type="button" onClick={() => upd("sfxIntensity", s.id)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center", cursor: "pointer",
              background: form.sfxIntensity === s.id ? "var(--accent-soft)" : "var(--bg-1)",
              border: `1px solid ${form.sfxIntensity === s.id ? "var(--accent-line)" : "var(--line)"}`,
            }}>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--tx-0)", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 10.5, color: "var(--tx-3)" }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 5 — Production settings
// ═══════════════════════════════════════════════════════════════════
function Step5Production({
  form, upd, allowedQualities,
}: {
  form: FormState;
  upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  allowedQualities: string[];
}) {
  const provider = QUALITY_TO_PROVIDER[form.videoQuality] ?? "hailuo";
  const availableRatios = RATIOS_BY_PROVIDER[provider] ?? ["9:16"];

  // If current ratio not available for new provider, reset to 9:16
  useEffect(() => {
    if (!availableRatios.includes(form.aspectRatio)) {
      upd("aspectRatio", "9:16");
    }
  }, [form.videoQuality]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Quality */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>Qualité vidéo</div>
        <div style={{ display: "flex", gap: 10 }}>
          {(["standard", "premium", "cinema"] as const).map(q => {
            const locked = !allowedQualities.includes(q);
            const sel = form.videoQuality === q;
            const colors = { standard: "var(--tx-2)", premium: "var(--accent-bright)", cinema: "var(--cinema)" };
            const labels = { standard: { name: "Standard", desc: "Rapide · Hailuo", cps: "7 cr/s" }, premium: { name: "Premium", desc: "4K · Kling Standard", cps: "14 cr/s" }, cinema: { name: "Cinema", desc: "4K Pro · Kling Pro", cps: "19 cr/s" } };
            const info = labels[q];
            return (
              <button key={q} type="button" onClick={() => !locked && upd("videoQuality", q)} disabled={locked} style={{
                flex: 1, textAlign: "left", padding: 16, borderRadius: 14, cursor: locked ? "not-allowed" : "pointer",
                background: sel ? "var(--accent-soft)" : "var(--bg-1)",
                border: `1.5px solid ${sel ? "var(--accent-line)" : "var(--line)"}`,
                opacity: locked ? 0.5 : 1,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: colors[q], marginBottom: 6 }}>{info.name}</div>
                <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 8 }}>{info.desc}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>{info.cps}</div>
                {locked && <div style={{ fontSize: 10, color: "var(--tx-3)", marginTop: 6 }}>🔒 Upgrade requis</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ratio + Duration + FPS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {/* Aspect ratio */}
        <div className="sf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--tx-0)", marginBottom: 12 }}>Ratio</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(["9:16", "16:9", "1:1", "4:3", "3:4", "2:3"] as AspectRatio[]).map(r => {
              const available = availableRatios.includes(r);
              return (
                <button key={r} type="button" onClick={() => available && upd("aspectRatio", r)}
                  disabled={!available}
                  style={{
                    padding: "7px 10px", borderRadius: 8, textAlign: "left", cursor: available ? "pointer" : "not-allowed",
                    background: form.aspectRatio === r ? "var(--accent-soft)" : "var(--bg-1)",
                    border: `1px solid ${form.aspectRatio === r ? "var(--accent-line)" : "var(--line)"}`,
                    opacity: available ? 1 : 0.4,
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "var(--tx-0)" }}>{RATIO_LABELS[r].label}</div>
                  <div style={{ fontSize: 10, color: "var(--tx-3)" }}>{RATIO_LABELS[r].usage}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="sf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--tx-0)", marginBottom: 12 }}>Durée</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[15, 30, 60].map(d => (
              <button key={d} type="button" onClick={() => upd("durationSeconds", d)} style={{
                padding: "10px 14px", borderRadius: 9, fontWeight: 700, fontSize: 18, cursor: "pointer",
                background: form.durationSeconds === d ? "var(--accent-soft)" : "var(--bg-1)",
                border: `1px solid ${form.durationSeconds === d ? "var(--accent-line)" : "var(--line)"}`,
                color: form.durationSeconds === d ? "var(--accent-bright)" : "var(--tx-2)",
                textAlign: "center",
              }}>
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* FPS */}
        <div className="sf-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--tx-0)", marginBottom: 12 }}>FPS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FPS_OPTIONS.map(f => (
              <button key={f.value} type="button" onClick={() => upd("fps", f.value as 24 | 30 | 60)} style={{
                padding: "10px 14px", borderRadius: 9, cursor: "pointer", textAlign: "left",
                background: form.fps === f.value ? "var(--accent-soft)" : "var(--bg-1)",
                border: `1px solid ${form.fps === f.value ? "var(--accent-line)" : "var(--line)"}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--tx-0)" }}>{f.label}</div>
                <div style={{ fontSize: 10.5, color: "var(--tx-3)" }}>{f.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Captions */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>Sous-titres</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {CAPTION_STYLES.map(cs => (
            <button key={cs.id} type="button" onClick={() => upd("captionStyle", cs.id)} style={{
              padding: "8px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              background: form.captionStyle === cs.id ? "var(--accent-soft)" : "var(--bg-1)",
              border: `1px solid ${form.captionStyle === cs.id ? "var(--accent-line)" : "var(--line)"}`,
              color: form.captionStyle === cs.id ? "var(--accent-bright)" : "var(--tx-2)",
            }}>
              {cs.label}
            </button>
          ))}
        </div>

        {form.captionStyle !== "none" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {/* Font family */}
            <div>
              <div style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 7, fontWeight: 600 }}>Police</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CAPTION_FONT_FAMILIES.map(f => (
                  <button key={f.id} type="button" onClick={() => upd("captionFontFamily", f.id)} style={{
                    padding: "5px 9px", borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                    background: form.captionFontFamily === f.id ? "var(--bg-3)" : "var(--bg-1)",
                    border: `1px solid ${form.captionFontFamily === f.id ? "var(--line-strong)" : "var(--line)"}`,
                    color: form.captionFontFamily === f.id ? "var(--tx-0)" : "var(--tx-3)",
                    fontFamily: f.id,
                  }}>{f.label}</button>
                ))}
              </div>
            </div>
            {/* Position */}
            <div>
              <div style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 7, fontWeight: 600 }}>Position</div>
              <div style={{ display: "flex", gap: 6 }}>
                {CAPTION_POSITIONS.map(p => (
                  <button key={p.id} type="button" onClick={() => upd("captionPosition", p.id)} style={{
                    flex: 1, padding: "6px 8px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: form.captionPosition === p.id ? "var(--bg-3)" : "var(--bg-1)",
                    border: `1px solid ${form.captionPosition === p.id ? "var(--line-strong)" : "var(--line)"}`,
                    color: form.captionPosition === p.id ? "var(--tx-0)" : "var(--tx-3)",
                  }}>{p.label}</button>
                ))}
              </div>
            </div>
            {/* Font size */}
            <div>
              <div style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 7, fontWeight: 600 }}>Taille</div>
              <div style={{ display: "flex", gap: 6 }}>
                {CAPTION_FONT_SIZES.map(s => (
                  <button key={s.id} type="button" onClick={() => upd("captionFontSize", s.id)} style={{
                    flex: 1, padding: "6px 8px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: form.captionFontSize === s.id ? "var(--bg-3)" : "var(--bg-1)",
                    border: `1px solid ${form.captionFontSize === s.id ? "var(--line-strong)" : "var(--line)"}`,
                    color: form.captionFontSize === s.id ? "var(--tx-0)" : "var(--tx-3)",
                  }}>{s.label}</button>
                ))}
              </div>
            </div>
            {/* Highlight color (for karaoke) */}
            {form.captionStyle === "karaoke" && (
              <div>
                <div style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 7, fontWeight: 600 }}>Couleur highlight</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {CAPTION_HIGHLIGHT_COLORS.map(c => (
                    <button key={c.id} type="button" onClick={() => upd("captionHighlightColor", c.id)} style={{
                      width: 28, height: 28, borderRadius: 99,
                      background: c.hex, border: `2px solid ${form.captionHighlightColor === c.id ? "var(--tx-0)" : "transparent"}`,
                      cursor: "pointer",
                    }} title={c.label} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transitions */}
      <div className="sf-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>Transitions entre scènes</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TRANSITIONS.map(t => (
            <button key={t.id} type="button" onClick={() => upd("transitionStyle", t.id)} style={{
              padding: "8px 14px", borderRadius: 9, cursor: "pointer",
              background: form.transitionStyle === t.id ? "var(--accent-soft)" : "var(--bg-1)",
              border: `1px solid ${form.transitionStyle === t.id ? "var(--accent-line)" : "var(--line)"}`,
            }}>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--tx-0)" }}>{t.label}</div>
              <div style={{ fontSize: 10.5, color: "var(--tx-3)" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 6 — Summary & Launch
// ═══════════════════════════════════════════════════════════════════
function Step6Summary({
  form, creditsBalance, estimatedCredits, onEstimate,
  isAdminTestMode, isPending, onLaunch, onEdit, onUpdate,
}: {
  form: FormState;
  creditsBalance: number;
  estimatedCredits: number;
  onEstimate: (n: number) => void;
  isAdminTestMode: boolean;
  isPending: boolean;
  onLaunch: () => void;
  onEdit: (step: number) => void;
  onUpdate: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const [localEstimate, setLocalEstimate] = useState<{ totalCredits: number; breakdown: Record<string, number> } | null>(null);

  useEffect(() => {
    async function estimate() {
      try {
        const res = await fetch("/api/credits/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoQuality: form.videoQuality,
            durationSeconds: form.durationSeconds,
            ttsProvider: form.videoQuality === "cinema" ? "elevenlabs_multi" : "elevenlabs_flash",
            voiceoverCharacters: Math.round(form.durationSeconds * 16),
            generateImages: form.videoQuality === "cinema" && !form.referenceImageUrl,
            sceneCount: 6,
            useSunoMusic: false,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setLocalEstimate(d);
          onEstimate(d.totalCredits);
        }
      } catch {}
    }
    estimate();
  }, [form.videoQuality, form.durationSeconds, form.referenceImageUrl]);

  const total = localEstimate?.totalCredits ?? estimatedCredits;
  const enough = creditsBalance >= total;

  const STEP_EDIT_LABELS: [number, string, string][] = [
    [1, "Sujet", form.prompt.slice(0, 40) + (form.prompt.length > 40 ? "…" : "")],
    [2, "Visuel", `${form.visualStyle} · ${form.lightingTone} · ${form.cameraMovement}`],
    [3, "Référence", form.referenceImageUrl ? "Photo uploadée ✓" : "Aucune"],
    [4, "Audio", `${form.voiceProvider === "elevenlabs" ? "ElevenLabs" : "Google TTS"} · ${MUSIC_MOODS.find(m => m.id === form.musicMood)?.label ?? form.musicMood}`],
    [5, "Production", `${form.videoQuality.toUpperCase()} · ${form.durationSeconds}s · ${form.aspectRatio} · ${form.fps}fps · ${CAPTION_STYLES.find(c => c.id === form.captionStyle)?.label}`],
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22 }}>
      {/* Left — full recap */}
      <div className="sf-card" style={{ padding: 26 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tx-0)", marginBottom: 18 }}>
          Récapitulatif de ta vidéo
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STEP_EDIT_LABELS.map(([stepN, label, value]) => (
            <div key={stepN} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
              <div style={{ minWidth: 80 }}>
                <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--tx-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
              </div>
              <div style={{ flex: 1, fontSize: 13, color: "var(--tx-1)" }}>{value}</div>
              <button
                type="button"
                onClick={() => onEdit(stepN)}
                style={{ fontSize: 11, color: "var(--accent-bright)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
              >
                Modifier
              </button>
            </div>
          ))}
        </div>

        {/* Platforms */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--tx-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Plateformes</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "tiktok", label: "TikTok", color: "var(--tk)" },
              { id: "youtube", label: "YouTube", color: "var(--yt)" },
              { id: "instagram", label: "Reels", color: "var(--ig)" },
            ].map(p => {
              const on = form.platforms.includes(p.id);
              return (
                <button key={p.id} type="button"
                  onClick={() => {
                    const updated = on
                      ? form.platforms.filter(x => x !== p.id)
                      : [...form.platforms, p.id];
                    onUpdate("platforms", updated);
                  }}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: on ? "var(--bg-3)" : "var(--bg-1)",
                    border: `1px solid ${on ? "var(--line-strong)" : "var(--line)"}`,
                    color: on ? "var(--tx-0)" : "var(--tx-3)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: on ? p.color : "var(--tx-3)" }} />
                  {p.label}
                  {on && <CheckCircle size={11} style={{ color: "var(--ok)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right — cost + launch */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="sf-card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 16 }}>Coût estimé</div>

          {localEstimate && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {Object.entries(localEstimate.breakdown).map(([k, v]) => {
                const labels: Record<string, string> = { video: "Génération vidéo", tts: "Voix off", storyboard: "Scénario (Claude)", dalle: "Images DALL-E", suno: "Musique Suno" };
                return (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: "var(--tx-2)" }}>{labels[k] ?? k}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--tx-0)", fontWeight: 600 }}>{v} cr</span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--tx-2)" }}>Total</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>≈ {(total / 100).toFixed(2)} €</div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--accent-bright)" }}>
              {isAdminTestMode ? "∞" : total}
              <span style={{ fontSize: 14, color: "var(--tx-2)", marginLeft: 4 }}>cr</span>
            </div>
          </div>

          {!isAdminTestMode && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--tx-3)" }}>Solde après</span>
              <span style={{ fontFamily: "var(--font-mono)", color: enough ? "var(--tx-1)" : "var(--bad)", fontWeight: 700 }}>
                {creditsBalance - total} cr
              </span>
            </div>
          )}
        </div>

        {/* Launch button */}
        <button
          type="button"
          onClick={onLaunch}
          disabled={isPending || (!isAdminTestMode && !enough)}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: isPending || (!isAdminTestMode && !enough)
              ? "var(--bg-3)"
              : "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
            color: isPending || (!isAdminTestMode && !enough) ? "var(--tx-3)" : "#fff",
            border: "none", cursor: isPending || (!isAdminTestMode && !enough) ? "not-allowed" : "pointer",
            boxShadow: isPending || (!isAdminTestMode && !enough) ? "none" : "0 8px 28px oklch(0.66 0.21 var(--accent-h) / 0.45)",
            transition: "all .16s",
          }}
        >
          {isPending ? (
            <><Loader2 size={18} style={{ animation: "spin 0.9s linear infinite" }} />Création…</>
          ) : (
            <>🎬 Lancer la génération</>
          )}
        </button>

        {!isAdminTestMode && !enough && total > 0 && (
          <div style={{ padding: 12, borderRadius: 10, background: "oklch(0.66 0.2 22 / 0.1)", border: "1px solid oklch(0.66 0.2 22 / 0.3)", fontSize: 12.5, color: "var(--bad)", textAlign: "center" }}>
            Crédits insuffisants ({creditsBalance} disponibles, {total} requis)
          </div>
        )}

        <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-1)", border: "1px solid var(--line)", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16 }}>🛡</span>
          <div style={{ fontSize: 12, color: "var(--tx-2)", lineHeight: 1.5 }}>
            Tu n&apos;es débité <strong style={{ color: "var(--tx-1)" }}>qu&apos;après</strong> une génération réussie. En cas d&apos;échec, les crédits réservés sont restitués.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COST PREVIEW (sticky sidebar steps 1-5)
// ═══════════════════════════════════════════════════════════════════
function CostPreview({ form, creditsBalance, onEstimate, isAdminTestMode }: {
  form: FormState; creditsBalance: number;
  onEstimate: (n: number) => void; isAdminTestMode: boolean;
}) {
  const [estimate, setEstimate] = useState<{ totalCredits: number; breakdown: Record<string, number> } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEstimate = useCallback(async () => {
    try {
      const res = await fetch("/api/credits/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoQuality: form.videoQuality,
          durationSeconds: form.durationSeconds,
          ttsProvider: form.videoQuality === "cinema" ? "elevenlabs_multi" : "elevenlabs_flash",
          voiceoverCharacters: Math.round(form.durationSeconds * 16),
          generateImages: form.videoQuality === "cinema" && !form.referenceImageUrl,
          sceneCount: 6,
          useSunoMusic: false,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setEstimate(d);
        onEstimate(d.totalCredits);
      }
    } catch {}
  }, [form.videoQuality, form.durationSeconds, form.referenceImageUrl]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fetchEstimate, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [fetchEstimate]);

  const total = estimate?.totalCredits ?? 0;
  const enough = creditsBalance >= total;

  return (
    <div className="sf-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={13} style={{ color: "var(--accent-bright)" }} />
        Estimation live
      </div>

      {estimate && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {Object.entries(estimate.breakdown).map(([k, v]) => {
            const icons: Record<string, string> = { video: "🎬", tts: "🎙️", storyboard: "✍️", dalle: "🖼️", suno: "🎵" };
            return (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--tx-3)" }}>{icons[k] ?? "·"} {k}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--tx-1)" }}>{v}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "var(--tx-3)" }}>Total</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent-bright)" }}>
          {isAdminTestMode ? "∞" : total}
          <span style={{ fontSize: 12, color: "var(--tx-3)", marginLeft: 3 }}>cr</span>
        </div>
      </div>

      {!isAdminTestMode && (
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
          <span style={{ color: "var(--tx-3)" }}>Solde après</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: enough ? "var(--tx-2)" : "var(--bad)" }}>
            {creditsBalance - total} cr
          </span>
        </div>
      )}

      {form.referenceImageUrl && (
        <div style={{ marginTop: 10, padding: "6px 10px", borderRadius: 8, background: "oklch(0.74 0.16 155 / 0.1)", border: "1px solid oklch(0.74 0.16 155 / 0.3)", fontSize: 11, color: "var(--ok)" }}>
          ✓ Photo ref : DALL-E désactivé
        </div>
      )}
    </div>
  );
}
