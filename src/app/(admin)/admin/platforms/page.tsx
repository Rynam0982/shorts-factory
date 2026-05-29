export default function AdminPlatformsPage() {
  const platforms = [
    { id: "youtube",   label: "YouTube",  env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
    { id: "tiktok",    label: "TikTok",   env: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"] },
    { id: "instagram", label: "Instagram",env: ["META_APP_ID", "META_APP_SECRET"] },
  ];

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          Intégrations
        </div>
        <h1 style={{ fontSize: 26 }}>Plateformes OAuth</h1>
        <p style={{ fontSize: 14, color: "var(--tx-2)", marginTop: 8 }}>
          Configure les credentials OAuth pour permettre la publication automatique.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {platforms.map(p => {
          const allSet = p.env.every(e => !!process.env[e]);
          return (
            <div key={p.id} className="sf-card" style={{ padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: "var(--tx-3)", fontFamily: "var(--font-mono)" }}>
                  {p.env.join(" + ")}
                </div>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: 99,
                fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-mono)",
                background: allSet ? "oklch(0.74 0.16 155 / 0.13)" : "var(--bg-2)",
                color: allSet ? "var(--ok)" : "var(--tx-3)",
                border: `1px solid ${allSet ? "oklch(0.74 0.16 155 / 0.3)" : "var(--line)"}`,
              }}>
                {allSet ? "✓ Configuré" : "Non configuré"}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, padding: 18, borderRadius: 12, background: "var(--bg-1)", border: "1px solid var(--line)", fontSize: 13, color: "var(--tx-2)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--tx-0)" }}>Pour configurer :</strong> ajoute les clés dans ton fichier{" "}
        <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-2)", padding: "1px 5px", borderRadius: 4 }}>.env.local</code>{" "}
        puis redémarre l&apos;application. Les tokens OAuth des utilisateurs sont stockés automatiquement dans Firebase après le flow OAuth.
      </div>
    </div>
  );
}
