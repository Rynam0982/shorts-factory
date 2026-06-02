import { falTextToVideo, falImageToVideo } from "../fal";
import { getPexelsStockClip } from "../pexels";
import { getPixabayVideoClip } from "../pixabay";
import { generateDalleImage } from "../openai";
import { getPricingConfig } from "../pricing";
import type { Scene } from "@/types/storyboard";
import type { JobDoc } from "@/types/job";

function buildScenePrompt(params: {
  basePrompt: string;
  visualStyle: string | null;
  lightingTone: string | null;
  cameraMovement: string | null;
}): string {
  const parts = [params.basePrompt];

  if (params.visualStyle && params.visualStyle !== "realistic") {
    const styleMap: Record<string, string> = {
      cinematic:  "cinematic film style, shallow depth of field",
      anime:      "anime style, Japanese animation",
      futuristic: "futuristic sci-fi, neon lights, technology",
      vintage:    "vintage film grain, faded colors, retro aesthetic",
      nature:     "natural outdoor lighting, lush environment",
      graphic:    "graphic design style, bold colors, clean lines",
    };
    parts.push(styleMap[params.visualStyle] ?? params.visualStyle);
  }

  if (params.lightingTone) {
    const lightMap: Record<string, string> = {
      dramatic:  "dramatic lighting, high contrast shadows",
      sunny:     "bright sunny daylight, golden hour",
      dark:      "dark moody atmosphere, low key lighting",
      neutral:   "neutral balanced lighting",
      warm:      "warm golden tones, cozy atmosphere",
      cold:      "cold blue tones, crisp lighting",
    };
    parts.push(lightMap[params.lightingTone] ?? "");
  }

  if (params.cameraMovement) {
    const camMap: Record<string, string> = {
      slow_zoom: "slow zoom in",
      pan:       "horizontal panning shot",
      dolly:     "dolly forward tracking shot",
      dynamic:   "dynamic fast cuts, handheld energy",
      static:    "static locked camera",
    };
    parts.push(camMap[params.cameraMovement] ?? "");
  }

  return parts.filter(Boolean).join(", ");
}

export async function generateScene(scene: Scene, job: JobDoc): Promise<string> {
  // ── Rule-based path: admin test or free plan ──────────────────────────────
  const usePixabay = job.isAdminTest || job.planTier === "free";

  if (usePixabay) {
    const keywords = scene.pixabayKeywords?.length
      ? scene.pixabayKeywords
      : scene.visualPrompt
          .split(",")
          .map(s => s.trim())
          .filter(s => s.length > 2)
          .slice(0, 3);

    return getPixabayVideoClip(
      keywords,
      job.id,
      scene.index,
      scene.voiceoverText,
      (scene.motionStyle === "dynamic" ? "high" : "medium"),
    );
  }

  // ── Paid path: AI-generated video ────────────────────────────────────────
  const config = await getPricingConfig();
  const qualityConfig = config.videoQualities[job.videoQuality!];
  const aspectRatio = job.aspectRatio ?? "9:16";
  const fps = job.fps ?? 30;

  const visualPrompt = buildScenePrompt({
    basePrompt: scene.visualPrompt,
    visualStyle: job.visualStyle,
    lightingTone: job.lightingTone,
    cameraMovement: job.cameraMovement,
  });

  try {
    if (job.customReferenceImageUrl) {
      return await falImageToVideo({
        model: qualityConfig.provider,
        imageUrl: job.customReferenceImageUrl,
        prompt: visualPrompt,
        duration: scene.durationSeconds,
        aspectRatio,
        fps,
      });
    }

    if (job.videoQuality === "cinema") {
      const dallePrompt = [scene.visualPrompt, job.visualStyle]
        .filter(Boolean)
        .join(", ");
      const imageUrl = await generateDalleImage(dallePrompt);
      return await falImageToVideo({
        model: qualityConfig.provider,
        imageUrl,
        prompt: visualPrompt,
        duration: scene.durationSeconds,
        aspectRatio,
        fps,
      });
    }

    return await falTextToVideo({
      model: qualityConfig.provider,
      prompt: visualPrompt,
      duration: scene.durationSeconds,
      aspectRatio,
      fps,
    });
  } catch (primaryError) {
    console.warn(`Provider ${qualityConfig.provider} failed:`, primaryError instanceof Error ? primaryError.message : primaryError);
    console.warn(`Trying fallback provider ${qualityConfig.fallback}…`);
    try {
      return await falTextToVideo({
        model: qualityConfig.fallback,
        prompt: visualPrompt,
        duration: scene.durationSeconds,
        aspectRatio,
        fps,
      });
    } catch {
      console.warn("All AI providers failed, using Pexels stock footage");
      return await getPexelsStockClip(scene.visualPrompt);
    }
  }
}
