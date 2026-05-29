import type { Timestamp } from "firebase-admin/firestore";
import type { Storyboard } from "./storyboard";

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

export interface CostBreakdown {
  claudeUsd: number;
  videoUsd: number;
  elevenLabsUsd: number;
  dalleUsd: number;
  sunoUsd: number;
  totalUsd: number;
  totalEur: number;
}

export interface PublishResult {
  ok: boolean;
  platformPostId?: string;
  error?: string;
}

export interface JobDoc {
  id: string;
  userId: string | null;
  userPrompt: string;
  templateId: string | null;
  status: JobStatus;
  creationMode: CreationMode;
  videoQuality: VideoQuality | null;
  videoProviderId: string | null;
  durationSeconds: number | null;
  storyboard: Storyboard | null;
  sceneOverrides: Record<string, unknown> | null;
  customAudioUrl: string | null;
  useSunoMusic: boolean;
  avatarId: string | null;
  finalVideoUrl: string | null;
  thumbnailUrl: string | null;
  estimatedCredits: number | null;
  actualCredits: number | null;
  reservationTxId: string | null;
  triggerRunId: string | null;
  errorMsg: string | null;
  isAdminTest: boolean;
  costBreakdown: CostBreakdown | null;
  platforms: ("youtube" | "tiktok" | "instagram")[];
  publishResults: Record<string, PublishResult> | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
