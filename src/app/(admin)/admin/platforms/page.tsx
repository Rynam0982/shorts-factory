import { adminDb } from "@/lib/firebase-admin";
import type { SocialPlatform } from "@/types/social-account";

interface PlatformConfig {
  id: SocialPlatform;
  label: string;
  icon: string;
  envVars: string[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "tiktok",
    label: "TikTok",
    icon: "🎵",
    envVars: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
  },
  {
    id: "instagram",
    label: "Instagram Reels",
    icon: "📸",
    envVars: ["META_APP_ID", "META_APP_SECRET"],
  },
  {
    id: "youtube",
    label: "YouTube Shorts",
    icon: "▶️",
    envVars: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET"],
  },
];

async function getPlatformStats(): Promise<Record<SocialPlatform, { count: number; recentUsernames: string[] }>> {
  const snap = await adminDb.collection("social_accounts").get();

  const stats: Record<SocialPlatform, { count: number; recentUsernames: string[] }> = {
    tiktok:    { count: 0, recentUsernames: [] },
    instagram: { count: 0, recentUsernames: [] },
    youtube:   { count: 0, recentUsernames: [] },
  };

  for (const doc of snap.docs) {
    const data = doc.data() as { platform: SocialPlatform; username: string };
    const p = data.platform;
    if (stats[p]) {
      stats[p].count++;
      if (stats[p].recentUsernames.length < 3) {
        stats[p].recentUsernames.push(data.username);
      }
    }
  }

  return stats;
}

export default async function AdminPlatformsPage() {
  const stats = await getPlatformStats();

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)",
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7,
        }}>
          Intégrations
        </div>
        <h1 style={{ fontSize: 26 }}>Plateformes OAuth</h1>
        <p style={{ fontSize: 14, color: "var(--tx-2)", marginTop: 8 }}>
          Statut de configuration et comptes connectés par plateforme.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PLATFORMS.map((p) => {
          const envOk = p.envVars.every((e) => !!process.env[e]);
          const platformStats = stats[p.id];

          return (
            <div key={p.id} className="sf-card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Header row */}
              <div style={{
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                borderBottom: platformStats.count > 0 ? "1px solid var(--line)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tx-0)", marginBottom: 3 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--tx-3)", fontFamily: "var(--font-mono)" }}>
                      {p.envVars.join(" · ")}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Users connected badge */}
                  {platformStats.count > 0 && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", padding: "4px 10px",
                      borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                      fontFamily: "var(--font-mono)",
                      background: "oklch(0.66 0.21 var(--accent-h) / 0.12)",
                      color: "var(--accent-bright)",
                      border: "1px solid oklch(0.66 0.21 var(--accent-h) / 0.3)",
                    }}>
                      {platformStats.count} user{platformStats.count > 1 ? "s" : ""}
                    </span>
                  )}

                  {/* App config badge */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", padding: "4px 12px",
                    borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    background: envOk ? "oklch(0.74 0.16 155 / 0.13)" : "var(--bg-2)",
                    color: envOk ? "var(--ok)" : "var(--tx-3)",
                    border: `1px solid ${envOk ? "oklch(0.74 0.16 155 / 0.3)" : "var(--line)"}`,
                  }}>
                    {envOk ? "✓ App configurée" : "App non configurée"}
                  </span>
                </div>
              </div>

              {/* Connected users preview */}
              {platformStats.count > 0 && (
                <div style={{
                  padding: "10px 22px",
                  background: "var(--bg-1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 11, color: "var(--tx-3)", fontFamily: "var(--font-mono)" }}>
                    Connectés :
                  </span>
                  {platformStats.recentUsernames.map((u) => (
                    <span key={u} style={{
                      fontSize: 11.5, fontWeight: 600,
                      color: "var(--tx-2)",
                      background: "var(--bg-2)",
                      padding: "2px 8px", borderRadius: 6,
                      border: "1px solid var(--line)",
                      fontFamily: "var(--font-mono)",
                    }}>
                      @{u}
                    </span>
                  ))}
                  {platformStats.count > 3 && (
                    <span style={{ fontSize: 11, color: "var(--tx-3)" }}>
                      +{platformStats.count - 3} autres
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Configuration guide */}
      <div style={{
        marginTop: 24, padding: 18, borderRadius: 12,
        background: "var(--bg-1)", border: "1px solid var(--line)",
        fontSize: 13, color: "var(--tx-2)", lineHeight: 1.6,
      }}>
        <strong style={{ color: "var(--tx-0)" }}>Pour configurer :</strong> ajoute les clés dans{" "}
        <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-2)", padding: "1px 5px", borderRadius: 4 }}>
          .env.local
        </code>{" "}
        puis redémarre. Les tokens OAuth sont stockés chiffrés dans{" "}
        <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-2)", padding: "1px 5px", borderRadius: 4 }}>
          social_accounts
        </code>{" "}
        dans Firebase. Les utilisateurs connectent leurs comptes via{" "}
        <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-2)", padding: "1px 5px", borderRadius: 4 }}>
          /settings/connections
        </code>.
      </div>

      {/* Firestore collection info */}
      <div style={{
        marginTop: 12, padding: 14, borderRadius: 12,
        background: "var(--bg-1)", border: "1px solid var(--line)",
        fontSize: 12, color: "var(--tx-3)", fontFamily: "var(--font-mono)",
      }}>
        Collection Firestore :{" "}
        <strong style={{ color: "var(--tx-2)" }}>social_accounts/{"{userId}_{platform}"}</strong>
        {" "}— document ID unique par user + plateforme. Tokens chiffrés AES-256-GCM.
      </div>
    </div>
  );
}
