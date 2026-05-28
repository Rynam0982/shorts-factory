import { getPexelsKey } from "./api-clients";
import fs from "fs";
import path from "path";
import os from "os";

export async function getPexelsStockClip(visualDescription: string): Promise<string> {
  const apiKey = await getPexelsKey();

  // Extract simple keywords from the description (take first 3 meaningful words)
  const keywords = visualDescription
    .replace(/[^a-zA-Z\s]/g, "")
    .split(" ")
    .filter(w => w.length > 3)
    .slice(0, 3)
    .join(" ");

  const query = keywords || "nature landscape";

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=5&size=small`,
    { headers: { Authorization: apiKey } }
  );

  if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
  const data = await res.json() as { videos: { video_files: { link: string; quality: string }[] }[] };

  const videos = data.videos;
  if (!videos?.length) throw new Error("No Pexels stock clips found");

  const pick = videos[Math.floor(Math.random() * Math.min(videos.length, 3))];
  const fileUrl = pick.video_files?.find(f => f.quality === "sd")?.link
    ?? pick.video_files?.[0]?.link;

  if (!fileUrl) throw new Error("No downloadable Pexels clip found");

  const videoRes = await fetch(fileUrl);
  const buffer = Buffer.from(await videoRes.arrayBuffer());
  const tmpFile = path.join(os.tmpdir(), `pexels_${Date.now()}.mp4`);
  fs.writeFileSync(tmpFile, buffer);

  return tmpFile;
}
