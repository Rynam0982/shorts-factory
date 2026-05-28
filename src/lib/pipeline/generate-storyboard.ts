import { generateStoryboard as generateFromClaude } from "../anthropic";
import { adminDb } from "../firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { JobDoc } from "@/types/job";
import type { Storyboard } from "@/types/storyboard";

export async function generateStoryboard(job: JobDoc): Promise<Storyboard> {
  const storyboard = await generateFromClaude(job);

  await adminDb.collection("jobs").doc(job.id).update({
    storyboard,
    status: "GENERATING_SCENES",
    updatedAt: FieldValue.serverTimestamp(),
  });

  return storyboard;
}
