import { falTextToVideo, falImageToVideo } from "../fal";
import { getPexelsStockClip } from "../pexels";
import { generateDalleImage } from "../openai";
import { getPricingConfig } from "../pricing";
import type { Scene } from "@/types/storyboard";
import type { JobDoc } from "@/types/job";

export async function generateScene(scene: Scene, job: JobDoc): Promise<string> {
  const config = await getPricingConfig();
  const qualityConfig = config.videoQualities[job.videoQuality!];

  try {
    if (job.videoQuality === "cinema") {
      // Cinema: DALL-E reference image + Kling Pro
      const imageUrl = await generateDalleImage(scene.visualPrompt);
      return await falImageToVideo({
        model: qualityConfig.provider,
        imageUrl,
        prompt: scene.motionStyle ?? scene.visualPrompt,
        duration: scene.durationSeconds,
        audioPrompt: scene.audioPrompt,
      });
    } else {
      // Standard / Premium: text-to-video
      return await falTextToVideo({
        model: qualityConfig.provider,
        prompt: scene.visualPrompt,
        duration: scene.durationSeconds,
      });
    }
  } catch (primaryError) {
    console.warn(`Primary provider ${qualityConfig.provider} failed, trying fallback ${qualityConfig.fallback}`);

    try {
      return await falTextToVideo({
        model: qualityConfig.fallback,
        prompt: scene.visualPrompt,
        duration: scene.durationSeconds,
      });
    } catch (fallbackError) {
      console.warn(`Fallback provider also failed, using Pexels stock footage`);
      return await getPexelsStockClip(scene.visualPrompt);
    }
  }
}
