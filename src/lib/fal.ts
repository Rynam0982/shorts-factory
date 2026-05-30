import { fal } from "@fal-ai/client";
import { configureFalClient } from "./api-clients";

const PROVIDER_MODELS: Record<string, string> = {
  hailuo:        "fal-ai/minimax/video-01",
  kling_standard:"fal-ai/kling-video/v2.1/standard",
  kling_pro:     "fal-ai/kling-video/v2.1/pro",
  wan:           "fal-ai/wan-i2v",
};

// Ratios supported per provider
const PROVIDER_RATIOS: Record<string, string[]> = {
  hailuo:         ["9:16", "16:9", "1:1", "4:3", "3:4", "2:3"],
  kling_standard: ["9:16", "16:9", "1:1"],
  kling_pro:      ["9:16", "16:9", "1:1"],
  wan:            ["9:16", "16:9", "1:1"],
};

function safeRatio(model: string, requested: string): string {
  const supported = PROVIDER_RATIOS[model];
  if (!supported || supported.includes(requested)) return requested;
  // Fallback to closest supported
  return supported[0] ?? "9:16";
}

export async function falTextToVideo(params: {
  model: string;
  prompt: string;
  duration: number;
  audioEnabled?: boolean;
  aspectRatio?: string;
  fps?: number;
}): Promise<string> {
  await configureFalClient();
  const modelId = PROVIDER_MODELS[params.model] ?? params.model;
  const ratio = safeRatio(params.model, params.aspectRatio ?? "9:16");

  const result = await fal.subscribe(modelId, {
    input: {
      prompt: params.prompt,
      duration: params.duration,
      aspect_ratio: ratio,
      ...(params.fps ? { frame_rate: params.fps } : {}),
    },
    pollInterval: 5000,
    logs: false,
  });

  const output = result.data as { video?: { url: string }; url?: string };
  const url = output.video?.url ?? output.url;
  if (!url) throw new Error(`fal.ai returned no video URL for model ${modelId}`);
  return url;
}

export async function falImageToVideo(params: {
  model: string;
  imageUrl: string;
  prompt: string;
  duration: number;
  audioPrompt?: string;
  aspectRatio?: string;
  fps?: number;
}): Promise<string> {
  await configureFalClient();
  const modelId = PROVIDER_MODELS[params.model] ?? params.model;
  const ratio = safeRatio(params.model, params.aspectRatio ?? "9:16");

  const result = await fal.subscribe(modelId, {
    input: {
      image_url: params.imageUrl,
      prompt: params.prompt,
      duration: params.duration,
      aspect_ratio: ratio,
      ...(params.fps ? { frame_rate: params.fps } : {}),
    },
    pollInterval: 5000,
    logs: false,
  });

  const output = result.data as { video?: { url: string }; url?: string };
  const url = output.video?.url ?? output.url;
  if (!url) throw new Error(`fal.ai i2v returned no video URL for model ${modelId}`);
  return url;
}
