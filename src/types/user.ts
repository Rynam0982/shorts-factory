import type { Timestamp } from "firebase-admin/firestore";

export type UserPlan =
  | "free"
  | "starter_creator"
  | "creator_pro"
  | "studio"
  | "agency";

export type SubscriptionStatus =
  | "none"
  | "active"
  | "past_due"
  | "canceled";

export type UserRole = "user" | "admin";

export interface UserDoc {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  clerkUserId: string;
  stripeCustomerId: string | null;

  creditsBalance: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;

  plan: UserPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId: string | null;
  subscriptionPeriodEnd: Timestamp | null;
  monthlyResetAt: Timestamp | null;

  role: UserRole;
  isAdminTestMode: boolean;

  bannedAt: Timestamp | null;
  deletedAt: Timestamp | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
