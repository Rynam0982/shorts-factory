import { assembleVideo as ffmpegAssemble, extractBestFrame, mixSFXIntoAudio } from "../ffmpeg";
import { generateVoiceoverWithTimestamps, generateVoiceoverGoogle } from "../elevenlabs";
import { getPixabayTrack, getPixabaySFX } from "../pixabay";
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

  // Admin test jobs and free-plan jobs always use Google TTS (zero AI cost).
  const forceGoogleTTS = job.isAdminTest || job.planTier === "free";
  const useGoogleTTS   = (job.voiceProvider === "google" || forceGoogleTTS) &&
                         !!process.env.GOOGLE_CLOUD_TTS_API_KEY;

  if (useGoogleTTS) {
    const result = await generateVoiceoverGoogle({
      text: fullVoiceoverText,
      voiceName: job.voiceId ?? "fr-FR-Wavenet-D",
      languageCode: job.voiceLanguage ?? "fr-FR",
    });
    voiceoverPath = result.audioPath;
    wordTimestamps = result.wordTimestamps;
  } else if (!forceGoogleTTS) {
    // Paid plan: use ElevenLabs premium voices
    const voiceModel = job.videoQuality === "cinema" ? "multi" : "flash";
    const result = await generateVoiceoverWithTimestamps({
      text: fullVoiceoverText,
      voiceId: job.voiceId ?? undefined,
      model: voiceModel,
    });
    voiceoverPath = result.audioPath;
    wordTimestamps = result.wordTimestamps;
  } else {
    // Free / admin but no Google TTS key — fall back to ElevenLabs gracefully
    const result = await generateVoiceoverWithTimestamps({
      text: fullVoiceoverText,
      voiceId: job.voiceId ?? undefined,
      model: "flash",
    });
    voiceoverPath = result.audioPath;
    wordTimestamps = result.wordTimestamps;
  }

  // ── 2. Background music ───────────────────────────────────────────────────
  const bgmPath = await getPixabayTrack(job.musicMood ?? storyboard.suggestedMood);

  // ── 2b. SFX (optional — skip if intensity is "none") ─────────────────────
  let sfxMixedVoicePath = voiceoverPath;
  const sfxIntensity = job.sfxIntensity ?? "none";

  if (sfxIntensity !== "none") {
    try {
      const sfxVolMap: Record<string, number> = { subtle: 0.10, normal: 0.20, intense: 0.35 };
      const sfxVol = sfxVolMap[sfxIntensity] ?? 0.20;
      const sfxPath = await getPixabaySFX("transition");
      if (sfxPath) {
        const mixed = await mixSFXIntoAudio(voiceoverPath, sfxPath, sfxVol);
        if (mixed) sfxMixedVoicePath = mixed;
      }
    } catch (sfxErr) {
      console.warn("SFX step skipped:", sfxErr instanceof Error ? sfxErr.message : sfxErr);
    }
  }

  // ── 3. Assemble ───────────────────────────────────────────────────────────
  const outputPath = await ffmpegAssemble({
    scenePaths,
    bgmPath,
    voiceoverPath: sfxMixedVoicePath,
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
