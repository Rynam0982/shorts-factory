import type { Timestamp } from "firebase-admin/firestore";
import type { Storyboard } from "./storyboard";
import type { SimulationDebug } from "@/lib/content-intelligence/types";

export type JobStatus =
  | "QUEUED"
  | "PROCESSING_STORYBOARD"
  | "GENERATING_SCENES"
  | "ASSEMBLING"
  | "READY"
  | "PUBLISHING"
  | "DONE"
  | "FAILED";

export type CreationMode =
  | "FULL_AUTO"
  | "MANUAL_SCRIPT"
  | "IMPORT_CLIP"
  | "UPLOAD_PUBLISH";

export type VideoQuality = "standard" | "premium" | "cinema";

export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:3" | "3:4" | "2:3";
export type VisualStyle = "realistic" | "cinematic" | "anime" | "futuristic" | "vintage" | "nature" | "graphic";
export type LightingTone = "dramatic" | "sunny" | "dark" | "neutral" | "warm" | "cold";
export type CameraMovement = "static" | "slow_zoom" | "pan" | "dolly" | "dynamic";
export type TransitionStyle = "cut" | "fade" | "zoom" | "slide" | "flash";
export type VoiceProvider = "elevenlabs" | "google";
export type SFXIntensity = "none" | "subtle" | "normal" | "intense";
export type CaptionStyle = "wordbyword" | "karaoke" | "bold_center" | "boxed" | "minimal" | "none";
export type CaptionFontSize = "small" | "medium" | "large";
export type CaptionPosition = "top" | "center" | "bottom";

export interface PublishResult {
  ok: boolean;
  platformPostId?: string;
  publishedUrl?: string;
  error?: string;
}

export interface CostBreakdown {
  claudeUsd: number;
  videoUsd: number;
  elevenLabsUsd: number;
  dalleUsd: number;
  sunoUsd: number;
  totalUsd: number;
  totalEur: number;
}

export interface JobDoc {
  id: string;
  userId: string | null;
  userPrompt: string;
  templateId: string | null;
  status: JobStatus;
  creationMode: CreationMode;

  // Video
  videoQuality: VideoQuality | null;
  videoProviderId: string | null;
  durationSeconds: number | null;
  aspectRatio: AspectRatio;
  fps: 24 | 30 | 60;

  // Visual style
  visualStyle: VisualStyle | null;
  lightingTone: LightingTone | null;
  cameraMovement: CameraMovement | null;

  // Reference
  customReferenceImageUrl: string | null;

  // Audio
  voiceProvider: VoiceProvider;
  voiceId: string | null;
  voiceLanguage: string;
  musicMood: string | null;
  musicUrl: string | null;
  sfxIntensity: SFXIntensity;
  audioVoiceBalance: number;   // 0-100, default 80
  audioMusicBalance: number;   // 0-100, default 20

  // Captions
  captionStyle: CaptionStyle;
  captionFontFamily: string;
  captionFontSize: CaptionFontSize;
  captionPosition: CaptionPosition;
  captionHighlightColor: string;
  captionAutoEmoji: boolean;

  // Transitions
  transitionStyle: TransitionStyle;

  // Legacy / shared
  storyboard: Storyboard | null;
  sceneOverrides: Record<string, unknown> | null;
  customAudioUrl: string | null;
  useSunoMusic: boolean;
  avatarId: string | null;
  platforms: string[];
  finalVideoUrl: string | null;
  thumbnailUrl: string | null;
  estimatedCredits: number | null;
  actualCredits: number | null;
  reservationTxId: string | null;
  triggerRunId: string | null;
  errorMsg: string | null;
  isAdminTest: boolean;
  /** "free" → RuleBasedContentProvider; "paid" → ClaudeContentProvider */
  planTier: "free" | "paid" | null;
  /** Which provider was used to generate the storyboard */
  contentProvider: "claude" | "rule-based" | null;
  /** Debug data produced by the RuleBasedContentProvider (null for paid jobs) */
  simulationDebug: SimulationDebug | null;
  costBreakdown: CostBreakdown | null;
  publishResults: Record<string, PublishResult> | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
