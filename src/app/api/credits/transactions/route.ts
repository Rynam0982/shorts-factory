import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { clerkUserId } = await requireUser();
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

    const snap = await adminDb
      .collection("credit_transactions")
      .where("userId", "==", clerkUserId)
      .orderBy("createdAt", "desc")
      .limit(Math.min(limit, 100))
      .get();

    const transactions = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));

    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
