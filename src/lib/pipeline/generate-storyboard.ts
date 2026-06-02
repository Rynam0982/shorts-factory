import { runContentIntelligence } from "@/lib/content-intelligence";
import { adminDb } from "../firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { JobDoc } from "@/types/job";
import type { Storyboard } from "@/types/storyboard";

export async function generateStoryboard(job: JobDoc): Promise<Storyboard> {
  const { storyboard, simulationDebug } = await runContentIntelligence(job);

  await adminDb.collection("jobs").doc(job.id).update({
    storyboard,
    contentProvider: simulationDebug ? "rule-based" : "claude",
    status: "GENERATING_SCENES",
    updatedAt: FieldValue.serverTimestamp(),
  });

  return storyboard;
}
