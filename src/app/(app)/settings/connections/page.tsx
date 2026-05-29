import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSocialAccounts } from "@/lib/social/token-store";
import ConnectionsClient from "./connections-client";
import type { SocialPlatform } from "@/types/social-account";

export const metadata = { title: "Comptes connectés — ShortsFactory" };

export default async function ConnectionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const accounts = await getUserSocialAccounts(userId);

  type AccountInfo = { username: string; platformUserId: string; expiresAt: string };
  const accountMap: Partial<Record<SocialPlatform, AccountInfo>> = {};

  for (const a of accounts) {
    accountMap[a.platform] = {
      username: a.username,
      platformUserId: a.platformUserId,
      expiresAt: a.expiresAt.toDate().toISOString(),
    };
  }

  // Check which platform apps are configured server-side — never expose keys to client
  const configuredPlatforms: Record<SocialPlatform, boolean> = {
    tiktok:    !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
    instagram: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
    youtube:   !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET),
  };

  return <ConnectionsClient accounts={accountMap} configuredPlatforms={configuredPlatforms} />;
}
