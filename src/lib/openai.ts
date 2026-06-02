import { getOpenAIClient } from "./api-clients";

/**
 * Generates an image with DALL-E 3 and returns the temporary CDN URL directly.
 * The URL expires after ~1h (OpenAI policy), which is fine for same-pipeline use.
 */
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

  // Return the URL directly — Fal.ai accepts remote URLs.
  // No local download needed and no temp file to clean up.
  return url;
}
