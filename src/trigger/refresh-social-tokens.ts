import { schedules } from "@trigger.dev/sdk/v3";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { decrypt } from "@/lib/crypto";
import { updateTokens } from "@/lib/social/token-store";
import * as tiktok from "@/lib/oauth/tiktok";
import * as instagram from "@/lib/oauth/instagram";
import * as youtube from "@/lib/oauth/youtube";
import type { SocialAccountDoc, SocialPlatform } from "@/types/social-account";

// Refresh tokens that expire within the next 30 minutes
const REFRESH_AHEAD_MS = 30 * 60 * 1000;

async function refreshAccount(account: SocialAccountDoc): Promise<void> {
  const { userId, platform } = account;

  if (platform === "tiktok") {
    if (!account.refreshToken) throw new Error("no refresh token");
    const rt = decrypt(account.refreshToken);
    const result = await tiktok.refreshTokens(rt);
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
  } else if (platform === "instagram") {
    // Instagram refreshes the access token itself (no separate refresh_token)
    const at = decrypt(account.accessToken);
    const result = await instagram.refreshToken(at);
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
  } else if (platform === "youtube") {
    if (!account.refreshToken) throw new Error("no refresh token");
    const rt = decrypt(account.refreshToken);
    const result = await youtube.refreshAccessToken(rt);
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
  }
}

export const refreshSocialTokensTask = schedules.task({
  id: "refresh-social-tokens",
  cron: "*/15 * * * *", // every 15 minutes
  run: async () => {
    const threshold = Timestamp.fromDate(new Date(Date.now() + REFRESH_AHEAD_MS));

    // All accounts expiring within the next 30 minutes
    const snap = await adminDb
      .collection("social_accounts")
      .where("expiresAt", "<=", threshold)
      .get();

    if (snap.empty) {
      console.log("[refresh-social-tokens] Nothing to refresh.");
      return;
    }

    console.log(`[refresh-social-tokens] Refreshing ${snap.docs.length} token(s)…`);

    const results = await Promise.allSettled(
      snap.docs.map(async (doc) => {
        const account = { id: doc.id, ...doc.data() } as SocialAccountDoc;
        await refreshAccount(account);
        console.log(`[refresh-social-tokens] ✓ ${account.platform} — user ${account.userId}`);
      })
    );

    const failed = results.filter((r) => r.status === "rejected");
    for (const f of failed) {
      console.error("[refresh-social-tokens] ✗ refresh failed:", (f as PromiseRejectedResult).reason);
    }
  },
});
