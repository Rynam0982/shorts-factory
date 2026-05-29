import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) redirect("/admin/users");

  const user = userDoc.data()!;

  const txSnap = await adminDb
    .collection("credit_transactions")
    .where("userId", "==", userId)
    .limit(20)
    .get();

  const transactions = txSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0;
      const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0;
      return tb - ta;
    });

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
