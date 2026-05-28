import type { Timestamp } from "firebase-admin/firestore";
import type { UserPlan } from "./user";
import type { VideoQuality } from "./job";

export interface VideoQualityConfig {
  provider: string;
  fallback: string;
  label: string;
  description: string;
  perSecondCostUsd: number;
  perSecondCredits: number;
}

export interface FixedCosts {
  storyboardCredits: number;
  dalleImageCredits: number;
  elevenlabsFlashPer1kChars: number;
  elevenlabsMultiPer1kChars: number;
  sunoMusicCredits: number;
  importClipCredits: number;
  uploadPublishCredits: number;
}

export interface PlanConfig {
  monthlyCredits: number;
  priceEur: number;
  autoSeriesMax: number;
  autoVideosPerSeriesPerWeek: number;
  autoMaxDurationSeconds: number;
  studioCreditsBonus: number;
  allowedQualities: VideoQuality[];
  maxConcurrentJobs: number;
  dailyJobsLimit: number;
  voiceCloning: boolean;
  sunoMusic: boolean;
  multiLanguage: boolean;
  avatarAI: boolean;
  trendingSuggestions: boolean;
  thumbnailAI: boolean;
  priorityQueue: boolean;
  teamSeats: number;
  stripePriceIdEnv: string | null;
}

export interface CreditPack {
  id: string;
  credits: number;
  priceEur: number;
  stripePriceIdEnv: string;
}

export interface PricingConfigDoc {
  videoQualities: Record<VideoQuality, VideoQualityConfig>;
  fixedCosts: FixedCosts;
  plans: Record<UserPlan, PlanConfig>;
  creditPacks: CreditPack[];
  creditExpiration: {
    packExpiresDays: number | null;
    subscriptionCarryOverCap: number;
  };
  updatedAt: Timestamp;
  updatedBy: string;
}

