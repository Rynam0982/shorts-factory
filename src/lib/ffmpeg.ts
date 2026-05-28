import ffmpeg from "fluent-ffmpeg";
import path from "path";
import os from "os";
import fs from "fs";
import type { Storyboard } from "@/types/storyboard";
import type { JobDoc } from "@/types/job";

export interface AssembleParams {
  scenePaths: string[];
  bgmPath: string;
  voiceoverPath: string;
  storyboard: Storyboard;
  job: JobDoc;
}

export async function assembleVideo(params: AssembleParams): Promise<string> {
  const { scenePaths, bgmPath, voiceoverPath, storyboard, job } = params;
  const outputPath = path.join(os.tmpdir(), `final_${job.id}_${Date.now()}.mp4`);

  // Step 1: Create concat list file
  const concatListPath = path.join(os.tmpdir(), `concat_${Date.now()}.txt`);
  const concatContent = scenePaths
    .map(p => `file '${p.replace(/'/g, "'\\''")}'`)
    .join("\n");
  fs.writeFileSync(concatListPath, concatContent);

  // Step 2: Concat scenes → merged video
  const mergedPath = path.join(os.tmpdir(), `merged_${Date.now()}.mp4`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions(["-f concat", "-safe 0"])
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-crf 23", "-preset fast", "-pix_fmt yuv420p"])
      .output(mergedPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });

  // Step 3: Mix BGM + voiceover
  const mixedAudioPath = path.join(os.tmpdir(), `audio_${Date.now()}.aac`);
  const hasBgm = fs.existsSync(bgmPath) && fs.statSync(bgmPath).size > 100;
  const hasVoice = fs.existsSync(voiceoverPath) && fs.statSync(voiceoverPath).size > 100;

  if (hasBgm && hasVoice) {
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(voiceoverPath)
        .input(bgmPath)
        .complexFilter([
          "[1:a]volume=0.2[bgm]",
          "[0:a][bgm]amix=inputs=2:duration=shortest[audio]",
        ])
        .map("[audio]")
        .audioCodec("aac")
        .output(mixedAudioPath)
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    });
  }

  // Step 4: Add subtitles (as burned-in captions)
  const captionStyle = (job as unknown as Record<string, string>).captionStyle ?? "bold_center";
  const subtitleFilter = buildSubtitleFilter(storyboard, captionStyle);

  const audioInput = hasBgm && hasVoice ? mixedAudioPath : (hasVoice ? voiceoverPath : null);

  await new Promise<void>((resolve, reject) => {
    const cmd = ffmpeg().input(mergedPath);
    if (audioInput) cmd.input(audioInput);

    cmd
      .videoFilter(subtitleFilter)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-crf 22", "-preset fast", "-pix_fmt yuv420p", "-movflags +faststart"])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });

  // Cleanup tmp files
  [concatListPath, mergedPath, mixedAudioPath].forEach(f => {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
  });

  return outputPath;
}

function buildSubtitleFilter(storyboard: Storyboard, style: string): string {
  const fontColor =
    style === "minimal" ? "white" : "white";
  const boxColor =
    style === "boxed" ? "0x00000088" : "0x00000000";
  const borderStyle = style === "boxed" ? 3 : 0;
  const fontSize = style === "minimal" ? 24 : 30;

  // Build ASS subtitle data for FFmpeg
  let timeOffset = 0;
  const events = storyboard.scenes
    .map(scene => {
      const start = formatTime(timeOffset);
      timeOffset += scene.durationSeconds;
      const end = formatTime(timeOffset);
      const text = (scene.captionText ?? scene.voiceoverText)
        .toUpperCase()
        .replace(/,/g, "\\N");
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
    })
    .join("\n");

  const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H88000000,-1,0,0,0,100,100,0,0,${borderStyle},2,0,2,10,10,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}`;

  const tmpAss = `/tmp/subs_${Date.now()}.ass`;
  require("fs").writeFileSync(tmpAss, assContent);

  void fontColor; void boxColor;
  return `ass=${tmpAss}`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "00")}`;
}

export async function extractBestFrame(videoPath: string): Promise<string> {
  const outputPath = path.join(os.tmpdir(), `thumb_${Date.now()}.jpg`);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({ timestamps: ["10%"], filename: path.basename(outputPath), folder: path.dirname(outputPath) })
      .on("end", () => resolve())
      .on("error", reject);
  });

  return outputPath;
}
