import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let userId: string;
  try {
    const result = await requireUser();
    userId = result.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await adminDb.collection("series").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.data()?.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let userId: string;
  try {
    const result = await requireUser();
    userId = result.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await adminDb.collection("series").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.data()?.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  await adminDb.collection("series").doc(id).update({
    ...body,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let userId: string;
  try {
    const result = await requireUser();
    userId = result.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await adminDb.collection("series").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.data()?.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await adminDb.collection("series").doc(id).update({
    isActive: false,
    deletedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}
