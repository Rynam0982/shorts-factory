"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  { id: "top5-facts",  label: "Top 5 Faits" },
  { id: "myth-reality",label: "Mythe vs Réalité" },
  { id: "story-drama", label: "Histoire Vraie" },
];

const FREQ_OPTIONS = [
  { id: "daily",        label: "Quotidien" },
  { id: "twice_weekly", label: "2×/semaine" },
  { id: "three_weekly", label: "3×/semaine" },
  { id: "weekly",       label: "Hebdomadaire" },
];

export default function NewSeriesPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    topicPrompt: "",
    templateId: "top5-facts",
    videoQuality: "standard" as "standard" | "premium" | "cinema",
    videoDurationSeconds: 30,
    frequency: "weekly" as "daily" | "twice_weekly" | "three_weekly" | "weekly",
    timeOfDay: "18:00",
    timezone: "Europe/Paris",
    platforms: ["tiktok", "youtube"] as string[],
    captionStyle: "bold_center",
    useSunoMusic: false,
  });

  const steps = ["Sujet & format", "Programmation", "Plateformes"];

  function update(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function togglePlatform(id: string) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(id) ? f.platforms.filter(p => p !== id) : [...f.platforms, id],
    }));
  }

  async function handleSubmit() {
    if (!form.name || !form.topicPrompt) {
      toast.error("Remplis le nom et le sujet");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur");
        toast.success("Série créée !");
        router.push("/series");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  const inp: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-1)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "11px 13px",
    color: "var(--tx-0)",
    fontSize: 14,
    outline: "none",
    fontFamily: "var(--font-body)",
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link href="/series" style={{
        display: "inline-flex", gap: 7, alignItems: "center", color: "var(--tx-2)",
        fontSize: 13, marginBottom: 24, fontWeight: 600, textDecoration: "none",
      }}>
        <ArrowLeft size={15} />Retour aux séries
      </Link>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          Nouvelle série
        </div>
        <h1 style={{ fontSize: 24 }}>Configure ton pilote auto</h1>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {steps.map((s, i) => (
          <div key={s} style={{
            flex: 1, display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderRadius: 10,
            background: i + 1 === step ? "var(--accent-soft)" : "var(--bg-1)",
            border: `1px solid ${i + 1 === step ? "var(--accent-line)" : "var(--line)"}`,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center",
              fontSize: 11, fontWeight: 700,
              background: i + 1 <= step ? "var(--accent)" : "var(--bg-3)",
              color: i + 1 <= step ? "#fff" : "var(--tx-3)",
              fontFamily: "var(--font-mono)",
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: i + 1 === step ? "var(--tx-0)" : "var(--tx-3)" }}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="sf-card" style={{ padding: 28 }}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", display: "block", marginBottom: 8 }}>Nom de la série</label>
              <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Ex : Faits Insolites avec Maya" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", display: "block", marginBottom: 4 }}>Sujet général</label>
              <p style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 8 }}>L&apos;IA piochera des angles différents à chaque épisode</p>
              <input value={form.topicPrompt} onChange={e => update("topicPrompt", e.target.value)} placeholder="Ex : Histoire mondiale & science" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", display: "block", marginBottom: 9 }}>Format narratif</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} type="button" onClick={() => update("templateId", t.id)} style={{
                    padding: "9px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: form.templateId === t.id ? "var(--bg-3)" : "var(--bg-1)",
                    border: `1px solid ${form.templateId === t.id ? "var(--line-strong)" : "var(--line)"}`,
                    color: form.templateId === t.id ? "var(--tx-0)" : "var(--tx-2)",
                  }}>{t.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", display: "block", marginBottom: 9 }}>Fréquence</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {FREQ_OPTIONS.map(f => (
                  <button key={f.id} type="button" onClick={() => update("frequency", f.id)} style={{
                    padding: "9px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: form.frequency === f.id ? "var(--bg-3)" : "var(--bg-1)",
                    border: `1px solid ${form.frequency === f.id ? "var(--line-strong)" : "var(--line)"}`,
                    color: form.frequency === f.id ? "var(--tx-0)" : "var(--tx-2)",
                  }}>{f.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", display: "block", marginBottom: 8 }}>Heure de publication</label>
                <input type="time" value={form.timeOfDay} onChange={e => update("timeOfDay", e.target.value)} style={inp} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", display: "block", marginBottom: 8 }}>Fuseau horaire</label>
                <input value={form.timezone} onChange={e => update("timezone", e.target.value)} style={inp} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", display: "block", marginBottom: 9 }}>Plateformes</label>
              <div style={{ display: "flex", gap: 9 }}>
                {[
                  { id: "tiktok",    label: "TikTok",   color: "var(--tk)" },
                  { id: "youtube",   label: "YouTube",  color: "var(--yt)" },
                  { id: "instagram", label: "Reels",    color: "var(--ig)" },
                ].map(({ id, label, color }) => {
                  const on = form.platforms.includes(id);
                  return (
                    <button key={id} type="button" onClick={() => togglePlatform(id)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10,
                      background: on ? "var(--bg-3)" : "var(--bg-1)",
                      border: `1px solid ${on ? "var(--line-strong)" : "var(--line)"}`,
                      color: on ? "var(--tx-0)" : "var(--tx-3)", fontSize: 13, fontWeight: 600,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                      {label}
                      {on && <span style={{ color: "var(--accent-bright)" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: 16, borderRadius: 12, background: "var(--bg-1)", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-0)", marginBottom: 4 }}>Résumé de la série</div>
              <div style={{ fontSize: 12.5, color: "var(--tx-2)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--tx-0)" }}>{form.name || "Sans nom"}</strong> · {form.topicPrompt || "—"}<br />
                {FREQ_OPTIONS.find(f => f.id === form.frequency)?.label} à {form.timeOfDay} · {form.timezone}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button type="button" onClick={() => step > 1 ? setStep(step - 1) : router.push("/series")} style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10,
          fontSize: 13.5, fontWeight: 600, background: "transparent", color: "var(--tx-2)",
          border: "1px solid var(--line)", cursor: "pointer",
        }}>
          <ArrowLeft size={15} />{step > 1 ? "Précédent" : "Annuler"}
        </button>

        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 600,
            background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
            color: "#fff", cursor: "pointer", border: "none",
          }}>
            Continuer <ArrowRight size={15} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={isPending} style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 600,
            background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
            color: "#fff", cursor: isPending ? "not-allowed" : "pointer", border: "none",
            opacity: isPending ? 0.7 : 1,
          }}>
            <Rocket size={15} />Activer la série
          </button>
        )}
      </div>
    </div>
  );
}
