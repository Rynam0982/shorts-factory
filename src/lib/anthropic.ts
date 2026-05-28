import { getAnthropicClient } from "./api-clients";
import { StoryboardSchema, type Storyboard } from "@/types/storyboard";
import type { JobDoc } from "@/types/job";
import { TEMPLATES } from "@/data/templates";

export async function generateStoryboard(job: JobDoc): Promise<Storyboard> {
  const client = await getAnthropicClient();

  const template = TEMPLATES.find(t => t.id === job.templateId);
  const duration = job.durationSeconds ?? 30;
  const sceneCount = Math.min(6, Math.max(3, Math.floor(duration / 5)));

  const systemPrompt = template?.systemPromptOverride
    ? template.systemPromptOverride.replace("{subject}", job.userPrompt)
    : `Tu es un expert en création de vidéos virales pour TikTok, YouTube Shorts et Instagram Reels.
Génère un storyboard JSON pour une vidéo de ${duration}s (${sceneCount} scènes de ${Math.round(duration / sceneCount)}s chacune).
Sujet : "${job.userPrompt}"
Qualité : ${job.videoQuality}

Retourne UNIQUEMENT du JSON valide sans markdown, au format :
{
  "title": "...",
  "totalDurationSeconds": ${duration},
  "suggestedMood": "...",
  "thumbnailPrompt": "...",
  "scenes": [
    {
      "index": 0,
      "durationSeconds": ${Math.round(duration / sceneCount)},
      "visualPrompt": "description cinématographique de la scène en anglais",
      "motionStyle": "camera movement description",
      "audioPrompt": "ambient sound description",
      "voiceoverText": "texte de voix off en français (15 mots max)",
      "captionText": "TEXTE SOUS-TITRE"
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: systemPrompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip potential markdown code fences
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return StoryboardSchema.parse(parsed);
}
