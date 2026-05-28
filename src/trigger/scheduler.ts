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

      // Create auto job
      const jobRef = adminDb.collection("jobs").doc();
      const jobId = jobRef.id;

      await jobRef.set({
        userId: series.userId,
        userPrompt: series.topicPrompt,
        templateId: series.templateId,
        status: "QUEUED",
        creationMode: "FULL_AUTO",
        videoQuality: series.videoQuality,
        durationSeconds: series.videoDurationSeconds,
        useSunoMusic: series.useSunoMusic,
        avatarId: series.avatarId,
        isAdminTest: false,
        estimatedCredits: null,
        actualCredits: null,
        reservationTxId: null,
        storyboard: null,
        finalVideoUrl: null,
        thumbnailUrl: null,
        errorMsg: null,
        costBreakdown: null,
        triggerRunId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Trigger generation
      const handle = await generateVideoTask.trigger({ jobId });

      await jobRef.update({ triggerRunId: handle.id, updatedAt: FieldValue.serverTimestamp() });

      // Update series next run
      await adminDb.collection("series").doc(series.id).update({
        lastRunAt: FieldValue.serverTimestamp(),
        nextRunAt: computeNextRun(series, now),
        totalVideosGenerated: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  },
});

function computeNextRun(series: SeriesDoc, fromDate: Date): Timestamp {
  const freqDays: Record<string, number> = {
    daily: 1,
    twice_weekly: 3.5,
    three_weekly: 2.33,
    weekly: 7,
  };
  const days = freqDays[series.frequency] ?? 7;
  const next = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
  return Timestamp.fromDate(next);
}
