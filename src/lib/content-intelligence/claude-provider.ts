import { generateStoryboard as generateFromClaude } from "@/lib/anthropic";
import type { JobDoc } from "@/types/job";
import type { Storyboard } from "@/types/storyboard";

export interface ClaudeResult {
  storyboard: Storyboard;
}

export async function generateClaudeStoryboard(job: JobDoc): Promise<ClaudeResult> {
  const storyboard = await generateFromClaude(job);
  return { storyboard };
}
