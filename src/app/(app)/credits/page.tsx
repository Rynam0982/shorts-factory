import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";
import CreditPacks from "@/components/credit-packs";

export default async function CreditsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userDoc = await adminDb.collection("users").doc(userId).get();
  const user = userDoc.data()!;

  const txSnap = await adminDb
    .collection("credit_transactions")
    .where("userId", "==", userId)
    .limit(20)
    .get();

  const transactions = txSnap.docs
    .map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null }))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const TYPE_LABELS: Record<string, string> = {
    PURCHASE: "Achat",
    SUBSCRIPTION_GRANT: "Abonnement",
    CONSUMPTION: "Consommation",
    RESERVATION: "Réservation",
    RESERVATION_RELEASE: "Libération réservation",
    REFUND: "Remboursement",
    BONUS: "Bonus",
    ADMIN_ADJUSTMENT: "Ajustement admin",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Crédits</h1>

      {/* Solde */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400 flex items-center gap-1.5">
              <Coins size={12} className="text-amber-400" />
              Solde actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {user.creditsBalance?.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-slate-500">
              ≈ {((user.creditsBalance ?? 0) * 0.01).toFixed(2)}€
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-green-400" />
              Total gagné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {user.totalCreditsEarned?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingDown size={12} className="text-red-400" />
              Total dépensé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {user.totalCreditsSpent?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packs de crédits */}
      <CreditPacks />

      {/* Historique transactions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-300">
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">
              Aucune transaction
            </p>
          ) : (
            <div className="space-y-2">
              {(transactions as Record<string, unknown>[]).map((tx) => (
                <div
                  key={tx.id as string}
                  className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                >
                  <div>
                    <p className="text-sm text-white">
                      {TYPE_LABELS[tx.type as string] ?? tx.type as string}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tx.description as string}
                    </p>
                    {!!tx.createdAt && (
                      <p className="text-xs text-slate-600">
                        {new Date(tx.createdAt as string).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold text-sm ${
                        (tx.amount as number) > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {(tx.amount as number) > 0 ? "+" : ""}
                      {(tx.amount as number).toLocaleString()}
                    </span>
                    <p className="text-xs text-slate-500">
                      Solde : {(tx.balanceAfter as number)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
