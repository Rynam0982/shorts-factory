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

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body */ }

  const jobRef = adminDb.collection("jobs").doc();
  const jobId = jobRef.id;

  await jobRef.set({
    userId,
    userPrompt:            body.userPrompt            ?? "Test vidéo admin",
    templateId:            body.templateId            ?? "free",
    status:                "QUEUED",
    creationMode:          body.creationMode          ?? "FULL_AUTO",

    // Video
    videoQuality:          body.videoQuality          ?? "standard",
    videoProviderId:       null,
    durationSeconds:       body.durationSeconds       ?? 30,
    aspectRatio:           body.aspectRatio           ?? "9:16",
    fps:                   body.fps                   ?? 30,

    // Visual
    visualStyle:           body.visualStyle           ?? "cinematic",
    lightingTone:          body.lightingTone          ?? "dramatic",
    cameraMovement:        body.cameraMovement        ?? "slow_zoom",
    customReferenceImageUrl: body.customReferenceImageUrl ?? null,

    // Audio
    voiceProvider:         body.voiceProvider         ?? "google",
    voiceId:               body.voiceId               ?? "fr-FR-Wavenet-D",
    voiceLanguage:         body.voiceLanguage         ?? "fr-FR",
    musicMood:             body.musicMood             ?? "epic",
    musicUrl:              null,
    sfxIntensity:          body.sfxIntensity          ?? "normal",
    audioVoiceBalance:     body.audioVoiceBalance     ?? 80,
    audioMusicBalance:     body.audioMusicBalance     ?? 20,

    // Captions
    captionStyle:          body.captionStyle          ?? "bold_center",
    captionFontFamily:     body.captionFontFamily     ?? "Arial Black",
    captionFontSize:       body.captionFontSize       ?? "medium",
    captionPosition:       body.captionPosition       ?? "bottom",
    captionHighlightColor: body.captionHighlightColor ?? "yellow",
    captionAutoEmoji:      body.captionAutoEmoji      ?? false,

    // Transitions / misc
    transitionStyle:       body.transitionStyle       ?? "cut",
    platforms:             body.platforms             ?? [],
    storyboard:            null,
    sceneOverrides:        null,
    customAudioUrl:        null,
    useSunoMusic:          false,
    avatarId:              null,

    // Credits
    estimatedCredits:      null,
    actualCredits:         null,
    reservationTxId:       null,
    triggerRunId:          null,
    finalVideoUrl:         null,
    thumbnailUrl:          null,
    errorMsg:              null,
    costBreakdown:         null,
    publishResults:        null,

    // Flags
    isAdminTest:           true,
    planTier:              "free",
    contentProvider:       "rule-based",
    simulationDebug:       null,

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Trigger background job — gracefully handle Trigger.dev unavailability
  try {
    const handle = await generateVideoTask.trigger({ jobId });
    await jobRef.update({ triggerRunId: handle.id, updatedAt: FieldValue.serverTimestamp() });
  } catch (err) {
    console.error("[admin/test-job] Trigger.dev error:", err);
    await jobRef.update({
      status: "FAILED",
      errorMsg: "Impossible de démarrer le job (Trigger.dev non disponible)",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.json({ jobId });
}
