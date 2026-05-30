import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MUSIC_MOODS } from "@/data/creation-config";
import { getPixabayKey } from "@/lib/api-clients";

// Cache 1h
const cache = new Map<string, { url: string; title: string; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mood = req.nextUrl.searchParams.get("mood") ?? "epic";

  const cached = cache.get(mood);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ url: cached.url, title: cached.title });
  }

  const moodConfig = MUSIC_MOODS.find(m => m.id === mood);
  const query = moodConfig?.query ?? mood;

  try {
    const apiKey = await getPixabayKey();
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&video_type=music&per_page=5`,
    );

    if (!res.ok) throw new Error("Pixabay API error");
    const data = await res.json() as { hits: { videos: { medium: { url: string } }; tags: string }[] };

    const hit = data.hits?.[0];
    if (!hit) return NextResponse.json({ url: null, title: null });

    const url = hit.videos?.medium?.url ?? null;
    const title = hit.tags ?? mood;

    if (url) {
      cache.set(mood, { url, title, expiresAt: Date.now() + 60 * 60 * 1000 });
    }

    return NextResponse.json({ url, title });
  } catch {
    return NextResponse.json({ url: null, title: null });
  }
}
