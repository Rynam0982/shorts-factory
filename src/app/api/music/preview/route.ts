import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MUSIC_MOODS } from "@/data/creation-config";
import { getPixabayKey } from "@/lib/api-clients";

interface Track { url: string; title: string }

// Cache 1h — stores up to 10 tracks per key
const cache = new Map<string, { tracks: Track[]; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mood = req.nextUrl.searchParams.get("mood") ?? "epic";
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const index = parseInt(req.nextUrl.searchParams.get("index") ?? "0", 10);
  const cacheKey = search ? `search:${search}` : `mood:${mood}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    const track = cached.tracks[index % cached.tracks.length] ?? cached.tracks[0];
    return NextResponse.json({ ...track, total: cached.tracks.length });
  }

  const moodConfig = MUSIC_MOODS.find(m => m.id === mood);
  const query = search || moodConfig?.query || mood;

  try {
    const apiKey = await getPixabayKey();
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&video_type=music&per_page=10`,
    );

    if (!res.ok) throw new Error("Pixabay API error");
    const data = await res.json() as { hits: { videos: { medium: { url: string } }; tags: string }[] };

    const tracks: Track[] = data.hits
      .map(h => ({ url: h.videos?.medium?.url ?? "", title: h.tags ?? query }))
      .filter(t => t.url);

    if (!tracks.length) return NextResponse.json({ url: null, title: null, total: 0 });

    cache.set(cacheKey, { tracks, expiresAt: Date.now() + 60 * 60 * 1000 });
    const track = tracks[index % tracks.length];
    return NextResponse.json({ ...track, total: tracks.length });
  } catch {
    return NextResponse.json({ url: null, title: null, total: 0 });
  }
}
