import { assembleVideo as ffmpegAssemble, extractBestFrame } from "../ffmpeg";
import { generateVoiceoverWithTimestamps } from "../elevenlabs";
import { generateVoiceoverGoogle } from "../elevenlabs";
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

  const fullVoiceoverText = storyboard.scenes
    .map(s => s.voiceoverText)
    .join(" ");

  // ── 1. Generate voiceover ──────────────────────────────────────────────────
  let voiceoverPath: string;
  let wordTimestamps: import("../elevenlabs").WordTimestamp[] = [];

  if (job.voiceProvider === "google" && process.env.GOOGLE_CLOUD_TTS_API_KEY) {
    const result = await generateVoiceoverGoogle({
      text: fullVoiceoverText,
      voiceName: job.voiceId ?? "fr-FR-Wavenet-D",
      languageCode: job.voiceLanguage ?? "fr-FR",
    });
    voiceoverPath = result.audioPath;
    wordTimestamps = result.wordTimestamps;
  } else {
    // ElevenLabs (default)
    const voiceModel = job.videoQuality === "cinema" ? "multi" : "flash";
    const result = await generateVoiceoverWithTimestamps({
      text: fullVoiceoverText,
      voiceId: job.voiceId ?? undefined,
      model: voiceModel,
    });
    voiceoverPath = result.audioPath;
    wordTimestamps = result.wordTimestamps;
  }

  // ── 2. Background music ───────────────────────────────────────────────────
  const bgmPath = await getPixabayTrack(job.musicMood ?? storyboard.suggestedMood);

  // ── 3. Assemble ───────────────────────────────────────────────────────────
  const outputPath = await ffmpegAssemble({
    scenePaths,
    bgmPath,
    voiceoverPath,
    storyboard,
    job,
    wordTimestamps,
    audioVoiceBalance: job.audioVoiceBalance ?? 80,
    audioMusicBalance: job.audioMusicBalance ?? 20,
    transitionStyle: job.transitionStyle ?? "cut",
    fps: job.fps ?? 30,
  });

  // ── 4. Upload to R2 ───────────────────────────────────────────────────────
  const [finalVideoUrl, thumbnailUrl] = await Promise.all([
    uploadToR2(outputPath, `jobs/${job.id}/final.mp4`, "video/mp4"),
    extractBestFrame(outputPath).then(thumbPath =>
      uploadToR2(thumbPath, `jobs/${job.id}/thumbnail.jpg`, "image/jpeg")
    ),
  ]);

  return { finalVideoUrl, thumbnailUrl };
}
