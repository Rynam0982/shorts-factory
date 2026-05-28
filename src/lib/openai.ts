import { getOpenAIClient } from "./api-clients";
import fs from "fs";
import path from "path";
import os from "os";

export async function generateDalleImage(prompt: string): Promise<string> {
  const client = await getOpenAIClient();

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: `Cinematic, photorealistic, vertical 9:16 composition. ${prompt}`,
    n: 1,
    size: "1024x1792",
    quality: "standard",
  });

  const url = response.data?.[0]?.url;
  if (!url) throw new Error("DALL-E returned no image URL");

  // Download and cache locally
  const imgResp = await fetch(url);
  const buffer = Buffer.from(await imgResp.arrayBuffer());
  const tmpFile = path.join(os.tmpdir(), `dalle_${Date.now()}.png`);
  fs.writeFileSync(tmpFile, buffer);

  return tmpFile;
}
