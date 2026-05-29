import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SocialPlatform } from "@/types/social-account";

const PLATFORM_LABELS: Record<SocialPlatform, { label: string; icon: string }> = {
  tiktok:    { label: "TikTok",           icon: "🎵" },
  instagram: { label: "Instagram Reels",  icon: "📸" },
  youtube:   { label: "YouTube Shorts",   icon: "▶️" },
};

function formatDate(ts: { seconds?: number } | null | undefined): string {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function expiryStatus(ts: { seconds?: number } | null | undefined): { label: string; ok: boolean } {
  if (!ts?.seconds) return { label: "Inconnu", ok: false };
  const diff = ts.seconds * 1000 - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expiré", ok: false };
  if (days === 0) return { label: "Expire aujourd'hui", ok: false };
  if (days <= 3) return { label: `Expire dans ${days}j`, ok: false };
  return { label: `Expire dans ${days}j`, ok: true };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) redirect("/admin/users");

  const user = userDoc.data()!;

  const [txSnap, socialSnap] = await Promise.all([
    adminDb
      .collection("credit_transactions")
      .where("userId", "==", userId)
      .limit(20)
      .get(),
    adminDb
      .collection("social_accounts")
      .where("userId", "==", userId)
      .get(),
  ]);

  const transactions = txSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0;
      const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0;
      return tb - ta;
    });

  const socialAccounts = socialSnap.docs.map(d => ({
    id: d.id,
    ...(d.data() as {
      platform: SocialPlatform;
      username: string;
      platformUserId: string;
      scopes: string[];
      expiresAt: { seconds?: number } | null;
      createdAt: { seconds?: number } | null;
    }),
  }));

  return (
    <div style={{ maxWidth: 800 }}>
      <Link href="/admin/users" style={{
        display: "inline-flex", alignItems: "center", gap: 7, color: "var(--tx-2)",
        fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={15} />Retour aux utilisateurs
      </Link>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22 }}>{user.email}</h1>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)", marginTop: 4 }}>{userId}</div>
      </div>

      {/* User info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Plan",           value: user.plan },
          { label: "Crédits",        value: (user.creditsBalance ?? 0).toLocaleString() },
          { label: "Rôle",           value: user.role },
          { label: "Abonnement",     value: user.subscriptionStatus },
          { label: "Test mode",      value: user.isAdminTestMode ? "Oui" : "Non" },
          { label: "Stripe ID",      value: user.stripeCustomerId ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="sf-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--tx-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--tx-0)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Social accounts */}
      <div className="sf-card" style={{ overflow: "hidden", marginBottom: 24 }}>
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-0)" }}>
            Comptes sociaux connectés ({socialAccounts.length})
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tx-3)",
            background: "var(--bg-2)", padding: "2px 8px", borderRadius: 6,
            border: "1px solid var(--line)",
          }}>
            social_accounts
          </span>
        </div>

        {socialAccounts.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--tx-3)", fontSize: 13 }}>
            Aucun compte connecté
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {socialAccounts.map((acc) => {
              const meta = PLATFORM_LABELS[acc.platform] ?? { label: acc.platform, icon: "🔗" };
              const expiry = expiryStatus(acc.expiresAt);
              return (
                <div
                  key={acc.id}
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--tx-2)", marginTop: 2 }}>
                      <span style={{ fontWeight: 600 }}>@{acc.username}</span>
                      <span style={{ color: "var(--tx-3)", marginLeft: 8, fontFamily: "var(--font-mono)" }}>
                        {acc.platformUserId}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--tx-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                      {acc.scopes?.join(", ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)",
                      color: expiry.ok ? "var(--ok)" : "oklch(0.65 0.2 25)",
                      background: expiry.ok ? "oklch(0.74 0.16 155 / 0.1)" : "oklch(0.65 0.2 25 / 0.1)",
                      padding: "2px 8px", borderRadius: 6,
                      border: `1px solid ${expiry.ok ? "oklch(0.74 0.16 155 / 0.3)" : "oklch(0.65 0.2 25 / 0.3)"}`,
                    }}>
                      {expiry.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--tx-3)", marginTop: 4 }}>
                      Connecté le {formatDate(acc.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Credit transactions */}
      <div className="sf-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", fontSize: 13, fontWeight: 600, color: "var(--tx-0)" }}>
          Transactions crédits ({transactions.length})
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--tx-3)", fontSize: 13 }}>Aucune transaction</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["Type", "Montant", "Solde après", "Description"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--tx-3)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(transactions as Record<string, unknown>[]).map(tx => (
                <tr key={tx.id as string} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--tx-2)" }}>{tx.type as string}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: (tx.amount as number) > 0 ? "var(--ok)" : "var(--bad)" }}>
                    {(tx.amount as number) > 0 ? "+" : ""}{(tx.amount as number)}
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--tx-3)" }}>{(tx.balanceAfter as number)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12.5, color: "var(--tx-2)" }}>{(tx.description as string)?.slice(0, 60)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
