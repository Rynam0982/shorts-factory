"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#09090f", color: "#e4e4f0", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Une erreur est survenue</h1>
          <p style={{ color: "#9090b0", marginBottom: 8, lineHeight: 1.6 }}>
            {error.message || "Erreur inattendue côté serveur."}
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 11, color: "#606080", marginBottom: 24 }}>
              Réf : {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{ padding: "10px 24px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
