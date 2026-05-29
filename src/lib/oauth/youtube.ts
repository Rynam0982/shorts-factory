const CLIENT_ID = (): string => {
  const v = process.env.YOUTUBE_CLIENT_ID;
  if (!v) throw new Error("YOUTUBE_CLIENT_ID not set");
  return v;
};
const CLIENT_SECRET = (): string => {
  const v = process.env.YOUTUBE_CLIENT_SECRET;
  if (!v) throw new Error("YOUTUBE_CLIENT_SECRET not set");
  return v;
};

// youtube.upload = permission d'upload, openid profile email = infos utilisateur
const SCOPE = "https://www.googleapis.com/auth/youtube.upload openid profile email";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // forces refresh_token to be issued on every authorization
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export interface YouTubeTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<YouTubeTokens> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID(),
    client_secret: CLIENT_SECRET(),
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(`YouTube token error: ${data.error_description ?? data.error}`);
  if (!data.refresh_token) throw new Error("YouTube did not return a refresh_token — ensure prompt=consent");

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID(),
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
  if (data.error) throw new Error(`YouTube refresh error: ${data.error_description ?? data.error}`);

  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export interface YouTubeUserInfo {
  sub: string;  // stable Google user ID
  name: string;
  email: string;
}

export async function fetchUserInfo(accessToken: string): Promise<YouTubeUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (data.error) {
    const msg = typeof data.error === "string"
      ? (data.error_description ?? data.error)
      : (data.error.message ?? JSON.stringify(data.error));
    throw new Error(`YouTube userinfo error: ${msg}`);
  }
  return { sub: data.sub, name: data.name ?? data.email ?? "YouTube User", email: data.email ?? "" };
}
