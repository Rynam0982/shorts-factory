import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { decrypt } from "@/lib/crypto";
import { updateTokens } from "@/lib/social/token-store";
import * as tiktok from "@/lib/oauth/tiktok";
import * as instagram from "@/lib/oauth/instagram";
import * as youtube from "@/lib/oauth/youtube";
import type { SocialAccountDoc } from "@/types/social-account";

// Refresh tokens expiring within the next 30 minutes
const REFRESH_AHEAD_MS = 30 * 60 * 1000;

async function refreshOne(account: SocialAccountDoc): Promise<void> {
  const { userId, platform } = account;

  if (platform === "tiktok") {
    if (!account.refreshToken) throw new Error("no refresh token");
    const result = await tiktok.refreshTokens(decrypt(account.refreshToken));
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
  } else if (platform === "instagram") {
    const result = await instagram.refreshToken(decrypt(account.accessToken));
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
  } else if (platform === "youtube") {
    if (!account.refreshToken) throw new Error("no refresh token");
    const result = await youtube.refreshAccessToken(decrypt(account.refreshToken));
    await updateTokens(userId, platform, {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
  }
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader  = req.headers.get("authorization");
  // Reject if secret not configured or header doesn't match
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threshold = Timestamp.fromDate(new Date(Date.now() + REFRESH_AHEAD_MS));

  const snap = await adminDb
    .collection("social_accounts")
    .where("expiresAt", "<=", threshold)
    .get();

  if (snap.empty) {
    return NextResponse.json({ refreshed: 0 });
  }

  const results = await Promise.allSettled(
    snap.docs.map(async (doc) => {
      const account = { id: doc.id, ...doc.data() } as SocialAccountDoc;
      await refreshOne(account);
      return `${account.platform}:${account.userId}`;
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<string>).value);
  const failed    = results.filter((r) => r.status === "rejected").map((r)  => (r as PromiseRejectedResult).reason?.message ?? "unknown");

  console.log(`[cron/refresh-tokens] ✓ ${succeeded.length} refreshed, ✗ ${failed.length} failed`);
  if (failed.length) console.error("[cron/refresh-tokens] failures:", failed);

  return NextResponse.json({ refreshed: succeeded.length, failed: failed.length });
}
