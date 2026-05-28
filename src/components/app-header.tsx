"use client";

import { UserButton } from "@clerk/nextjs";
import CreditBalance from "./credit-balance";

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  starter_creator: "Creator",
  creator_pro: "Creator Pro",
  studio: "Studio",
  agency: "Agency",
};

export default function AppHeader({ plan }: { plan: string }) {
  return (
    <header style={{
      height: 54,
      background: "var(--panel-solid)",
      borderBottom: "1px solid var(--line)",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 24px",
      gap: 16,
      flexShrink: 0,
    }}>
      <CreditBalance />

      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        background: "var(--accent-soft)",
        color: "var(--accent-bright)",
        border: "1px solid var(--accent-line)",
      }}>
        {PLAN_LABELS[plan] ?? plan}
      </span>

      <UserButton />
    </header>
  );
}
