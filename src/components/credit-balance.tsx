"use client";

import useSWR from "swr";
import { Coins } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CreditBalance() {
  const { data } = useSWR("/api/credits/balance", fetcher, {
    refreshInterval: 30_000,
  });

  const balance = data?.creditsBalance ?? 0;
  const isTestMode = data?.isAdminTestMode;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Coins size={14} className="text-amber-400" />
      {isTestMode ? (
        <span className="text-amber-400 font-medium">∞ (test)</span>
      ) : (
        <>
          <span className="font-medium text-white">{balance.toLocaleString()}</span>
          <span className="text-slate-500 text-xs">crédits</span>
        </>
      )}
    </div>
  );
}
