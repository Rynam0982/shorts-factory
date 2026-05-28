import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { safeDecrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { service } = await req.json();

  const doc = await adminDb.collection("api_keys").doc("current").get();
  const keyData = doc.data()?.[service];
  if (!keyData?.value) {
    return NextResponse.json({ ok: false, message: "Clé non configurée" });
  }

  const apiKey = safeDecrypt(keyData.value) ?? keyData.value;

  try {
    switch (service) {
      case "anthropic": {
        const res = await fetch("https://api.anthropic.com/v1/models", {
          headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        });
        return NextResponse.json({ ok: res.ok, message: res.ok ? "Connexion OK" : "Clé invalide" });
      }
      case "openai": {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        return NextResponse.json({ ok: res.ok, message: res.ok ? "Connexion OK" : "Clé invalide" });
      }
      case "elevenlabs": {
        const res = await fetch("https://api.elevenlabs.io/v1/user", {
          headers: { "xi-api-key": apiKey },
        });
        return NextResponse.json({ ok: res.ok, message: res.ok ? "Connexion OK" : "Clé invalide" });
      }
      default:
        return NextResponse.json({ ok: true, message: "Test non disponible pour ce service" });
    }
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur réseau" });
  }
}
