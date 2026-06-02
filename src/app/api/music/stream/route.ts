import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MUSIC_MOODS } from "@/data/creation-config";
import { getPixabayKey } from "@/lib/api-clients";

// Simple in-memory cache: mood:search → track URL list (10 min TTL)
const urlCache = new Map<string, { urls: string[]; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse(null, { status: 401 });

  const mood   = req.nextUrl.searchParams.get("mood")   ?? "epic";
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const index  = parseInt(req.nextUrl.searchParams.get("index") ?? "0", 10);
  const key    = search ? `search:${search}` : `mood:${mood}`;

  // Resolve track URLs (cached)
  let urls: string[];
  const cached = urlCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    urls = cached.urls;
  } else {
    const moodConfig = MUSIC_MOODS.find(m => m.id === mood);
    const query = search || moodConfig?.query || mood;
    try {
      const apiKey = await getPixabayKey();
      const res = await fetch(
        `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&video_type=music&per_page=10`,
      );
      if (!res.ok) return new NextResponse(null, { status: 502 });
      const data = await res.json() as { hits: { videos: { medium: { url: string } } }[] };
      urls = (data.hits ?? [])
        .map(h => h.videos?.medium?.url)
        .filter(Boolean) as string[];
      urlCache.set(key, { urls, expiresAt: Date.now() + 10 * 60 * 1000 });
    } catch {
      return new NextResponse(null, { status: 500 });
    }
  }

  if (!urls.length) return new NextResponse(null, { status: 404 });

  const trackUrl = urls[index % urls.length];

  // Proxy the audio stream from Pixabay CDN → browser
  try {
    const upstream = await fetch(trackUrl);
    if (!upstream.ok) return new NextResponse(null, { status: 502 });

    const contentType = upstream.headers.get("content-type") ?? "video/mp4";
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type":  contentType,
        "Cache-Control": "public, max-age=3600",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
