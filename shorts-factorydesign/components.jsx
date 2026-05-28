/* global React */
// components.jsx — éléments partagés Shorts Factory
const { useState, useEffect, useRef } = React;

/* ---------- Icône (Iconify, set Tabler) ---------- */
function Icon({ name, size = 18, style, className = "" }) {
  return <iconify-icon icon={`tabler:${name}`} width={size} height={size} className={className}
    style={{ display: "inline-flex", lineHeight: 1, flex: "none", ...style }} />;
}

/* ---------- Logo / wordmark ---------- */
function Logo({ size = 28, showText = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.28, position: "relative",
        background: "linear-gradient(150deg, var(--accent-bright), var(--accent-deep))",
        display: "grid", placeItems: "center", flex: "none",
        boxShadow: "0 4px 16px oklch(0.66 0.21 var(--accent-h) / calc(0.5 * var(--glow)))",
      }}>
        {/* monogramme : barres style "play / assembly" */}
        <div style={{ display: "flex", gap: size * 0.07, alignItems: "flex-end", height: size * 0.42 }}>
          <span style={{ width: size * 0.1, height: "55%", background: "#fff", borderRadius: 2, opacity: 0.95 }} />
          <span style={{ width: size * 0.1, height: "100%", background: "#fff", borderRadius: 2 }} />
          <span style={{ width: size * 0.1, height: "72%", background: "#fff", borderRadius: 2, opacity: 0.9 }} />
        </div>
      </div>
      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.6, color: "var(--tx-0)", letterSpacing: "-0.02em" }}>
            Shorts<span style={{ color: "var(--accent-bright)" }}>Factory</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Bouton ---------- */
function Btn({ children, variant = "primary", size = "md", icon, iconRight, full, onClick, disabled, style }) {
  const sizes = { sm: { p: "7px 12px", fs: 13, ic: 15 }, md: { p: "10px 16px", fs: 14, ic: 17 }, lg: { p: "14px 22px", fs: 15.5, ic: 19 } };
  const s = sizes[size];
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: s.p, fontSize: s.fs, fontWeight: 600, borderRadius: 10,
    width: full ? "100%" : undefined, transition: "all .16s ease",
    opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto",
    fontFamily: "var(--font-body)", whiteSpace: "nowrap", ...style,
  };
  const variants = {
    primary: { background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))", color: "#fff",
      boxShadow: "0 6px 20px oklch(0.66 0.21 var(--accent-h) / calc(0.4 * var(--glow)))" },
    ghost: { background: "transparent", color: "var(--tx-1)", border: "1px solid var(--line)" },
    soft: { background: "var(--bg-2)", color: "var(--tx-0)", border: "1px solid var(--line)" },
    danger: { background: "transparent", color: "var(--bad)", border: "1px solid oklch(0.66 0.2 22 / 0.4)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="sf-btn" style={{ ...base, ...variants[variant] }}>
      {icon && <Icon name={icon} size={s.ic} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.ic} />}
    </button>
  );
}

/* ---------- Pastille / badge ---------- */
function Pill({ children, tone = "neutral", icon, style }) {
  const tones = {
    neutral: { bg: "var(--bg-2)", fg: "var(--tx-2)", bd: "var(--line)" },
    accent: { bg: "var(--accent-soft)", fg: "var(--accent-bright)", bd: "var(--accent-line)" },
    ok: { bg: "oklch(0.74 0.16 155 / 0.13)", fg: "var(--ok)", bd: "oklch(0.74 0.16 155 / 0.3)" },
    warn: { bg: "oklch(0.78 0.15 75 / 0.13)", fg: "var(--warn)", bd: "oklch(0.78 0.15 75 / 0.3)" },
    bad: { bg: "oklch(0.66 0.2 22 / 0.13)", fg: "var(--bad)", bd: "oklch(0.66 0.2 22 / 0.3)" },
    cinema: { bg: "oklch(0.7 0.16 300 / 0.14)", fg: "var(--cinema)", bd: "oklch(0.7 0.16 300 / 0.32)" },
  };
  const t = tones[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99,
      fontSize: 11.5, fontWeight: 600, background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      fontFamily: "var(--font-mono)", letterSpacing: "0.02em", ...style }}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* ---------- Badge plateforme ---------- */
const PLATFORMS = {
  youtube: { icon: "brand-youtube", color: "var(--yt)", label: "YouTube" },
  tiktok: { icon: "brand-tiktok", color: "var(--tk)", label: "TikTok" },
  instagram: { icon: "brand-instagram", color: "var(--ig)", label: "Reels" },
};
function PlatformDot({ id, size = 26 }) {
  const p = PLATFORMS[id];
  return (
    <div title={p.label} style={{ width: size, height: size, borderRadius: 8, display: "grid", placeItems: "center",
      background: "var(--bg-2)", border: "1px solid var(--line)", color: p.color, flex: "none" }}>
      <Icon name={p.icon} size={size * 0.58} />
    </div>
  );
}

/* ---------- Cadre vidéo 9:16 (placeholder stylisé) ---------- */
const FRAME_THEMES = [
  ["oklch(0.55 0.2 280)", "oklch(0.4 0.18 320)"],
  ["oklch(0.5 0.18 200)", "oklch(0.42 0.16 260)"],
  ["oklch(0.58 0.17 30)", "oklch(0.45 0.18 350)"],
  ["oklch(0.55 0.16 150)", "oklch(0.42 0.15 200)"],
  ["oklch(0.6 0.18 90)", "oklch(0.46 0.18 40)"],
];
function ShortFrame({ seed = 0, caption, label, w = 150, playing, progress = 0.4, badge, captionStyle = "bold_center" }) {
  const [a, b] = FRAME_THEMES[seed % FRAME_THEMES.length];
  const h = w * (16 / 9);
  return (
    <div style={{ width: w, height: h, borderRadius: Math.max(10, w * 0.08), position: "relative", overflow: "hidden",
      border: "1px solid var(--line-strong)", flex: "none",
      background: `radial-gradient(120% 90% at 30% 15%, ${a}, transparent 60%), radial-gradient(120% 90% at 80% 90%, ${b}, transparent 55%), var(--bg-3)` }}>
      {/* grain / mesh */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.5,
        backgroundImage: "repeating-linear-gradient(115deg, oklch(1 0 0 / 0.05) 0 2px, transparent 2px 5px)" }} />
      {/* scanline si lecture */}
      {playing && <div style={{ position: "absolute", left: 0, right: 0, height: "14%", top: 0,
        background: "linear-gradient(180deg, oklch(1 0 0 / 0.25), transparent)", animation: "scan 2.4s linear infinite" }} />}
      {/* badge coin */}
      {badge && <div style={{ position: "absolute", top: 7, left: 7 }}>{badge}</div>}
      {/* durée */}
      <div className="mono" style={{ position: "absolute", top: 7, right: 7, fontSize: 9.5, padding: "2px 5px",
        borderRadius: 5, background: "oklch(0 0 0 / 0.45)", color: "#fff", backdropFilter: "blur(4px)" }}>0:{String(20 + seed % 12).padStart(2, "0")}</div>
      {/* caption façon sous-titre viral */}
      {caption && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "22%", display: "flex", justifyContent: "center", padding: "0 8%" }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, textAlign: "center",
            fontSize: Math.max(10, w * 0.085), lineHeight: 1.1, textTransform: captionStyle === "minimal" ? "none" : "uppercase",
            color: "#fff", textShadow: "0 2px 8px oklch(0 0 0 / 0.7)",
            background: captionStyle === "boxed" ? "oklch(0 0 0 / 0.55)" : "transparent",
            padding: captionStyle === "boxed" ? "3px 6px" : 0, borderRadius: 5,
            WebkitTextStroke: captionStyle === "bold_center" ? "0.5px oklch(0 0 0 / 0.3)" : undefined,
          }}>{caption}</span>
        </div>
      )}
      {/* barre de progression */}
      <div style={{ position: "absolute", left: 8, right: 8, bottom: 8, height: 3, borderRadius: 3, background: "oklch(1 0 0 / 0.22)" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "#fff", borderRadius: 3 }} />
      </div>
      {/* label technique sous le cadre interne */}
      {label && <div className="mono" style={{ position: "absolute", left: 7, bottom: 16, fontSize: 8.5, color: "oklch(1 0 0 / 0.7)" }}>{label}</div>}
    </div>
  );
}

/* ---------- Stat / métrique ---------- */
function Stat({ label, value, sub, icon, tone = "accent" }) {
  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: "var(--tx-2)", fontWeight: 600 }}>{label}</span>
        {icon && <div style={{ color: tone === "accent" ? "var(--accent-bright)" : "var(--tx-3)" }}><Icon name={icon} size={17} /></div>}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--tx-0)", letterSpacing: "-0.02em" }} className="tnum">{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--tx-3)" }}>{sub}</div>}
    </div>
  );
}

/* ---------- Section header ---------- */
function SectionTitle({ kicker, title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
      <div>
        {kicker && <div className="mono" style={{ fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>{kicker}</div>}
        <h2 style={{ fontSize: 22 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

Object.assign(window, { Icon, Logo, Btn, Pill, PlatformDot, PLATFORMS, ShortFrame, Stat, SectionTitle });
