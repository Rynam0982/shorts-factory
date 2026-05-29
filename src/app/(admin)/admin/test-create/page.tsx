import StudioClient from "@/app/(app)/create/studio-client";

export default function TestCreatePage() {
  return (
    <div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, marginBottom: 24,
        background: "oklch(0.66 0.2 22 / 0.13)", color: "var(--bad)",
        border: "1px solid oklch(0.66 0.2 22 / 0.3)",
        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
      }}>
        ⚗️ MODE TEST — Crédits illimités — Aucun débit réel
      </div>
      <StudioClient
        creditsBalance={999999}
        isAdminTestMode={true}
        allowedQualities={["standard", "premium", "cinema"]}
      />
    </div>
  );
}
