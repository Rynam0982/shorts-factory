import { schedules } from "@trigger.dev/sdk/v3";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { generateVideoTask } from "./generate-video";
import type { SeriesDoc } from "@/types/series";

export const checkSeriesScheduler = schedules.task({
  id: "check-series-scheduler",
  cron: "*/15 * * * *", // every 15 minutes
  run: async () => {
    const now = new Date();
    const nowTs = Timestamp.fromDate(now);

    const dueSeries = await adminDb
      .collection("series")
      .where("isActive", "==", true)
      .where("nextRunAt", "<=", nowTs)
      .limit(20)
      .get();

    for (const seriesDoc of dueSeries.docs) {
      const series = { id: seriesDoc.id, ...seriesDoc.data() } as SeriesDoc;

      // Check user subscription
      const userDoc = await adminDb.collection("users").doc(series.userId).get();
      if (!userDoc.exists) continue;
      const user = userDoc.data()!;

      if (user.subscriptionStatus !== "active") {
        await adminDb.collection("series").doc(series.id).update({
          isActive: false,
          updatedAt: FieldValue.serverTimestamp(),
        });
        continue;
      }

      // Create auto job — inherit ALL settings from the series
      const jobRef = adminDb.collection("jobs").doc();
      const jobId = jobRef.id;

      await jobRef.set({
        userId:                 series.userId,
        userPrompt:             series.topicPrompt,
        templateId:             series.templateId,
        status:                 "QUEUED",
        creationMode:           "FULL_AUTO",

        // Video
        videoQuality:           series.videoQuality,
        videoProviderId:        null,
        durationSeconds:        series.videoDurationSeconds,
        aspectRatio:            "9:16",
        fps:                    30,

        // Visual (series doesn't store these yet — sensible defaults)
        visualStyle:            "cinematic",
        lightingTone:           "dramatic",
        cameraMovement:         "slow_zoom",
        customReferenceImageUrl: null,

        // Audio — from series settings
        voiceProvider:          "elevenlabs",
        voiceId:                series.voiceId ?? "21m00Tcm4TlvDq8ikWAM",
        voiceLanguage:          "fr-FR",
        musicMood:              "epic",
        musicUrl:               null,
        sfxIntensity:           "normal",
        audioVoiceBalance:      80,
        audioMusicBalance:      20,

        // Captions — from series settings
        captionStyle:           series.captionStyle ?? "bold_center",
        captionFontFamily:      "Arial Black",
        captionFontSize:        "medium",
        captionPosition:        "bottom",
        captionHighlightColor:  "yellow",
        captionAutoEmoji:       false,

        // Transitions
        transitionStyle:        "cut",

        // Misc
        platforms:              series.platforms ?? [],
        useSunoMusic:           series.useSunoMusic,
        avatarId:               series.avatarId ?? null,
        sceneOverrides:         null,
        customAudioUrl:         null,
        storyboard:             null,

        // Credits
        estimatedCredits:       null,
        actualCredits:          null,
        reservationTxId:        null,
        triggerRunId:           null,
        finalVideoUrl:          null,
        thumbnailUrl:           null,
        errorMsg:               null,
        costBreakdown:          null,
        publishResults:         null,

        // Flags
        isAdminTest:            false,
        planTier:               "paid",
        contentProvider:        "claude",
        simulationDebug:        null,

        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Trigger generation
      try {
        const handle = await generateVideoTask.trigger({ jobId });
        await jobRef.update({ triggerRunId: handle.id, updatedAt: FieldValue.serverTimestamp() });
      } catch (err) {
        console.error(`[scheduler] Trigger.dev error for series ${series.id}:`, err);
        await jobRef.update({
          status: "FAILED",
          errorMsg: "Impossible de démarrer le job (Trigger.dev)",
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      // Update series next run
      await adminDb.collection("series").doc(series.id).update({
        lastRunAt:            FieldValue.serverTimestamp(),
        nextRunAt:            computeNextRun(series, now),
        totalVideosGenerated: FieldValue.increment(1),
        updatedAt:            FieldValue.serverTimestamp(),
      });
    }
  },
});

function computeNextRun(series: SeriesDoc, fromDate: Date): Timestamp {
  const freqDays: Record<string, number> = {
    daily:         1,
    twice_weekly:  3.5,
    three_weekly:  2.33,
    weekly:        7,
  };
  const days = freqDays[series.frequency] ?? 7;

  // Parse timeOfDay safely
  const [hourStr, minStr] = (series.timeOfDay ?? "18:00").split(":");
  const hour   = Math.max(0, Math.min(23, parseInt(hourStr ?? "18", 10) || 18));
  const minute = Math.max(0, Math.min(59, parseInt(minStr  ?? "0",  10) || 0));

  const next = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
  next.setUTCHours(hour, minute, 0, 0);

  return Timestamp.fromDate(next);
}
