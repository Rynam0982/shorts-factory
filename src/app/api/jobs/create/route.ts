import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { applyCreditTransaction, InsufficientCreditsError } from "@/lib/credits";
import { estimateJobCost } from "@/lib/pricing";
import { generateVideoTask } from "@/trigger/generate-video";
import { z } from "zod";

const CreateJobSchema = z.object({
  userPrompt:             z.string().min(3).max(2000),
  templateId:             z.string().optional().default("free"),
  niche:                  z.string().optional().default("general"),
  videoQuality:           z.enum(["standard", "premium", "cinema"]).default("standard"),
  durationSeconds:        z.number().min(10).max(120).default(30),
  aspectRatio:            z.enum(["9:16","16:9","1:1","4:3","3:4","2:3"]).optional().default("9:16"),
  fps:                    z.union([z.literal(24), z.literal(30), z.literal(60)]).optional().default(30),
  visualStyle:            z.string().optional().default("cinematic"),
  lightingTone:           z.string().optional().default("dramatic"),
  cameraMovement:         z.string().optional().default("slow_zoom"),
  customReferenceImageUrl: z.string().nullable().optional(),
  voiceProvider:          z.enum(["elevenlabs","google"]).optional().default("elevenlabs"),
  voiceId:                z.string().optional(),
  voiceLanguage:          z.string().optional().default("fr-FR"),
  musicMood:              z.string().optional().default("epic"),
  sfxIntensity:           z.enum(["none","subtle","normal","intense"]).optional().default("normal"),
  audioVoiceBalance:      z.number().min(0).max(100).optional().default(80),
  audioMusicBalance:      z.number().min(0).max(100).optional().default(20),
  captionStyle:           z.enum(["wordbyword","karaoke","bold_center","boxed","minimal","none"]).default("bold_center"),
  captionFontFamily:      z.string().optional().default("Arial Black"),
  captionFontSize:        z.enum(["small","medium","large"]).optional().default("medium"),
  captionPosition:        z.enum(["top","center","bottom"]).optional().default("bottom"),
  captionHighlightColor:  z.string().optional().default("yellow"),
  captionAutoEmoji:       z.boolean().optional().default(false),
  transitionStyle:        z.enum(["cut","fade","zoom","slide","flash"]).optional().default("cut"),
  platforms:              z.array(z.enum(["youtube","tiktok","instagram"])).default([]),
  useSunoMusic:           z.boolean().default(false),
  creationMode:           z.enum(["FULL_AUTO","MANUAL_SCRIPT","IMPORT_CLIP","UPLOAD_PUBLISH"]).default("FULL_AUTO"),
  storyboard:             z.any().optional(),
  sceneOverrides:         z.any().optional(),
  customAudioUrl:         z.string().optional(),
  avatarId:               z.string().optional(),
});

export async function POST(req: NextRequest) {
  let userId: string;
  let user: Awaited<ReturnType<typeof requireUser>>["user"];

  try {
    const result = await requireUser();
    userId = result.clerkUserId;
    user = result.user;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const input = CreateJobSchema.parse(body);

    // Get pricing config to check plan limits
    let allowedQualities: string[] = ["standard"];
    let dailyJobsLimit = 1;

    try {
      const pricingDoc = await adminDb.collection("pricing_config").doc("current").get();
      if (pricingDoc.exists) {
        const pricing = pricingDoc.data()!;
        const planConfig = pricing.plans?.[user.plan];
        if (planConfig) {
          allowedQualities = planConfig.allowedQualities ?? ["standard"];
          dailyJobsLimit = planConfig.dailyJobsLimit ?? 1;
        }
      }
    } catch {}

    // Check quality access
    if (!user.isAdminTestMode && !allowedQualities.includes(input.videoQuality)) {
      return NextResponse.json(
        { error: `Quality "${input.videoQuality}" not available on your plan` },
        { status: 403 }
      );
    }

    // Enforce daily job limit (skip for admin test mode)
    if (!user.isAdminTestMode && dailyJobsLimit > 0) {
      try {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const { Timestamp } = await import("firebase-admin/firestore");
        const todayCount = await adminDb
          .collection("jobs")
          .where("userId", "==", userId)
          .where("createdAt", ">=", Timestamp.fromDate(startOfDay))
          .count()
          .get();
        if (todayCount.data().count >= dailyJobsLimit) {
          return NextResponse.json(
            { error: `Limite journalière atteinte (${dailyJobsLimit} vidéo${dailyJobsLimit > 1 ? "s" : ""}/jour sur votre plan)` },
            { status: 429 }
          );
        }
      } catch { /* skip on error — non-blocking */ }
    }

    // Estimate credits
    const estimate = await estimateJobCost({
      creationMode: input.creationMode,
      videoQuality: input.videoQuality,
      durationSeconds: input.durationSeconds,
      ttsProvider: input.videoQuality === "cinema" ? "elevenlabs_multi" : "elevenlabs_flash",
      voiceoverCharacters: Math.round(input.durationSeconds * 16),
      generateImages: input.videoQuality === "cinema",
      sceneCount: 6,
      useSunoMusic: input.useSunoMusic,
    });

    const estimatedCredits = estimate.totalCredits;

    // Reserve credits (unless admin test mode)
    let reservationTxId: string | null = null;
    if (!user.isAdminTestMode) {
      try {
        const { transactionId } = await applyCreditTransaction({
          userId,
          type: "RESERVATION",
          amount: -estimatedCredits,
          description: `Réservation — ${input.videoQuality} ${input.durationSeconds}s`,
        });
        reservationTxId = transactionId;
      } catch (err) {
        if (err instanceof InsufficientCreditsError) {
          return NextResponse.json(
            { error: `Crédits insuffisants. Nécessaire : ${estimatedCredits}, disponible : ${err.available}` },
            { status: 402 }
          );
        }
        throw err;
      }
    }

    // Create job document
    const jobRef = adminDb.collection("jobs").doc();
    const jobId = jobRef.id;

    const planTier: "free" | "paid" = user.plan === "free" ? "free" : "paid";

    await jobRef.set({
      userId,
      userPrompt:             input.userPrompt,
      templateId:             input.templateId,
      niche:                  input.niche,
      status:                 "QUEUED",
      creationMode:           input.creationMode,

      // Video
      videoQuality:           input.videoQuality,
      videoProviderId:        null,
      durationSeconds:        input.durationSeconds,
      aspectRatio:            input.aspectRatio,
      fps:                    input.fps,

      // Visual
      visualStyle:            input.visualStyle,
      lightingTone:           input.lightingTone,
      cameraMovement:         input.cameraMovement,
      customReferenceImageUrl: input.customReferenceImageUrl ?? null,

      // Audio
      voiceProvider:          input.voiceProvider,
      voiceId:                input.voiceId ?? "21m00Tcm4TlvDq8ikWAM",
      voiceLanguage:          input.voiceLanguage,
      musicMood:              input.musicMood,
      musicUrl:               null,
      sfxIntensity:           input.sfxIntensity,
      audioVoiceBalance:      input.audioVoiceBalance,
      audioMusicBalance:      input.audioMusicBalance,

      // Captions
      captionStyle:           input.captionStyle,
      captionFontFamily:      input.captionFontFamily,
      captionFontSize:        input.captionFontSize,
      captionPosition:        input.captionPosition,
      captionHighlightColor:  input.captionHighlightColor,
      captionAutoEmoji:       input.captionAutoEmoji,

      // Transitions / misc
      transitionStyle:        input.transitionStyle,
      platforms:              input.platforms,
      storyboard:             input.storyboard ?? null,
      sceneOverrides:         input.sceneOverrides ?? null,
      customAudioUrl:         input.customAudioUrl ?? null,
      useSunoMusic:           input.useSunoMusic,
      avatarId:               input.avatarId ?? null,

      // Credits
      estimatedCredits,
      actualCredits:          null,
      reservationTxId,
      triggerRunId:           null,
      finalVideoUrl:          null,
      thumbnailUrl:           null,
      errorMsg:               null,
      costBreakdown:          null,
      publishResults:         null,

      // Flags
      isAdminTest:            false,
      planTier,
      contentProvider:        planTier === "free" ? "rule-based" : "claude",
      simulationDebug:        null,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Trigger background task
    const handle = await generateVideoTask.trigger({ jobId });
    await jobRef.update({
      triggerRunId: handle.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ jobId, estimatedCredits });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Job create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
