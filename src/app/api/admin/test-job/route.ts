import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateVideoTask } from "@/trigger/generate-video";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const result = await requireAdmin();
    userId = result.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const jobRef = adminDb.collection("jobs").doc();
  const jobId = jobRef.id;

  await jobRef.set({
    userId,
    userPrompt: body.userPrompt ?? "Test vidéo admin",
    templateId: body.templateId ?? "free",
    status: "QUEUED",
    creationMode: body.creationMode ?? "FULL_AUTO",
    videoQuality: body.videoQuality ?? "standard",
    durationSeconds: body.durationSeconds ?? 30,
    captionStyle: body.captionStyle ?? "bold_center",
    platforms: body.platforms ?? [],
    storyboard: null,
    sceneOverrides: null,
    customAudioUrl: null,
    useSunoMusic: body.useSunoMusic ?? false,
    useThumbnailAI: body.useThumbnailAI ?? false,
    avatarId: null,
    estimatedCredits: null,
    actualCredits: null,
    reservationTxId: null,
    triggerRunId: null,
    finalVideoUrl: null,
    thumbnailUrl: null,
    errorMsg: null,
    costBreakdown: null,
    isAdminTest: true,        // no credit debit
    planTier: "free",         // uses RuleBasedContentProvider
    contentProvider: "rule-based",
    simulationDebug: null,    // filled during processing
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const handle = await generateVideoTask.trigger({ jobId });
  await jobRef.update({ triggerRunId: handle.id, updatedAt: FieldValue.serverTimestamp() });

  return NextResponse.json({ jobId });
}
