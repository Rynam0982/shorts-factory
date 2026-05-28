"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

interface VideoEstimates {
  standard30s: number;
  standard60s: number;
  premium30s: number;
  premium60s: number;
  cinema30s: number;
  cinema60s: number;
  bottleneck: "fal" | "elevenlabs" | "balanced";
}

interface ServiceBalance {
  service: string;
  balanceUsd: number;
  estimates: VideoEstimates;
}

function colorFromCount(n: number) {
  if (n > 500) return "text-green-400";
  if (n > 50) return "text-amber-400";
  return "text-red-400";
}

export default function RemainingVideosWidget() {
  const [data, setData] = useState<ServiceBalance | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics/balances");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const estimates = data?.estimates;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Vidéos restantes estimées
          </CardTitle>
          <Button onClick={refresh} disabled={loading} variant="outline" size="sm">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            <span className="ml-1.5">Rafraîchir</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!estimates ? (
          <p className="text-slate-500 text-sm">
            Clique sur Rafraîchir pour voir les estimations.
          </p>
        ) : (
          <div className="space-y-2">
            {data?.balanceUsd !== undefined && (
              <p className="text-xs text-slate-400 mb-3">
                Solde fal.ai : <span className="text-white font-medium">${data.balanceUsd.toFixed(2)}</span>
                {estimates.bottleneck !== "balanced" && (
                  <span className="ml-2 text-amber-400">
                    ⚠️ Goulot : {estimates.bottleneck}
                  </span>
                )}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: "Standard 30s", val: estimates.standard30s },
                { label: "Standard 60s", val: estimates.standard60s },
                { label: "Premium 30s",  val: estimates.premium30s },
                { label: "Premium 60s",  val: estimates.premium60s },
                { label: "Cinema 30s",   val: estimates.cinema30s },
                { label: "Cinema 60s",   val: estimates.cinema60s },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center px-3 py-1.5 bg-slate-800 rounded">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className={`font-semibold text-xs ${colorFromCount(val)}`}>
                    ≈ {val.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
