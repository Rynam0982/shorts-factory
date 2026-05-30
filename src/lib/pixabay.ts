import { getPixabayKey } from "./api-clients";
import fs from "fs";
import path from "path";
import os from "os";
import { MUSIC_MOODS } from "@/data/creation-config";

// ── Background Music ─────────────────────────────────────────────────────────

export async function getPixabayTrack(mood: string): Promise<string> {
  const moodConfig = MUSIC_MOODS.find(m => m.id === mood);
  const query = moodConfig?.query ?? `${mood} background music`;

  try {
    const apiKey = await getPixabayKey();
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&video_type=music&per_page=5`
    );

    if (!res.ok) throw new Error(`Pixabay API error: ${res.status}`);
    const data = await res.json() as { hits: { videos: { medium: { url: string } }; tags: string }[] };

    const hits = data.hits ?? [];
    if (!hits.length) return generateSilenceFile();

    const pick = hits[Math.floor(Math.random() * Math.min(hits.length, 3))];
    const audioUrl = pick.videos?.medium?.url;
    if (!audioUrl) return generateSilenceFile();

    const audioRes = await fetch(audioUrl);
    const buffer = Buffer.from(await audioRes.arrayBuffer());
    const tmpFile = path.join(os.tmpdir(), `bgm_${Date.now()}.mp4`);
    fs.writeFileSync(tmpFile, buffer);
    return tmpFile;
  } catch {
    return generateSilenceFile();
  }
}

// ── Sound Effects ─────────────────────────────────────────────────────────────
// Pixabay SFX categories mapped to search queries
const SFX_QUERIES: Record<string, string> = {
  transition:   "whoosh swoosh transition",
  impact:       "impact hit dramatic",
  reveal:       "reveal sparkle magic",
  ambient:      "crowd ambiance nature",
  notification: "ping notification alert",
};

export async function getPixabaySFX(category: string): Promise<string | null> {
  const query = SFX_QUERIES[category] ?? category;

  try {
    const apiKey = await getPixabayKey();
    // Pixabay uses their music endpoint for short sound clips too
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&video_type=music&per_page=3`
    );

    if (!res.ok) return null;
    const data = await res.json() as { hits: { videos: { tiny: { url: string } } }[] };
    const hit = data.hits?.[0];
    if (!hit) return null;

    const url = hit.videos?.tiny?.url;
    if (!url) return null;

    const audioRes = await fetch(url);
    const buffer = Buffer.from(await audioRes.arrayBuffer());
    const tmpFile = path.join(os.tmpdir(), `sfx_${category}_${Date.now()}.mp4`);
    fs.writeFileSync(tmpFile, buffer);
    return tmpFile;
  } catch {
    return null; // SFX is optional — graceful degradation
  }
}

// ── Silence fallback ──────────────────────────────────────────────────────────
function generateSilenceFile(): string {
  const tmpFile = path.join(os.tmpdir(), `silence_${Date.now()}.mp3`);
  fs.writeFileSync(tmpFile, Buffer.alloc(0));
  return tmpFile;
}

// ── Visual preview (already in pexels.ts, re-export for convenience) ──────────
export async function getVisualPreview(
  subject: string,
  style: string
): Promise<{ url: string; thumbnail: string; type: "photo" | "video" }[]> {
  // Delegated to /api/visual-preview route which handles this
  // This function is here for potential server-side pipeline use
  return [];
}
