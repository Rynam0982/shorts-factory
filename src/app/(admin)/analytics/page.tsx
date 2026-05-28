import { adminDb } from "@/lib/firebase-admin";
import RemainingVideosWidget from "@/components/remaining-videos-widget";

export default async function AdminAnalyticsPage() {
  const [usersCount, jobsCount, txCount] = await Promise.all([
    adminDb.collection("users").count().get(),
    adminDb.collection("jobs").count().get(),
    adminDb.collection("credit_transactions").count().get(),
  ]);

  const recentJobsSnap = await adminDb
    .collection("jobs")
    .where("status", "==", "FAILED")
    .limit(20)
    .get();

  const totalFailedJobs = recentJobsSnap.size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
          Monitoring
        </div>
        <h1 style={{ fontSize: 26 }}>Analytics</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Total utilisateurs",    value: usersCount.data().count },
          { label: "Total jobs",             value: jobsCount.data().count },
          { label: "Transactions crédits",   value: txCount.data().count },
        ].map(({ label, value }) => (
          <div key={label} className="sf-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--tx-3)", marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--tx-0)" }}>
              {value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <RemainingVideosWidget />

      <div className="sf-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tx-0)", marginBottom: 4 }}>Jobs échoués récents</div>
        <div style={{ fontSize: 13, color: totalFailedJobs > 0 ? "var(--bad)" : "var(--ok)" }}>
          {totalFailedJobs} job{totalFailedJobs > 1 ? "s" : ""} échoué{totalFailedJobs > 1 ? "s" : ""} récemment
        </div>
      </div>
    </div>
  );
}
