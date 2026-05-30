import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPexelsKey } from "@/lib/api-clients";

// Server-side cache 30 min
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subject = req.nextUrl.searchParams.get("subject") ?? "";
  const style = req.nextUrl.searchParams.get("style") ?? "realistic";

  if (!subject.trim()) return NextResponse.json({ results: [] });

  const cacheKey = `${subject}:${style}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const apiKey = await getPexelsKey();

    // Style-aware query modifier
    const styleModifiers: Record<string, string> = {
      cinematic:  "cinematic film",
      anime:      "anime illustration",
      futuristic: "futuristic sci-fi",
      vintage:    "vintage retro film grain",
      nature:     "nature outdoor",
      graphic:    "graphic design",
      realistic:  "",
    };
    const modifier = styleModifiers[style] ?? "";
    const query = [subject, modifier].filter(Boolean).join(" ");

    const [photoRes, videoRes] = await Promise.all([
      fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
        { headers: { Authorization: apiKey } }
      ),
      fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=4&orientation=portrait`,
        { headers: { Authorization: apiKey } }
      ),
    ]);

    const photoData = photoRes.ok ? await photoRes.json() : { photos: [] };
    const videoData = videoRes.ok ? await videoRes.json() : { videos: [] };

    const results = [
      ...(photoData.photos ?? []).map((p: Record<string, unknown>) => ({
        type: "photo",
        url: (p.src as Record<string, string>)?.medium ?? "",
        thumbnail: (p.src as Record<string, string>)?.small ?? "",
        id: p.id,
      })),
      ...(videoData.videos ?? []).slice(0, 4).map((v: Record<string, unknown>) => {
        const files = (v.video_files as Record<string, unknown>[]) ?? [];
        const sd = files.find((f: Record<string, unknown>) => f.quality === "sd");
        const thumb = (v.image as string) ?? "";
        return {
          type: "video",
          url: (sd as Record<string, string>)?.link ?? "",
          thumbnail: thumb,
          id: v.id,
        };
      }),
    ].slice(0, 9);

    const data = { results };
    cache.set(cacheKey, { data, expiresAt: Date.now() + 30 * 60 * 1000 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Visual preview error:", err);
    return NextResponse.json({ results: [] });
  }
}
