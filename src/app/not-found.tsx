import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, textAlign: "center", padding: "0 24px", background: "var(--bg-0)", color: "var(--tx-0)" }}>
      <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--accent-bright)", letterSpacing: "0.12em", marginBottom: 4 }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Page introuvable</h1>
      <p style={{ color: "var(--tx-2)", maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" style={{ marginTop: 8, padding: "10px 24px", borderRadius: 8, background: "linear-gradient(160deg, var(--accent-bright), var(--accent-deep))", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
