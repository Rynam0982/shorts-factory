import { adminDb } from "@/lib/firebase-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
  const [usersSnap, jobsSnap, alertsSnap] = await Promise.all([
    adminDb.collection("users").count().get(),
    adminDb.collection("jobs").where("status", "in", ["QUEUED", "PROCESSING_STORYBOARD", "GENERATING_SCENES", "ASSEMBLING"]).count().get(),
    adminDb.collection("alerts").where("acknowledged", "==", false).count().get(),
  ]);

  const totalUsers = usersSnap.data().count;
  const activeJobs = jobsSnap.data().count;
  const unackAlerts = alertsSnap.data().count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-slate-400 text-sm mt-1">Vue d&apos;ensemble — Shorts Factory v2</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users size={14} className="text-blue-400" />
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Briefcase size={14} className="text-violet-400" />
              Jobs en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeJobs}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${unackAlerts > 0 ? "text-amber-400" : "text-white"}`}>
              {unackAlerts}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="py-6 text-center text-slate-500 text-sm">
          Configure les clés API dans{" "}
          <a href="/admin/api-keys" className="text-amber-400 hover:underline">
            Clés API
          </a>{" "}
          et le pricing dans{" "}
          <a href="/admin/pipeline" className="text-amber-400 hover:underline">
            Pipeline
          </a>{" "}
          avant de commencer.
        </CardContent>
      </Card>
    </div>
  );
}
