import type { Timestamp } from "firebase-admin/firestore";
import type { VideoQuality } from "./job";

export type SeriesFrequency = "daily" | "twice_weekly" | "three_weekly" | "weekly";
export type CaptionStyle =
  | "wordbyword"
  | "karaoke"
  | "bold_center"
  | "boxed"
  | "minimal";

export interface SeriesDoc {
  id: string;
  userId: string;
  name: string;
  avatarId: string | null;
  voiceId: string;
  templateId: string;
  topicPrompt: string;
  videoQuality: VideoQuality;
  videoDurationSeconds: number;
  frequency: SeriesFrequency;
  daysOfWeek: number[];
  timeOfDay: string;
  timezone: string;
  platforms: ("youtube" | "tiktok" | "instagram")[];
  captionStyle: CaptionStyle;
  useSunoMusic: boolean;
  isActive: boolean;
  lastRunAt: Timestamp | null;
  nextRunAt: Timestamp | null;
  totalVideosGenerated: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
