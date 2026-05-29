import { getSocialAccount, updateTokens, decryptToken } from "./token-store";
import * as tiktok from "@/lib/oauth/tiktok";
import * as instagram from "@/lib/oauth/instagram";
import * as youtube from "@/lib/oauth/youtube";
import type { SocialPlatform } from "@/types/social-account";

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // refresh if < 5 minutes until expiry

export async function getValidToken(userId: string, platform: SocialPlatform): Promise<string> {
  const account = await getSocialAccount(userId, platform);
  if (!account) throw new Error(`No ${platform} account connected for user ${userId}`);

  const expiresAt = account.expiresAt.toDate();
  const needsRefresh = expiresAt.getTime() - Date.now() < REFRESH_THRESHOLD_MS;

  if (!needsRefresh) {
    return decryptToken(account.accessToken);
  }

  const refreshToken = account.refreshToken ? decryptToken(account.refreshToken) : null;

  if (platform === "tiktok") {
    if (!refreshToken) throw new Error("TikTok: no refresh token available");
    const result = await tiktok.refreshTokens(refreshToken);
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
    return result.accessToken;
  }

  if (platform === "instagram") {
    const currentToken = decryptToken(account.accessToken);
    const result = await instagram.refreshToken(currentToken);
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
    return result.accessToken;
  }

  if (platform === "youtube") {
    if (!refreshToken) throw new Error("YouTube: no refresh token available");
    const result = await youtube.refreshAccessToken(refreshToken);
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
    return result.accessToken;
  }

  throw new Error(`Unknown platform: ${platform}`);
}
