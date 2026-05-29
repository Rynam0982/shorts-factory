import { generateCodeVerifier, generateCodeChallenge } from "./base";

const CLIENT_KEY = (): string => {
  const v = process.env.TIKTOK_CLIENT_KEY;
  if (!v) throw new Error("TIKTOK_CLIENT_KEY not set");
  return v;
};
const CLIENT_SECRET = (): string => {
  const v = process.env.TIKTOK_CLIENT_SECRET;
  if (!v) throw new Error("TIKTOK_CLIENT_SECRET not set");
  return v;
};

const SCOPES = "user.info.basic,video.upload,video.publish";
const AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USERINFO_URL = "https://open.tiktokapis.com/v2/user/info/";

export interface TikTokBuildResult {
  authUrl: string;
  codeVerifier: string;
}

export function buildAuthUrl(redirectUri: string, state: string): TikTokBuildResult {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_key: CLIENT_KEY(),
    response_type: "code",
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return { authUrl: `${AUTH_BASE}?${params}`, codeVerifier };
}

export interface TikTokTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  openId: string;
  scope: string;
}

export async function exchangeCode(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<TikTokTokens> {
  const body = new URLSearchParams({
    client_key: CLIENT_KEY(),
    client_secret: CLIENT_SECRET(),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(`TikTok token error: ${data.error_description ?? data.error}`);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    openId: data.open_id,
    scope: data.scope,
  };
}

export async function refreshTokens(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    client_key: CLIENT_KEY(),
    client_secret: CLIENT_SECRET(),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(`TikTok refresh error: ${data.error_description ?? data.error}`);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in,
  };
}

export interface TikTokUserInfo {
  openId: string;
  displayName: string;
}

export async function fetchUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const res = await fetch(`${USERINFO_URL}?fields=open_id,display_name`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (data.error?.code && data.error.code !== "ok") {
    throw new Error(`TikTok userinfo error: ${data.error.message}`);
  }

  return {
    openId: data.data.user.open_id,
    displayName: data.data.user.display_name,
  };
}
