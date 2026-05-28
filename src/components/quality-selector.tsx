"use client";

import { Zap, Star, Clapperboard, Lock } from "lucide-react";

interface QualityOption {
  key: "standard" | "premium" | "cinema";
  label: string;
  desc: string;
  crps: number;
  color: string;
  icon: React.ReactNode;
}

const QUALITIES: QualityOption[] = [
  {
    key: "standard",
    label: "Standard",
    desc: "Rapide et économique",
    crps: 7,
    color: "var(--tx-2)",
    icon: <Zap size={18} />,
  },
  {
    key: "premium",
    label: "Premium",
    desc: "Qualité supérieure 4K",
    crps: 14,
    color: "var(--accent-bright)",
    icon: <Star size={18} />,
  },
  {
    key: "cinema",
    label: "Cinema",
    desc: "Professionnelle 4K",
    crps: 19,
    color: "var(--cinema)",
    icon: <Clapperboard size={18} />,
  },
];

interface QualitySelectorProps {
  value: "standard" | "premium" | "cinema";
  onChange: (v: "standard" | "premium" | "cinema") => void;
  allowedQualities?: string[];
}

export default function QualitySelector({ value, onChange, allowedQualities = ["standard", "premium", "cinema"] }: QualitySelectorProps) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {QUALITIES.map(q => {
        const sel = value === q.key;
        const locked = !allowedQualities.includes(q.key);
        return (
          <button
            key={q.key}
            onClick={() => !locked && onChange(q.key)}
            style={{
              flex: 1, textAlign: "left", padding: 16, borderRadius: 14,
              background: sel ? "var(--accent-soft)" : "var(--bg-1)",
              border: `1.5px solid ${sel ? "var(--accent-line)" : "var(--line)"}`,
              transition: "all .16s",
              opacity: locked ? 0.5 : 1,
              cursor: locked ? "not-allowed" : "pointer",
              boxShadow: sel ? "0 8px 26px oklch(0.66 0.21 var(--accent-h) / 0.25)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={{ color: q.color }}>{q.icon}</div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--tx-0)" }}>
                {q.label}
              </span>
              {locked && <Lock size={13} style={{ marginLeft: "auto", color: "var(--tx-3)" }} />}
              {sel && !locked && (
                <svg style={{ marginLeft: "auto", color: "var(--accent-bright)" }} width={17} height={17} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
                </svg>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 10 }}>{q.desc}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>{q.crps} cr/s</div>
          </button>
        );
      })}
    </div>
  );
}
