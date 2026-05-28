import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { encrypt, safeDecrypt } from "@/lib/crypto";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = await adminDb.collection("api_keys").doc("current").get();
  if (!doc.exists) return NextResponse.json({});

  const data = doc.data()!;
  // Return masked values (never decrypt to client)
  const masked: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "object" && val !== null && "value" in val) {
      const decrypted = safeDecrypt((val as { value: string }).value);
      masked[key] = {
        ...(val as object),
        value: decrypted
          ? `${decrypted.substring(0, 8)}...${decrypted.slice(-4)}`
          : "",
        hasValue: !!(val as { value: string }).value,
      };
    } else {
      masked[key] = val;
    }
  }
  return NextResponse.json(masked);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { service, value, enabled } = body as {
    service: string;
    value: string;
    enabled: boolean;
  };

  if (!service) return NextResponse.json({ error: "service required" }, { status: 400 });

  const encryptedValue = value ? encrypt(value) : "";

  await adminDb
    .collection("api_keys")
    .doc("current")
    .set(
      {
        [service]: {
          value: encryptedValue,
          enabled: !!enabled,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { service } = await req.json();
  if (!service) return NextResponse.json({ error: "service required" }, { status: 400 });

  const docRef = adminDb.collection("api_keys").doc("current");
  await docRef.update({
    [service]: FieldValue.delete(),
  });

  return NextResponse.json({ ok: true });
}
