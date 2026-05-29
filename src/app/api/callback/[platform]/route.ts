import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
import { upsertSocialAccount } from "@/lib/social/token-store";
import * as tiktok from "@/lib/oauth/tiktok";
import * as instagram from "@/lib/oauth/instagram";
import * as youtube from "@/lib/oauth/youtube";
import type { OAuthStateCookie } from "@/lib/oauth/base";
import type { SocialPlatform } from "@/types/social-account";

const VALID_PLATFORMS: SocialPlatform[] = ["tiktok", "instagram", "youtube"];

function failRedirect(req: NextRequest, code: string) {
  return NextResponse.redirect(
    new URL(`/settings/connections?error=${encodeURIComponent(code)}`, req.url)
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const { platform: rawPlatform } = await params;
  const platform = rawPlatform as SocialPlatform;

  if (!VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return failRedirect(req, "app_url_missing");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // Platform returned an error (e.g. user denied, access_denied)
  if (errorParam) {
    return failRedirect(req, errorParam);
  }

  if (!code || !returnedState) return failRedirect(req, "missing_code_or_state");

  // Read cookie via next/headers — consistent with how we wrote it
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(`oauth_state_${platform}`)?.value;

  if (!rawCookie) return failRedirect(req, "session_expired");

  let cookiePayload: OAuthStateCookie;
  try {
    cookiePayload = JSON.parse(decrypt(rawCookie)) as OAuthStateCookie;
  } catch {
    return failRedirect(req, "session_corrupted");
  }

  if (cookiePayload.state !== returnedState) return failRedirect(req, "state_mismatch");

  const redirectUri = `${appUrl}/api/callback/${platform}`;

  try {
    if (platform === "tiktok") {
      if (!cookiePayload.codeVerifier) return failRedirect(req, "missing_code_verifier");
      const tokens = await tiktok.exchangeCode(code, redirectUri, cookiePayload.codeVerifier);
      const userInfo = await tiktok.fetchUserInfo(tokens.accessToken);
      await upsertSocialAccount({
        userId,
        platform,
        platformUserId: userInfo.openId,
        username: userInfo.displayName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        scopes: tokens.scope.split(",").map((s) => s.trim()),
      });
    } else if (platform === "instagram") {
      const tokens = await instagram.exchangeCode(code, redirectUri);
      const userInfo = await instagram.fetchUserInfo(tokens.accessToken);
      await upsertSocialAccount({
        userId,
        platform,
        platformUserId: userInfo.id,
        username: userInfo.username,
        accessToken: tokens.accessToken,
        refreshToken: null,
        expiresIn: tokens.expiresIn,
        scopes: ["instagram_business_basic", "instagram_business_content_publish"],
      });
    } else {
      const tokens = await youtube.exchangeCode(code, redirectUri);
      const userInfo = await youtube.fetchUserInfo(tokens.accessToken);
      await upsertSocialAccount({
        userId,
        platform,
        platformUserId: userInfo.sub,
        username: userInfo.name,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        scopes: ["https://www.googleapis.com/auth/youtube.upload"],
      });
    }

    // Clear state cookie
    cookieStore.delete(`oauth_state_${platform}`);

    return NextResponse.redirect(
      new URL(`/settings/connections?connected=${platform}`, req.url)
    );
  } catch (err) {
    console.error(`[OAuth callback] ${platform}:`, err instanceof Error ? err.message : err);
    return failRedirect(req, "token_exchange_failed");
  }
}
