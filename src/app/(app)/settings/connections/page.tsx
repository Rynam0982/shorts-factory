import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSocialAccounts } from "@/lib/social/token-store";
import ConnectionsClient from "./connections-client";
import type { SocialPlatform } from "@/types/social-account";

export const metadata = { title: "Comptes connectés — ShortsFactory" };

// Force dynamic so env var checks are fresh on every request (not cached at build time)
export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let accounts: Awaited<ReturnType<typeof getUserSocialAccounts>> = [];
  try {
    accounts = await getUserSocialAccounts(userId);
  } catch {}

  type AccountInfo = { username: string; platformUserId: string; expiresAt: string };
  const accountMap: Partial<Record<SocialPlatform, AccountInfo>> = {};

  for (const a of accounts) {
    try {
      accountMap[a.platform] = {
        username: a.username,
        platformUserId: a.platformUserId,
        expiresAt: a.expiresAt.toDate().toISOString(),
      };
    } catch {}
  }

  // Check which platform apps are configured server-side (never expose keys to client)
  const youtubeClientId     = process.env.YOUTUBE_CLIENT_ID;
  const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  const configuredPlatforms: Record<SocialPlatform, boolean> = {
    tiktok:    !!(process.env.TIKTOK_CLIENT_KEY    && process.env.TIKTOK_CLIENT_SECRET),
    instagram: !!(process.env.META_APP_ID          && process.env.META_APP_SECRET),
    youtube:   !!(youtubeClientId                  && youtubeClientSecret),
  };

  // Pass missing-var hints to the client for developer UX (value masked, just the name)
  const missingVars: Record<SocialPlatform, string[]> = {
    tiktok: [
      ...(!process.env.TIKTOK_CLIENT_KEY    ? ["TIKTOK_CLIENT_KEY"]    : []),
      ...(!process.env.TIKTOK_CLIENT_SECRET ? ["TIKTOK_CLIENT_SECRET"] : []),
    ],
    instagram: [
      ...(!process.env.META_APP_ID     ? ["META_APP_ID"]     : []),
      ...(!process.env.META_APP_SECRET ? ["META_APP_SECRET"] : []),
    ],
    youtube: [
      ...(!youtubeClientId     ? ["YOUTUBE_CLIENT_ID"]     : []),
      ...(!youtubeClientSecret ? ["YOUTUBE_CLIENT_SECRET"] : []),
    ],
  };

  return (
    <ConnectionsClient
      accounts={accountMap}
      configuredPlatforms={configuredPlatforms}
      missingVars={missingVars}
    />
  );
}
