import ffmpeg from "fluent-ffmpeg";
import path from "path";
import os from "os";
import fs from "fs";
import type { Storyboard } from "@/types/storyboard";
import type { JobDoc, TransitionStyle } from "@/types/job";
import type { WordTimestamp } from "./elevenlabs";

export interface AssembleParams {
  scenePaths: string[];
  bgmPath: string;
  voiceoverPath: string;
  storyboard: Storyboard;
  job: JobDoc;
  wordTimestamps?: WordTimestamp[];
  audioVoiceBalance?: number; // 0-100, default 80
  audioMusicBalance?: number; // 0-100, default 20
  transitionStyle?: TransitionStyle;
  fps?: number;
}

export async function assembleVideo(params: AssembleParams): Promise<string> {
  const {
    scenePaths, bgmPath, voiceoverPath, storyboard, job,
    wordTimestamps = [],
    audioVoiceBalance = 80,
    audioMusicBalance = 20,
    transitionStyle = "cut",
    fps = 30,
  } = params;

  const outputPath = path.join(os.tmpdir(), `final_${job.id}_${Date.now()}.mp4`);
  const tmpFiles: string[] = [];

  try {
    // ── Step 1: Concat scenes (with transitions) ──────────────────────────
    const mergedPath = path.join(os.tmpdir(), `merged_${Date.now()}.mp4`);
    tmpFiles.push(mergedPath);

    if (transitionStyle === "cut" || scenePaths.length === 1) {
      // Simple concat
      const concatListPath = path.join(os.tmpdir(), `concat_${Date.now()}.txt`);
      tmpFiles.push(concatListPath);
      const concatContent = scenePaths
        .map(p => `file '${p.replace(/'/g, "'\\''")}'`)
        .join("\n");
      fs.writeFileSync(concatListPath, concatContent);

      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(concatListPath)
          .inputOptions(["-f concat", "-safe 0"])
          .videoCodec("libx264")
          .outputOptions([`-r ${fps}`, "-crf 23", "-preset fast", "-pix_fmt yuv420p", "-an"])
          .output(mergedPath)
          .on("end", () => resolve())
          .on("error", reject)
          .run();
      });
    } else {
      // Transitions via xfade filter
      await applyTransitions(scenePaths, mergedPath, transitionStyle, storyboard, fps);
    }

    // ── Step 2: Mix audio ────────────────────────────────────────────────
    const voiceVol = (audioVoiceBalance / 100).toFixed(2);
    const musicVol = (audioMusicBalance / 100).toFixed(2);

    const hasBgm = fs.existsSync(bgmPath) && fs.statSync(bgmPath).size > 100;
    const hasVoice = fs.existsSync(voiceoverPath) && fs.statSync(voiceoverPath).size > 100;

    let mixedAudioPath: string | null = null;

    if (hasBgm && hasVoice) {
      mixedAudioPath = path.join(os.tmpdir(), `audio_${Date.now()}.aac`);
      tmpFiles.push(mixedAudioPath);

      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(voiceoverPath)
          .input(bgmPath)
          .complexFilter([
            `[0:a]volume=${voiceVol}[voice]`,
            `[1:a]volume=${musicVol}[bgm]`,
            "[voice][bgm]amix=inputs=2:duration=shortest[audio]",
          ])
          .map("[audio]")
          .audioCodec("aac")
          .outputOptions(["-b:a 192k"])
          .output(mixedAudioPath!)
          .on("end", () => resolve())
          .on("error", reject)
          .run();
      });
    } else if (hasVoice) {
      mixedAudioPath = voiceoverPath;
    }

    // ── Step 3: Generate ASS subtitles ───────────────────────────────────
    const captionStyle = (job as unknown as Record<string, string>).captionStyle ?? "bold_center";
    let assPath: string | null = null;

    if (captionStyle !== "none" && storyboard.scenes.length > 0) {
      assPath = generateASSFile(storyboard, wordTimestamps, job, captionStyle);
      tmpFiles.push(assPath);
    }

    // ── Step 4: Final encode ─────────────────────────────────────────────
    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg().input(mergedPath);
      if (mixedAudioPath) cmd.input(mixedAudioPath);

      const vfilters: string[] = [];
      if (assPath) {
        // Escape backslashes for Windows compatibility
        const safePath = assPath.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
        vfilters.push(`ass=${safePath}`);
      }

      if (vfilters.length > 0) cmd.videoFilter(vfilters);
      cmd.videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          `-r ${fps}`,
          "-crf 22",
          "-preset fast",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    });

    return outputPath;
  } finally {
    // Cleanup temp files (except output)
    for (const f of tmpFiles) {
      try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
    }
  }
}

async function applyTransitions(
  scenePaths: string[],
  outputPath: string,
  style: TransitionStyle,
  storyboard: Storyboard,
  fps: number
): Promise<void> {
  const transitionDuration = 0.5; // seconds

  const xfadeMap: Record<string, string> = {
    fade:  "fade",
    zoom:  "zoomin",
    slide: "slideleft",
    flash: "fadewhite",
    cut:   "fade", // shouldn't reach here
  };
  const xfadeType = xfadeMap[style] ?? "fade";

  // Build complex filter for N clips
  if (scenePaths.length < 2) {
    // Single clip — just copy
    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg();
      cmd.input(scenePaths[0]).videoCodec("libx264").outputOptions([`-r ${fps}`, "-crf 23", "-an"]).output(outputPath)
        .on("end", () => resolve()).on("error", reject).run();
    });
    return;
  }

  // Build xfade chain: [0:v][1:v]xfade=...[v01]; [v01][2:v]xfade=...[v012]; etc.
  const filterParts: string[] = [];
  let prevLabel = "[0:v]";
  let timeOffset = storyboard.scenes[0]?.durationSeconds ?? 5;

  for (let i = 1; i < scenePaths.length; i++) {
    const outLabel = i < scenePaths.length - 1 ? `[v${i}]` : "[vout]";
    filterParts.push(
      `${prevLabel}[${i}:v]xfade=transition=${xfadeType}:duration=${transitionDuration}:offset=${timeOffset - transitionDuration}${outLabel}`
    );
    prevLabel = outLabel;
    timeOffset += (storyboard.scenes[i]?.durationSeconds ?? 5);
  }

  await new Promise<void>((resolve, reject) => {
    const cmd = ffmpeg();
    for (const p of scenePaths) cmd.input(p);

    cmd
      .complexFilter(filterParts)
      .map("[vout]")
      .videoCodec("libx264")
      .outputOptions([`-r ${fps}`, "-crf 23", "-pix_fmt yuv420p", "-an"])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

function generateASSFile(
  storyboard: Storyboard,
  wordTimestamps: WordTimestamp[],
  job: JobDoc,
  captionStyle: string
): string {
  const fontSizeMap: Record<string, number> = { small: 14, medium: 18, large: 22 };
  const alignMap: Record<string, number> = { top: 8, center: 5, bottom: 2 };

  const jobCast = job as unknown as Record<string, string | number | boolean>;
  const fontSize = fontSizeMap[(jobCast.captionFontSize as string) ?? "medium"] ?? 18;
  const alignment = alignMap[(jobCast.captionPosition as string) ?? "bottom"] ?? 2;
  const fontFamily = (jobCast.captionFontFamily as string) ?? "Arial Black";
  const highlightHex = (jobCast.captionHighlightColor as string) === "yellow" ? "&H00FFFF00" :
    (jobCast.captionHighlightColor as string) === "cyan" ? "&H00FFFF00" :
    (jobCast.captionHighlightColor as string) === "pink" ? "&H00FF4FC3" : "&H00FFFFFF";

  let styleStr = "";
  let events = "";

  if (captionStyle === "wordbyword" && wordTimestamps.length > 0) {
    styleStr = `Style: Default,${fontFamily},${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H88000000,-1,0,0,0,100,100,0,0,3,2,0,${alignment},10,10,40,1`;
    events = wordTimestamps
      .map(w => `Dialogue: 0,${fmtTime(w.startTime)},${fmtTime(w.endTime)},Default,,0,0,0,,${w.word}`)
      .join("\n");
  } else if (captionStyle === "karaoke" && wordTimestamps.length > 0) {
    styleStr = `Style: Default,${fontFamily},${fontSize},&H00FFFFFF,${highlightHex},&H00000000,&H88000000,-1,0,0,0,100,100,0,0,3,2,0,${alignment},10,10,40,1`;
    // Group into chunks of 4-5 words
    const WORDS_PER_LINE = 4;
    for (let i = 0; i < wordTimestamps.length; i += WORDS_PER_LINE) {
      const chunk = wordTimestamps.slice(i, i + WORDS_PER_LINE);
      const start = fmtTime(chunk[0]?.startTime ?? 0);
      const end = fmtTime(chunk[chunk.length - 1]?.endTime ?? 0);
      const kText = chunk
        .map(w => {
          const dcs = Math.round((w.endTime - w.startTime) * 100);
          return `{\\k${dcs}}${w.word}`;
        })
        .join(" ");
      events += `Dialogue: 0,${start},${end},Default,,0,0,0,,${kText}\n`;
    }
  } else {
    // bold_center, boxed, minimal — use scene-level voiceover text
    const borderStyle = captionStyle === "boxed" ? 4 : 3;
    const backColor = captionStyle === "boxed" ? "&H88000000" : "&H00000000";
    styleStr = `Style: Default,${fontFamily},${fontSize},&H00FFFFFF,&H000000FF,&H00000000,${backColor},-1,0,0,0,100,100,0,0,${borderStyle},2,0,${alignment},10,10,40,1`;

    let offset = 0;
    for (const scene of storyboard.scenes) {
      const start = fmtTime(offset);
      const end = fmtTime(offset + scene.durationSeconds);
      const text = scene.captionText ?? scene.voiceoverText;
      const wrapped = text.toUpperCase().replace(/(.{20})/g, "$1\\N").replace(/\\N$/, "");
      events += `Dialogue: 0,${start},${end},Default,,0,0,0,,${wrapped}\n`;
      offset += scene.durationSeconds;
    }
  }

  const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${styleStr}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events.trim()}`;

  const tmpFile = path.join(os.tmpdir(), `subs_${Date.now()}.ass`);
  fs.writeFileSync(tmpFile, assContent);
  return tmpFile;
}

function fmtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
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
