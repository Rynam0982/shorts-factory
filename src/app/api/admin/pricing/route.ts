import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { invalidatePricingCache } from "@/lib/pricing";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = await adminDb.collection("pricing_config").doc("current").get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(doc.data());
}

export async function PUT(req: NextRequest) {
  let userId: string;
  try {
    const result = await requireAdmin();
    userId = result.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  await adminDb
    .collection("pricing_config")
    .doc("current")
    .set(
      {
        ...body,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: userId,
      },
      { merge: true }
    );

  invalidatePricingCache();
  return NextResponse.json({ ok: true });
}
