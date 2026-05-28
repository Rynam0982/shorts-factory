import { fal } from "@fal-ai/client";
import { configureFalClient } from "./api-clients";

const PROVIDER_MODELS: Record<string, string> = {
  hailuo:        "fal-ai/minimax/video-01",
  kling_standard:"fal-ai/kling-video/v2.1/standard",
  kling_pro:     "fal-ai/kling-video/v2.1/pro",
  wan:           "fal-ai/wan-i2v",
};

export async function falTextToVideo(params: {
  model: string;
  prompt: string;
  duration: number;
  audioEnabled?: boolean;
}): Promise<string> {
  await configureFalClient();

  const modelId = PROVIDER_MODELS[params.model] ?? params.model;

  const result = await fal.subscribe(modelId, {
    input: {
      prompt: params.prompt,
      duration: params.duration,
      aspect_ratio: "9:16",
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
}): Promise<string> {
  await configureFalClient();

  const modelId = PROVIDER_MODELS[params.model] ?? params.model;

  const result = await fal.subscribe(modelId, {
    input: {
      image_url: params.imageUrl,
      prompt: params.prompt,
      duration: params.duration,
      aspect_ratio: "9:16",
    },
    pollInterval: 5000,
    logs: false,
  });

  const output = result.data as { video?: { url: string }; url?: string };
  const url = output.video?.url ?? output.url;
  if (!url) throw new Error(`fal.ai i2v returned no video URL for model ${modelId}`);
  return url;
}
