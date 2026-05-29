import { task } from "@trigger.dev/sdk/v3";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { applyCreditTransaction } from "@/lib/credits";
import { generateStoryboard } from "@/lib/pipeline/generate-storyboard";
import { generateScene } from "@/lib/pipeline/generate-scene";
import { assembleFullVideo } from "@/lib/pipeline/assemble-video";
import { MissingApiKeyError } from "@/lib/api-clients";
import { publishToAll } from "@/lib/social/publisher";
import type { JobDoc } from "@/types/job";
import type { SocialPlatform } from "@/types/social-account";

async function updateJob(jobId: string, data: Partial<JobDoc>) {
  await adminDb.collection("jobs").doc(jobId).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export const generateVideoTask = task({
  id: "generate-video",
  maxDuration: 3600,
  run: async ({ jobId }: { jobId: string }) => {
    const jobDoc = await adminDb.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) throw new Error(`Job ${jobId} not found`);
    const job = { id: jobDoc.id, ...jobDoc.data() } as JobDoc;

    try {
      // ── 1. Storyboard ──────────────────────────────────────
      await updateJob(jobId, { status: "PROCESSING_STORYBOARD" });
      const storyboard = job.storyboard ?? await generateStoryboard(job);

      // ── 2. Generate scenes in parallel ────────────────────
      await updateJob(jobId, { status: "GENERATING_SCENES" });
      const scenePaths = await Promise.all(
        storyboard.scenes.map(scene => generateScene(scene, job))
      );

      // ── 3. Assemble + upload ───────────────────────────────
      await updateJob(jobId, { status: "ASSEMBLING" });
      const { finalVideoUrl, thumbnailUrl } = await assembleFullVideo({
        scenePaths,
        storyboard,
        job,
      });

      // ── 4. Debit credits (skip for admin test) ─────────────
      if (!job.isAdminTest && job.userId) {
        // Consume credits
        await applyCreditTransaction({
          userId: job.userId,
          type: "CONSUMPTION",
          amount: -(job.estimatedCredits ?? 0),
          relatedJobId: jobId,
          description: `Vidéo générée — ${jobId}`,
        });

        // Release reservation
        if (job.reservationTxId) {
          await applyCreditTransaction({
            userId: job.userId,
            type: "RESERVATION_RELEASE",
            amount: +(job.estimatedCredits ?? 0),
            relatedJobId: jobId,
            description: "Libération réservation",
          });
        }
      }

      // ── 5. Mark READY ──────────────────────────────────────
      await updateJob(jobId, {
        status: "READY",
        finalVideoUrl,
        thumbnailUrl,
        actualCredits: job.estimatedCredits,
      });

      // ── 6. Publish to connected social accounts ────────────
      const platforms = (job.platforms ?? []) as SocialPlatform[];
      if (platforms.length > 0 && job.userId && finalVideoUrl) {
        await updateJob(jobId, { status: "PUBLISHING" });

        const title = job.storyboard?.title ?? job.userPrompt.substring(0, 100);
        const publishResults = await publishToAll(job.userId, platforms, finalVideoUrl, title);

        await updateJob(jobId, { status: "DONE", publishResults });
      } else {
        await updateJob(jobId, { status: "DONE", publishResults: null });
      }

    } catch (error) {
      // Always release reservation on error
      if (!job.isAdminTest && job.userId && job.reservationTxId) {
        try {
          await applyCreditTransaction({
            userId: job.userId,
            type: "RESERVATION_RELEASE",
            amount: +(job.estimatedCredits ?? 0),
            relatedJobId: jobId,
            description: "Libération — échec job",
            bypassBalanceCheck: true,
          });
        } catch {}
      }

      const errorMsg =
        error instanceof MissingApiKeyError
          ? `Service temporairement indisponible (clé API manquante : ${error.service})`
          : error instanceof Error ? error.message : "Erreur inconnue";

      await updateJob(jobId, { status: "FAILED", errorMsg });

      // Don't retry for missing API key errors
      if (error instanceof MissingApiKeyError) return;
      throw error;
    }
  },
});
