import type { JobDoc } from "@/types/job";
import type { Storyboard } from "@/types/storyboard";
import type { SimulationDebug } from "./types";
import { generateRuleBasedStoryboard } from "./rule-based-provider";
import { generateClaudeStoryboard } from "./claude-provider";

export interface ContentIntelligenceResult {
  storyboard: Storyboard;
  simulationDebug?: SimulationDebug;
}

/**
 * Picks the correct content provider based on the job context:
 *  - Admin test jobs  → RuleBasedContentProvider (zero AI cost)
 *  - Free plan users  → RuleBasedContentProvider (zero AI cost)
 *  - Paid plan users  → ClaudeContentProvider
 */
export async function runContentIntelligence(
  job: JobDoc,
): Promise<ContentIntelligenceResult> {
  const useRuleBased = job.isAdminTest || job.planTier === "free";

  if (useRuleBased) {
    const result = await generateRuleBasedStoryboard(job);
    return { storyboard: result.storyboard, simulationDebug: result.simulationDebug };
  }

  const result = await generateClaudeStoryboard(job);
  return { storyboard: result.storyboard };
}

export { type SimulationDebug } from "./types";
