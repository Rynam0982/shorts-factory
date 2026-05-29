import type { Timestamp } from "firebase-admin/firestore";

export type SocialPlatform = "tiktok" | "instagram" | "youtube";

export interface SocialAccountDoc {
  id: string;                 // "{userId}_{platform}"
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username: string;
  accessToken: string;        // AES-256-GCM encrypted
  refreshToken: string | null; // AES-256-GCM encrypted, null for Instagram
  expiresAt: Timestamp;
  scopes: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
