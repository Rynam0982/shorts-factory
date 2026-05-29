import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateState } from "@/lib/oauth/base";
import * as tiktok from "@/lib/oauth/tiktok";
import * as instagram from "@/lib/oauth/instagram";
import * as youtube from "@/lib/oauth/youtube";
import { encrypt } from "@/lib/crypto";
import type { SocialPlatform } from "@/types/social-account";

const VALID_PLATFORMS: SocialPlatform[] = ["tiktok", "instagram", "youtube"];

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
  if (!appUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL not configured" }, { status: 500 });
  }

  const redirectUri = `${appUrl}/api/callback/${platform}`;
  const state = generateState();

  let authUrl: string;
  let codeVerifier: string | undefined;

  try {
    if (platform === "tiktok") {
      const result = tiktok.buildAuthUrl(redirectUri, state);
      authUrl = result.authUrl;
      codeVerifier = result.codeVerifier;
    } else if (platform === "instagram") {
      authUrl = instagram.buildAuthUrl(redirectUri, state);
    } else {
      authUrl = youtube.buildAuthUrl(redirectUri, state);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Platform not configured";
    return NextResponse.redirect(
      new URL(`/settings/connections?error=${encodeURIComponent(msg)}`, req.url)
    );
  }

  // Store state + codeVerifier in an encrypted httpOnly cookie (10min TTL)
  const cookiePayload = JSON.stringify({ state, ...(codeVerifier && { codeVerifier }) });
  const encryptedCookie = encrypt(cookiePayload);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(`oauth_state_${platform}`, encryptedCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return res;
}
