import { getPixabayKey } from "./api-clients";
import { adminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getPexelsStockClip } from "./pexels";
import fs from "fs";
import path from "path";
import os from "os";
import { MUSIC_MOODS } from "@/data/creation-config";
import type { ScoredMedia, SceneSimDebug } from "@/lib/content-intelligence/types";

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

// ── Pixabay video search (for RuleBasedContentProvider / free plan) ───────────

interface PixabayVideoVariant {
  url: string;
  width: number;
  height: number;
  thumbnail: string;
}

interface PixabayVideoHit {
  id: number;
  tags: string;
  duration: number;
  user_id: number;
  videos: {
    large: PixabayVideoVariant;
    medium: PixabayVideoVariant;
    small: PixabayVideoVariant;
    tiny: PixabayVideoVariant;
  };
}

interface PixabayVideoResponse {
  hits: PixabayVideoHit[];
}

export async function searchPixabayVideos(
  query: string,
  perPage = 10,
): Promise<PixabayVideoHit[]> {
  try {
    const apiKey = await getPixabayKey();
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${perPage}&video_type=film`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as PixabayVideoResponse;
    return data.hits ?? [];
  } catch {
    return [];
  }
}

function scoreVideo(
  hit: PixabayVideoHit,
  queryKeywords: string[],
  usedUserIds: Set<number>,
): ScoredMedia {
  const tags = hit.tags.toLowerCase();
  const kws  = queryKeywords.map(k => k.toLowerCase());

  // Relevance (40): keyword overlap with tags
  const matchCount = kws.filter(kw =>
    kw.split(" ").some(w => w.length > 2 && tags.includes(w)),
  ).length;
  const relevance = Math.round(Math.min(40, (matchCount / Math.max(1, kws.length)) * 40));

  // Orientation (25): prefer portrait videos
  const med = hit.videos.medium ?? hit.videos.small ?? hit.videos.tiny;
  const isVertical = med && med.height > med.width;
  const orientation = isVertical ? 25 : 8;

  // Quality (20): prefer large variant
  const quality = hit.videos.large?.url ? 20 : hit.videos.medium?.url ? 14 : 8;

  // Duration (10): 3–15 s is ideal for shorts
  const d = hit.duration;
  const duration = d >= 3 && d <= 15 ? 10 : d > 0 && d <= 30 ? 6 : 2;

  // Diversity (5): penalise repeated users
  const diversity = usedUserIds.has(hit.user_id) ? 0 : 5;

  const totalScore = relevance + orientation + quality + duration + diversity;
  const best = hit.videos.medium ?? hit.videos.small ?? hit.videos.tiny;

  return {
    pixabayId:     hit.id,
    url:           best?.url ?? "",
    thumbnailUrl:  best?.thumbnail ?? "",
    type:          "video",
    totalScore,
    breakdown:     { relevance, orientation, quality, duration, diversity },
    query:         queryKeywords.join(" "),
    tags:          hit.tags,
    width:         best?.width ?? 0,
    height:        best?.height ?? 0,
    durationSeconds: hit.duration,
  };
}

export interface PixabayClipResult {
  filePath: string;
  debugData: {
    queriesRan: string[];
    topResults: ScoredMedia[];
    selectedMedia: ScoredMedia | null;
  };
}

/**
 * Search Pixabay for a scene clip, score all results, download the best one.
 * Pass jobId + sceneIndex to have per-scene debug stored on the job document.
 */
export async function getPixabayVideoClip(
  keywords: string[],
  jobId?: string,
  sceneIndex?: number,
  voiceoverText = "",
  energy = "medium",
): Promise<string> {
  const queries = [
    keywords.slice(0, 2).join(" "),
    keywords[0] ?? "nature",
    keywords.slice(0, 3).join(" "),
  ].filter(Boolean).slice(0, 3);

  const seen     = new Set<number>();
  const allHits: PixabayVideoHit[] = [];

  for (const q of queries) {
    const hits = await searchPixabayVideos(q, 8);
    for (const hit of hits) {
      if (!seen.has(hit.id)) { seen.add(hit.id); allHits.push(hit); }
    }
  }

  const usedUserIds = new Set<number>();
  const scored = allHits
    .map(hit => ({ hit, media: scoreVideo(hit, keywords, usedUserIds) }))
    .sort((a, b) => b.media.totalScore - a.media.totalScore);

  const topResults    = scored.slice(0, 5).map(s => s.media);
  const selectedMedia = topResults[0] ?? null;

  // Persist scene debug if requested
  if (jobId !== undefined && sceneIndex !== undefined) {
    const sceneDebug: SceneSimDebug = {
      index:             sceneIndex,
      voiceoverText,
      primaryKeyword:    keywords[0] ?? "",
      secondaryKeywords: keywords.slice(1),
      emotion:           "neutre",
      energy,
      queriesRan:        queries,
      topResults,
      selectedMedia,
    };
    try {
      await adminDb.collection("jobs").doc(jobId).update({
        [`simulationDebug.sceneDebugs.scene_${sceneIndex}`]: sceneDebug,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch {} // non-blocking
  }

  if (!selectedMedia?.url) {
    return getPexelsStockClip(keywords.join(" "));
  }

  try {
    const videoRes = await fetch(selectedMedia.url);
    const buffer   = Buffer.from(await videoRes.arrayBuffer());
    const tmpFile  = path.join(os.tmpdir(), `pixabay_scene_${Date.now()}.mp4`);
    fs.writeFileSync(tmpFile, buffer);
    return tmpFile;
  } catch {
    return getPexelsStockClip(keywords.join(" "));
  }
}
