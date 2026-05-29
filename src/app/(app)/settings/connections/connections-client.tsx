"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { SocialPlatform } from "@/types/social-account";

type AccountInfo = { username: string; platformUserId: string; expiresAt: string };

interface Platform {
  id: SocialPlatform;
  label: string;
  icon: string;
  color: string;
  borderColor: string;
  description: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "tiktok",
    label: "TikTok",
    icon: "🎵",
    color: "oklch(0.7 0.18 345)",
    borderColor: "oklch(0.7 0.18 345 / 0.3)",
    description: "Publie tes Shorts directement sur TikTok",
  },
  {
    id: "instagram",
    label: "Instagram Reels",
    icon: "📸",
    color: "oklch(0.72 0.17 30)",
    borderColor: "oklch(0.72 0.17 30 / 0.3)",
    description: "Partage tes vidéos en Reels Instagram",
  },
  {
    id: "youtube",
    label: "YouTube Shorts",
    icon: "▶️",
    color: "oklch(0.68 0.2 25)",
    borderColor: "oklch(0.68 0.2 25 / 0.3)",
    description: "Poste sur ta chaîne YouTube Shorts",
  },
];

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed:           "Connexion échouée, réessaie.",
  session_expired:        "Session expirée, réessaie.",
  session_corrupted:      "Session invalide, réessaie.",
  state_mismatch:         "Vérification de sécurité échouée, réessaie.",
  missing_code_or_state:  "Réponse OAuth incomplète, réessaie.",
  missing_code_verifier:  "Erreur interne PKCE, réessaie.",
  app_url_missing:        "NEXT_PUBLIC_APP_URL non configuré.",
  access_denied:          "Accès refusé — tu n'es pas dans les testeurs autorisés (Google Cloud Console).",
};

function formatExpiry(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expiré";
  if (days === 0) return "Expire aujourd'hui";
  if (days === 1) return "Expire demain";
  return `Expire dans ${days}j`;
}

function ConnectionsContent({
  accounts,
  configuredPlatforms,
}: {
  accounts: Partial<Record<SocialPlatform, AccountInfo>>;
  configuredPlatforms: Record<SocialPlatform, boolean>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [disconnecting, setDisconnecting] = useState<SocialPlatform | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected") as SocialPlatform | null;
    const error = searchParams.get("error");

    if (connected) {
      const label = PLATFORMS.find((p) => p.id === connected)?.label ?? connected;
      setToast({ msg: `${label} connecté avec succès`, ok: true });
      router.replace("/settings/connections");
    } else if (error) {
      const decoded = decodeURIComponent(error);
      // Check exact match first, then prefix match (e.g. "token_exchange_failed: ...")
      const key = Object.keys(ERROR_MESSAGES).find(k => decoded === k || decoded.startsWith(k + ":"));
      const friendly = key ? ERROR_MESSAGES[key] + (decoded.includes(":") ? `\n${decoded.split(":").slice(1).join(":").trim()}` : "") : decoded;
      setToast({ msg: friendly, ok: false });
      router.replace("/settings/connections");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleDisconnect(platform: SocialPlatform) {
    setDisconnecting(platform);
    try {
      const res = await fetch(`/api/connections/${platform}`, { method: "DELETE" });
      if (res.ok) {
        setToast({ msg: `Compte ${platform} déconnecté`, ok: true });
        router.refresh();
      } else {
        setToast({ msg: "Erreur lors de la déconnexion", ok: false });
      }
    } catch {
      setToast({ msg: "Erreur réseau", ok: false });
    } finally {
      setDisconnecting(null);
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)",
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7,
        }}>
          Réseaux sociaux
        </div>
        <h1 style={{ fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--tx-0)" }}>
          Comptes connectés
        </h1>
        <p style={{ fontSize: 14, color: "var(--tx-2)", marginTop: 8, lineHeight: 1.6 }}>
          Connecte tes comptes une seule fois. ShortsFactory publiera automatiquement tes vidéos.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          marginBottom: 20, padding: "12px 16px", borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          background: toast.ok ? "oklch(0.74 0.16 155 / 0.13)" : "oklch(0.65 0.2 25 / 0.13)",
          color: toast.ok ? "var(--ok)" : "oklch(0.65 0.2 25)",
          border: `1px solid ${toast.ok ? "oklch(0.74 0.16 155 / 0.35)" : "oklch(0.65 0.2 25 / 0.35)"}`,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Platform cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PLATFORMS.map((p) => {
          const account = accounts[p.id];
          const isConnected = !!account;
          const isConfigured = configuredPlatforms[p.id];
          const isDisconnecting = disconnecting === p.id;

          return (
            <div
              key={p.id}
              className="sf-card"
              style={{
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                border: isConnected
                  ? `1px solid ${p.borderColor}`
                  : "1px solid var(--line)",
                opacity: !isConfigured && !isConnected ? 0.6 : 1,
              }}
            >
              {/* Left: icon + info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: isConnected
                    ? p.color.replace(")", " / 0.12)").replace("oklch(", "oklch(")
                    : "var(--bg-2)",
                  display: "grid", placeItems: "center", fontSize: 20,
                }}>
                  {p.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tx-0)", marginBottom: 2 }}>
                    {p.label}
                  </div>
                  {isConnected ? (
                    <div style={{ fontSize: 12, color: "var(--tx-2)" }}>
                      <span style={{ color: p.color, fontWeight: 600 }}>@{account.username}</span>
                      {" · "}
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--tx-3)" }}>
                        {formatExpiry(account.expiresAt)}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--tx-3)" }}>
                      {isConfigured ? p.description : "Non disponible — configuration admin requise"}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: action */}
              {isConnected ? (
                <button
                  onClick={() => handleDisconnect(p.id)}
                  disabled={isDisconnecting}
                  style={{
                    padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: "var(--bg-2)", color: "var(--tx-2)",
                    border: "1px solid var(--line)",
                    cursor: isDisconnecting ? "not-allowed" : "pointer",
                    opacity: isDisconnecting ? 0.6 : 1,
                    flexShrink: 0, transition: "all .14s",
                  }}
                >
                  {isDisconnecting ? "…" : "Déconnecter"}
                </button>
              ) : isConfigured ? (
                <a
                  href={`/api/connect/${p.id}`}
                  style={{
                    padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: "var(--accent-soft)", color: "var(--accent-bright)",
                    border: "1px solid var(--accent-line)",
                    flexShrink: 0, textDecoration: "none", transition: "all .14s",
                  }}
                >
                  Connecter
                </a>
              ) : (
                <span style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  fontFamily: "var(--font-mono)", color: "var(--tx-3)",
                  background: "var(--bg-1)", border: "1px solid var(--line)", flexShrink: 0,
                }}>
                  Non configuré
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{
        marginTop: 24, padding: 16, borderRadius: 10,
        background: "var(--bg-1)", border: "1px solid var(--line)",
        fontSize: 12, color: "var(--tx-3)", lineHeight: 1.7,
      }}>
        <strong style={{ color: "var(--tx-2)" }}>Note :</strong> Les tokens OAuth sont chiffrés
        AES-256-GCM avant stockage. Seules les vidéos publiées via Séries AUTO ou le studio
        sont envoyées sur les plateformes connectées.
      </div>
    </div>
  );
}

export default function ConnectionsClient({
  accounts,
  configuredPlatforms,
}: {
  accounts: Partial<Record<SocialPlatform, AccountInfo>>;
  configuredPlatforms: Record<SocialPlatform, boolean>;
}) {
  return (
    <Suspense fallback={null}>
      <ConnectionsContent accounts={accounts} configuredPlatforms={configuredPlatforms} />
    </Suspense>
  );
}
