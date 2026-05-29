import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const CreateSeriesSchema = z.object({
  name: z.string().min(1).max(100),
  topicPrompt: z.string().min(3).max(500),
  templateId: z.string().default("top5-facts"),
  videoQuality: z.enum(["standard", "premium", "cinema"]).default("standard"),
  videoDurationSeconds: z.number().min(20).max(30).default(30),
  frequency: z.enum(["daily", "twice_weekly", "three_weekly", "weekly"]).default("weekly"),
  daysOfWeek: z.array(z.number().min(0).max(6)).default([1]),
  timeOfDay: z.string().default("18:00"),
  timezone: z.string().default("Europe/Paris"),
  platforms: z.array(z.enum(["youtube", "tiktok", "instagram"])).default([]),
  captionStyle: z.enum(["wordbyword", "karaoke", "bold_center", "boxed", "minimal"]).default("bold_center"),
  useSunoMusic: z.boolean().default(false),
  voiceId: z.string().default("21m00Tcm4TlvDq8ikWAM"),
  avatarId: z.string().nullable().default(null),
});

export async function GET() {
  let userId: string;
  try {
    const result = await requireUser();
    userId = result.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await adminDb
    .collection("series")
    .where("userId", "==", userId)
    .get();

  const series = snap.docs
    .map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? null,
      lastRunAt: d.data().lastRunAt?.toDate?.()?.toISOString() ?? null,
      nextRunAt: d.data().nextRunAt?.toDate?.()?.toISOString() ?? null,
    }))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return NextResponse.json(series);
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const result = await requireUser();
    userId = result.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const input = CreateSeriesSchema.parse(body);

    // Compute first nextRunAt
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(parseInt(input.timeOfDay.split(":")[0]), parseInt(input.timeOfDay.split(":")[1]), 0, 0);

    const ref = adminDb.collection("series").doc();
    await ref.set({
      userId,
      ...input,
      isActive: true,
      totalVideosGenerated: 0,
      lastRunAt: null,
      nextRunAt: Timestamp.fromDate(nextRun),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
