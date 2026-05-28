import { adminDb } from "./firebase-admin";
import type { PricingConfigDoc } from "@/types/pricing";
import type { VideoQuality } from "@/types/job";

let cachedConfig: PricingConfigDoc | null = null;
let cacheExpiresAt = 0;

export async function getPricingConfig(): Promise<PricingConfigDoc> {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiresAt) return cachedConfig;

  const doc = await adminDb.collection("pricing_config").doc("current").get();
  if (!doc.exists) throw new Error("pricing_config/current not found");

  cachedConfig = doc.data() as PricingConfigDoc;
  cacheExpiresAt = now + 60_000;
  return cachedConfig;
}

export function invalidatePricingCache() {
  cachedConfig = null;
  cacheExpiresAt = 0;
}

export interface EstimateOptions {
  creationMode: string;
  videoQuality: VideoQuality;
  durationSeconds: number;
  ttsProvider: "elevenlabs_flash" | "elevenlabs_multi";
  voiceoverCharacters: number;
  generateImages: boolean;
  sceneCount: number;
  useSunoMusic: boolean;
}

export interface EstimateResult {
  totalCredits: number;
  breakdown: Record<string, number>;
}

export async function estimateJobCost(
  options: EstimateOptions
): Promise<EstimateResult> {
  const config = await getPricingConfig();
  const qualityConfig = config.videoQualities[options.videoQuality];
  const fixed = config.fixedCosts;

  const breakdown: Record<string, number> = {};

  // Video generation cost
  const videoCredits =
    options.durationSeconds * qualityConfig.perSecondCredits;
  breakdown.video = videoCredits;

  // ElevenLabs TTS
  const ttsRatePerChar =
    options.ttsProvider === "elevenlabs_flash"
      ? fixed.elevenlabsFlashPer1kChars / 1000
      : fixed.elevenlabsMultiPer1kChars / 1000;
  const ttsCredits = Math.ceil(options.voiceoverCharacters * ttsRatePerChar);
  breakdown.tts = ttsCredits;

  // Claude storyboard
  breakdown.storyboard = fixed.storyboardCredits;

  // DALL-E images (Cinema mode only)
  if (options.generateImages) {
    breakdown.dalle = options.sceneCount * fixed.dalleImageCredits;
  }

  // Suno music
  if (options.useSunoMusic) {
    breakdown.suno = fixed.sunoMusicCredits;
  }

  const totalCredits = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { totalCredits, breakdown };
}
