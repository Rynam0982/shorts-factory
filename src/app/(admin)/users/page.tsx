import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const snap = await adminDb
    .collection("users")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const PLAN_LABELS: Record<string, string> = {
    free: "Gratuit", starter_creator: "Creator", creator_pro: "Creator Pro",
    studio: "Studio", agency: "Agency",
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          Gestion
        </div>
        <h1 style={{ fontSize: 26 }}>Utilisateurs</h1>
      </div>

      <div className="sf-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["Email", "Plan", "Crédits", "Rôle", "Statut", "Actions"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
                  fontFamily: "var(--font-mono)", color: "var(--tx-3)", textTransform: "uppercase", letterSpacing: "0.1em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users as Record<string, unknown>[]).map(u => (
              <tr key={u.id as string} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 16px", fontSize: 13.5, color: "var(--tx-0)" }}>{u.email as string}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    display: "inline-flex", padding: "2px 8px", borderRadius: 99, fontSize: 11,
                    fontWeight: 600, fontFamily: "var(--font-mono)",
                    background: "var(--accent-soft)", color: "var(--accent-bright)",
                    border: "1px solid var(--accent-line)",
                  }}>
                    {PLAN_LABELS[u.plan as string] ?? u.plan as string}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--tx-1)" }}>
                  {(u.creditsBalance as number)?.toLocaleString() ?? 0}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    display: "inline-flex", padding: "2px 8px", borderRadius: 99, fontSize: 10.5,
                    fontWeight: 600, fontFamily: "var(--font-mono)",
                    background: u.role === "admin" ? "oklch(0.78 0.15 75 / 0.13)" : "var(--bg-2)",
                    color: u.role === "admin" ? "oklch(0.78 0.15 75)" : "var(--tx-3)",
                    border: `1px solid ${u.role === "admin" ? "oklch(0.78 0.15 75 / 0.3)" : "var(--line)"}`,
                  }}>
                    {u.role as string}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600,
                    color: u.bannedAt ? "var(--bad)" : "var(--ok)",
                  }}>
                    {u.bannedAt ? "Banni" : "Actif"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/users/${u.id}`} style={{
                    fontSize: 12.5, color: "var(--accent-bright)", textDecoration: "none", fontWeight: 600,
                  }}>
                    Détails →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Users size={32} style={{ color: "var(--tx-3)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--tx-3)", fontSize: 14 }}>Aucun utilisateur encore</p>
        </div>
      )}
    </div>
  );
}
