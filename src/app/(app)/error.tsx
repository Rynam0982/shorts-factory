"use client";

import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center", padding: "0 24px" }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Quelque chose s&apos;est mal passé</h2>
      <p style={{ color: "var(--tx-2)", maxWidth: 420, lineHeight: 1.6 }}>
        {error.message || "Une erreur inattendue s'est produite."}
      </p>
      {error.digest && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-3)" }}>
          Réf : {error.digest}
        </p>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{ padding: "10px 20px", borderRadius: 8, background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
        >
          Réessayer
        </button>
        <Link href="/dashboard" style={{ padding: "10px 20px", borderRadius: 8, background: "var(--bg-2)", color: "var(--tx-1)", border: "1px solid var(--line)", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
