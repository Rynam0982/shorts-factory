import { getValidToken } from "./getValidToken";
import { getSocialAccount } from "./token-store";
import type { PublishResult } from "@/types/job";
import type { SocialPlatform } from "@/types/social-account";

export async function publishToTikTok(
  userId: string,
  videoUrl: string,
  title: string
): Promise<PublishResult> {
  try {
    const accessToken = await getValidToken(userId, "tiktok");

    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: title.substring(0, 150),
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    });

    const data = await res.json();
    if (data.error?.code && data.error.code !== "ok") {
      return { ok: false, error: data.error.message };
    }

    return { ok: true, platformPostId: data.data?.publish_id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function publishToInstagram(
  userId: string,
  videoUrl: string,
  caption: string
): Promise<PublishResult> {
  try {
    const accessToken = await getValidToken(userId, "instagram");
    const account = await getSocialAccount(userId, "instagram");
    if (!account) return { ok: false, error: "No Instagram account connected" };

    const igUserId = account.platformUserId;
    const apiBase = "https://graph.instagram.com/v21.0";

    // Step 1: create media container
    const containerRes = await fetch(
      `${apiBase}/${igUserId}/media?` +
        new URLSearchParams({
          media_type: "REELS",
          video_url: videoUrl,
          caption,
          access_token: accessToken,
        }),
      { method: "POST" }
    );

    const containerData = await containerRes.json();
    if (containerData.error) return { ok: false, error: containerData.error.message };

    const creationId: string = containerData.id;

    // Step 2: poll until container is FINISHED (max 90s)
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(
        `${apiBase}/${creationId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      if (statusData.status_code === "FINISHED") break;
      if (statusData.status_code === "ERROR") {
        return { ok: false, error: "Instagram container processing failed" };
      }
    }

    // Step 3: publish
    const publishRes = await fetch(
      `${apiBase}/${igUserId}/media_publish?` +
        new URLSearchParams({ creation_id: creationId, access_token: accessToken }),
      { method: "POST" }
    );

    const publishData = await publishRes.json();
    if (publishData.error) return { ok: false, error: publishData.error.message };

    return { ok: true, platformPostId: publishData.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function publishToYouTube(
  userId: string,
  videoUrl: string,
  title: string,
  description: string
): Promise<PublishResult> {
  try {
    const accessToken = await getValidToken(userId, "youtube");

    // Download video from R2
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Failed to fetch video from R2: ${videoRes.status}`);
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());

    const metadata = {
      snippet: {
        title: title.substring(0, 100),
        description,
        categoryId: "22", // People & Blogs
      },
      status: { privacyStatus: "public" },
    };

    const boundary = "sf_yt_upload_boundary";
    const metadataStr = JSON.stringify(metadata);

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`),
      Buffer.from(metadataStr),
      Buffer.from(`\r\n--${boundary}\r\nContent-Type: video/mp4\r\n\r\n`),
      videoBuffer,
      Buffer.from(`\r\n--${boundary}--`),
    ]);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    const uploadData = await uploadRes.json();
    if (uploadData.error) return { ok: false, error: uploadData.error.message };

    return { ok: true, platformPostId: uploadData.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

const publishers: Record<
  SocialPlatform,
  (userId: string, videoUrl: string, title: string) => Promise<PublishResult>
> = {
  tiktok: publishToTikTok,
  instagram: (u, v, t) => publishToInstagram(u, v, t),
  youtube: (u, v, t) => publishToYouTube(u, v, t, t),
};

export async function publishToAll(
  userId: string,
  platforms: SocialPlatform[],
  videoUrl: string,
  title: string
): Promise<Record<string, PublishResult>> {
  const results = await Promise.allSettled(
    platforms.map(async (p) => {
      const fn = publishers[p];
      if (!fn) return [p, { ok: false, error: "Unsupported platform" }] as const;
      const result = await fn(userId, videoUrl, title);
      return [p, result] as const;
    })
  );

  const out: Record<string, PublishResult> = {};
  for (const settled of results) {
    if (settled.status === "fulfilled") {
      const [platform, result] = settled.value;
      out[platform] = result;
    } else {
      // Should not reach here since each publisher catches internally
      const err = settled.reason;
      out["unknown"] = { ok: false, error: err?.message ?? "Unknown error" };
    }
  }
  return out;
}
