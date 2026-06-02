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

  const body = await req.json() as Record<string, unknown>;

  // Whitelist — never allow userId, role, or system fields to be overwritten
  const ALLOWED: (keyof typeof body)[] = [
    "name", "topicPrompt", "templateId", "videoQuality",
    "videoDurationSeconds", "frequency", "daysOfWeek", "timeOfDay",
    "timezone", "platforms", "captionStyle", "useSunoMusic",
    "voiceId", "avatarId", "isActive",
  ];
  const safe: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) safe[key] = body[key];
  }

  if (Object.keys(safe).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await adminDb.collection("series").doc(id).update({
    ...safe,
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
