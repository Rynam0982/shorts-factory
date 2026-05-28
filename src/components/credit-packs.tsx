"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

const PACKS = [
  { id: "pack_500",   credits: 500,   priceEur: 4.99,  label: "Starter" },
  { id: "pack_2000",  credits: 2000,  priceEur: 17.99, label: "Pro" },
  { id: "pack_5000",  credits: 5000,  priceEur: 39.99, label: "Studio" },
  { id: "pack_15000", credits: 15000, priceEur: 99.99, label: "Agency" },
];

export default function CreditPacks() {
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  async function buyPack(packId: string) {
    setLoadingPack(packId);
    try {
      const res = await fetch("/api/billing/checkout-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erreur lors de la création du checkout");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoadingPack(null);
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          Acheter des crédits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PACKS.map(({ id, credits, priceEur, label }) => (
            <div
              key={id}
              className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center space-y-2"
            >
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-xl font-bold text-white">
                {credits.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">crédits</p>
              <p className="text-sm font-semibold text-amber-400">{priceEur}€</p>
              <Button
                onClick={() => buyPack(id)}
                disabled={loadingPack === id}
                size="sm"
                className="w-full"
              >
                {loadingPack === id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  "Acheter"
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
