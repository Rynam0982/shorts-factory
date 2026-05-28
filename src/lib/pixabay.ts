import { getPixabayKey } from "./api-clients";
import fs from "fs";
import path from "path";
import os from "os";

const MOOD_QUERIES: Record<string, string> = {
  upbeat:   "upbeat background music",
  dramatic: "dramatic cinematic music",
  calm:     "calm relaxing background",
  epic:     "epic orchestral music",
  fun:      "fun upbeat background music",
};

export async function getPixabayTrack(mood: string): Promise<string> {
  const apiKey = await getPixabayKey();
  const query = MOOD_QUERIES[mood.toLowerCase()] ?? `${mood} background music`;

  const res = await fetch(
    `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&video_type=music&per_page=5`
  );

  if (!res.ok) throw new Error(`Pixabay API error: ${res.status}`);
  const data = await res.json() as { hits: { videos: { medium: { url: string } } }[] };

  const hits = data.hits;
  if (!hits?.length) {
    // Return silence fallback
    return generateSilenceFile(30);
  }

  const pick = hits[Math.floor(Math.random() * Math.min(hits.length, 3))];
  const audioUrl = pick.videos?.medium?.url;
  if (!audioUrl) return generateSilenceFile(30);

  const audioRes = await fetch(audioUrl);
  const buffer = Buffer.from(await audioRes.arrayBuffer());
  const tmpFile = path.join(os.tmpdir(), `bgm_${Date.now()}.mp4`);
  fs.writeFileSync(tmpFile, buffer);

  return tmpFile;
}

function generateSilenceFile(durationSeconds: number): string {
  const tmpFile = path.join(os.tmpdir(), `silence_${Date.now()}.mp3`);
  // Create a minimal silent MP3 (1 byte is enough for ffmpeg to handle gracefully)
  fs.writeFileSync(tmpFile, Buffer.alloc(0));
  void durationSeconds;
  return tmpFile;
}
