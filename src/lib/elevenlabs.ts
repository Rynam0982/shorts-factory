import { getElevenLabsClient } from "./api-clients";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import os from "os";

export interface WordTimestamp {
  word: string;
  startTime: number; // seconds
  endTime: number;
}

export interface VoiceoverResult {
  audioPath: string;
  wordTimestamps: WordTimestamp[];
  durationSeconds: number;
}

export async function generateVoiceover(params: {
  text: string;
  voiceId?: string;
  model?: "flash" | "multi";
}): Promise<string> {
  const result = await generateVoiceoverWithTimestamps(params);
  return result.audioPath;
}

export async function generateVoiceoverWithTimestamps(params: {
  text: string;
  voiceId?: string;
  model?: "flash" | "multi";
}): Promise<VoiceoverResult> {
  const client = await getElevenLabsClient();

  const modelId =
    params.model === "multi"
      ? "eleven_multilingual_v3"
      : "eleven_flash_v2_5";

  const voiceId = params.voiceId ?? "21m00Tcm4TlvDq8ikWAM";

  // Use ElevenLabs with-timestamps endpoint for word-level timing
  try {
    const response = await client.textToSpeech.convertWithTimestamps(voiceId, {
      model_id: modelId,
      text: params.text,
      output_format: "mp3_44100_128",
    });

    const alignment = response.alignment;

    // Save audio
    const tmpFile = path.join(os.tmpdir(), `voiceover_${Date.now()}.mp3`);

    if (response.audio_base64) {
      fs.writeFileSync(tmpFile, Buffer.from(response.audio_base64, "base64"));
    } else {
      throw new Error("No audio data from ElevenLabs");
    }

    // Build word timestamps from character alignment
    const wordTimestamps: WordTimestamp[] = [];
    if (alignment?.characters && alignment.character_start_times_seconds && alignment.character_end_times_seconds) {
      const chars = alignment.characters;
      const starts = alignment.character_start_times_seconds;
      const ends = alignment.character_end_times_seconds;

      let wordStart = 0;
      let wordChars = "";
      let wordStartTime = starts[0] ?? 0;

      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === " " || i === chars.length - 1) {
          if (c !== " ") wordChars += c;
          if (wordChars.trim()) {
            wordTimestamps.push({
              word: wordChars.trim(),
              startTime: wordStartTime,
              endTime: ends[i] ?? ends[i - 1] ?? 0,
            });
          }
          wordChars = "";
          wordStart = i + 1;
          wordStartTime = starts[i + 1] ?? 0;
        } else {
          if (i === wordStart) wordStartTime = starts[i] ?? 0;
          wordChars += c;
        }
      }
    }

    const durationSeconds = alignment?.character_end_times_seconds
      ? (alignment.character_end_times_seconds[alignment.character_end_times_seconds.length - 1] ?? 0)
      : estimateDuration(params.text);

    return { audioPath: tmpFile, wordTimestamps, durationSeconds };
  } catch {
    // Fallback: generate without timestamps
    const stream = await client.generate({
      voice: voiceId,
      model_id: modelId,
      text: params.text,
    });

    const tmpFile = path.join(os.tmpdir(), `voiceover_${Date.now()}.mp3`);
    const writeStream = fs.createWriteStream(tmpFile);

    await new Promise<void>((resolve, reject) => {
      const readable = stream as unknown as Readable;
      readable.pipe(writeStream);
      readable.on("end", resolve);
      readable.on("error", reject);
    });

    const durationSeconds = estimateDuration(params.text);
    const wordTimestamps = estimateWordTimestamps(params.text, durationSeconds);

    return { audioPath: tmpFile, wordTimestamps, durationSeconds };
  }
}

// Google TTS (requires GOOGLE_CLOUD_TTS_API_KEY)
export async function generateVoiceoverGoogle(params: {
  text: string;
  voiceName: string;
  languageCode: string;
}): Promise<VoiceoverResult> {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey) throw new Error("MISSING_API_KEY:google_tts");

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: params.text },
        voice: { languageCode: params.languageCode, name: params.voiceName },
        audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
      }),
    }
  );

  if (!response.ok) throw new Error(`Google TTS error: ${response.status}`);
  const data = await response.json() as { audioContent: string };

  const tmpFile = path.join(os.tmpdir(), `voiceover_google_${Date.now()}.mp3`);
  fs.writeFileSync(tmpFile, Buffer.from(data.audioContent, "base64"));

  const durationSeconds = estimateDuration(params.text);
  const wordTimestamps = estimateWordTimestamps(params.text, durationSeconds);

  return { audioPath: tmpFile, wordTimestamps, durationSeconds };
}

// Helpers
function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return words / 2.5; // ~2.5 words/sec average
}

function estimateWordTimestamps(text: string, totalDuration: number): WordTimestamp[] {
  const words = text.trim().split(/\s+/);
  const timePerWord = totalDuration / words.length;
  return words.map((word, i) => ({
    word,
    startTime: i * timePerWord,
    endTime: (i + 1) * timePerWord,
  }));
}
