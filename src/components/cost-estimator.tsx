"use client";

import { useEffect, useState } from "react";
import { Calculator, Film, Mic, Cpu, Image as ImageIcon, Music, Loader2 } from "lucide-react";

interface CostEstimatorProps {
  quality: "standard" | "premium" | "cinema";
  durationSeconds: number;
  useSunoMusic: boolean;
  creditsBalance: number;
  onEstimate: (credits: number) => void;
  disabled?: boolean;
  promptFilled: boolean;
}

const BREAKDOWN_ICONS: Record<string, React.ReactNode> = {
  video:     <Film size={14} />,
  tts:       <Mic size={14} />,
  storyboard:<Cpu size={14} />,
  dalle:     <ImageIcon size={14} />,
  suno:      <Music size={14} />,
};

const BREAKDOWN_LABELS: Record<string, string> = {
  video:     "Génération vidéo",
  tts:       "Voix off",
  storyboard:"Scénario (LLM)",
  dalle:     "Images de référence",
  suno:      "Musique IA",
};

export default function CostEstimator({
  quality, durationSeconds, useSunoMusic,
  creditsBalance, onEstimate, disabled, promptFilled
}: CostEstimatorProps) {
  const [data, setData] = useState<{ totalCredits: number; breakdown: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/credits/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoQuality: quality,
            durationSeconds,
            ttsProvider: quality === "cinema" ? "elevenlabs_multi" : "elevenlabs_flash",
            voiceoverCharacters: Math.round(durationSeconds * 16),
            generateImages: quality === "cinema",
            sceneCount: 6,
            useSunoMusic,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
          onEstimate(d.totalCredits);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [quality, durationSeconds, useSunoMusic]);

  const total = data?.totalCredits ?? 0;
  const enough = creditsBalance >= total;

  return (
    <div className="sf-card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <Calculator size={15} style={{ color: "var(--accent-bright)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>Estimation</span>
        {loading && <Loader2 size={12} style={{ marginLeft: "auto", animation: "spin 0.9s linear infinite", color: "var(--tx-3)" }} />}
        {!loading && <span style={{ fontFamily: "var(--font-mono)", marginLeft: "auto", fontSize: 10.5, color: "var(--tx-3)" }}>live</span>}
      </div>

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18 }}>
          {Object.entries(data.breakdown).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: "var(--tx-3)", width: 16 }}>{BREAKDOWN_ICONS[k]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: "var(--tx-1)", fontWeight: 500 }}>
                  {BREAKDOWN_LABELS[k] ?? k}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--tx-0)", fontWeight: 600 }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--tx-2)" }}>Coût total</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--tx-3)", marginTop: 2 }}>
            ≈ {(total / 100).toFixed(2)} €
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent-bright)" }}>
          {total}
          <span style={{ fontSize: 14, color: "var(--tx-2)", marginLeft: 4 }}>cr</span>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          disabled={disabled || !enough || !promptFilled}
          type="submit"
          form="studio-form"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "13px 20px", borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: disabled || !enough || !promptFilled
              ? "var(--bg-3)"
              : "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))",
            color: disabled || !enough || !promptFilled ? "var(--tx-3)" : "#fff",
            cursor: disabled || !enough || !promptFilled ? "not-allowed" : "pointer",
            border: "none", transition: "all .16s",
            boxShadow: disabled || !enough || !promptFilled ? "none" : "0 6px 20px oklch(0.66 0.21 var(--accent-h) / 0.4)",
          }}
        >
          ▶ Générer la vidéo
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
          <span style={{ color: "var(--tx-3)" }}>Solde après</span>
          <span style={{ fontFamily: "var(--font-mono)", color: enough ? "var(--tx-1)" : "var(--bad)", fontWeight: 600 }}>
            {creditsBalance - total} cr
          </span>
        </div>

        {!enough && total > 0 && (
          <div style={{ fontSize: 11.5, color: "var(--bad)", display: "flex", gap: 6, alignItems: "center" }}>
            ⚠ Crédits insuffisants
          </div>
        )}
        {!promptFilled && enough && (
          <div style={{ fontSize: 11.5, color: "var(--tx-3)", display: "flex", gap: 6, alignItems: "center" }}>
            ℹ Décris ton sujet pour lancer
          </div>
        )}
      </div>

      {/* Security note */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, background: "var(--bg-1)", border: "1px solid var(--line)" }}>
        <span style={{ color: "var(--ok)", fontSize: 14 }}>🛡</span>
        <div style={{ fontSize: 11.5, color: "var(--tx-2)", lineHeight: 1.5 }}>
          Tu n&apos;es débité <strong style={{ color: "var(--tx-1)" }}>qu&apos;après</strong> une génération réussie. En cas d&apos;échec, les crédits réservés sont restitués.
        </div>
      </div>
    </div>
  );
}
