import { assembleVideo as ffmpegAssemble, extractBestFrame } from "../ffmpeg";
import { generateVoiceover } from "../elevenlabs";
import { getPixabayTrack } from "../pixabay";
import { uploadToR2 } from "../r2";
import type { Storyboard } from "@/types/storyboard";
import type { JobDoc } from "@/types/job";

export async function assembleFullVideo(params: {
  scenePaths: string[];
  storyboard: Storyboard;
  job: JobDoc;
}): Promise<{ finalVideoUrl: string; thumbnailUrl: string }> {
  const { scenePaths, storyboard, job } = params;

  // Merge voiceover text from all scenes
  const fullVoiceoverText = storyboard.scenes
    .map(s => s.voiceoverText)
    .join(" ");

  // Generate voiceover
  const voiceModel = job.videoQuality === "cinema" ? "multi" : "flash";
  const voiceoverPath = await generateVoiceover({
    text: fullVoiceoverText,
    model: voiceModel,
  });

  // Get background music
  const bgmPath = await getPixabayTrack(storyboard.suggestedMood);

  // Assemble
  const jobData = job as unknown as Record<string, unknown>;
  const outputPath = await ffmpegAssemble({
    scenePaths,
    bgmPath,
    voiceoverPath,
    storyboard,
    job,
  });

  // Upload to R2
  const [finalVideoUrl, thumbnailUrl] = await Promise.all([
    uploadToR2(outputPath, `jobs/${job.id}/final.mp4`, "video/mp4"),
    extractBestFrame(outputPath).then(thumbPath =>
      uploadToR2(thumbPath, `jobs/${job.id}/thumbnail.jpg`, "image/jpeg")
    ),
  ]);

  return { finalVideoUrl, thumbnailUrl };
}
