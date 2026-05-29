// Instagram Business Login (Direct Instagram Login, launched July 2024)
// Requires Instagram Business or Creator account
// Scopes need app review approval for production use

const APP_ID = (): string => {
  const v = process.env.META_APP_ID;
  if (!v) throw new Error("META_APP_ID not set");
  return v;
};
const APP_SECRET = (): string => {
  const v = process.env.META_APP_SECRET;
  if (!v) throw new Error("META_APP_SECRET not set");
  return v;
};

const SCOPES = "instagram_business_basic,instagram_business_content_publish";
const AUTH_URL = "https://api.instagram.com/oauth/authorize";
const SHORT_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const LONG_TOKEN_URL = "https://graph.instagram.com/access_token";
const REFRESH_URL = "https://graph.instagram.com/refresh_access_token";
const USERINFO_URL = "https://graph.instagram.com/me";

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: APP_ID(),
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: "code",
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export interface InstagramTokens {
  accessToken: string;      // long-lived (60 days)
  refreshToken: null;       // Instagram doesn't issue a separate refresh_token; call refreshToken() instead
  expiresIn: number;
  userId: string;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<InstagramTokens> {
  // Step 1: short-lived token (valid ~1h)
  const body = new URLSearchParams({
    client_id: APP_ID(),
    client_secret: APP_SECRET(),
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const shortRes = await fetch(SHORT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const shortData = await shortRes.json();
  if (shortData.error_type) {
    throw new Error(`Instagram token error: ${shortData.error_message}`);
  }

  // Step 2: exchange for long-lived token (valid 60 days)
  const longParams = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: APP_SECRET(),
    access_token: shortData.access_token,
  });

  const longRes = await fetch(`${LONG_TOKEN_URL}?${longParams}`);
  const longData = await longRes.json();
  if (longData.error) throw new Error(`Instagram long token error: ${longData.error.message}`);

  return {
    accessToken: longData.access_token,
    refreshToken: null,
    expiresIn: longData.expires_in,
    userId: String(shortData.user_id),
  };
}

export async function refreshToken(
  accessToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: accessToken,
  });

  const res = await fetch(`${REFRESH_URL}?${params}`);
  const data = await res.json();
  if (data.error) throw new Error(`Instagram refresh error: ${data.error.message}`);

  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export interface InstagramUserInfo {
  id: string;
  username: string;
}

export async function fetchUserInfo(accessToken: string): Promise<InstagramUserInfo> {
  const params = new URLSearchParams({ fields: "id,username", access_token: accessToken });
  const res = await fetch(`${USERINFO_URL}?${params}`);
  const data = await res.json();
  if (data.error) throw new Error(`Instagram userinfo error: ${data.error.message}`);
  return { id: data.id, username: data.username };
}
