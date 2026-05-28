import { getElevenLabsClient } from "./api-clients";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import os from "os";

export async function generateVoiceover(params: {
  text: string;
  voiceId?: string;
  model?: "flash" | "multi";
}): Promise<string> {
  const client = await getElevenLabsClient();

  const modelId =
    params.model === "multi"
      ? "eleven_multilingual_v3"
      : "eleven_flash_v2_5";

  const voiceId = params.voiceId ?? "21m00Tcm4TlvDq8ikWAM"; // Rachel (default)

  const stream = await client.generate({
    voice: voiceId,
    model_id: modelId,
    text: params.text,
  });

  // Save to tmp file
  const tmpFile = path.join(os.tmpdir(), `voiceover_${Date.now()}.mp3`);
  const writeStream = fs.createWriteStream(tmpFile);

  await new Promise<void>((resolve, reject) => {
    const readable = stream as unknown as Readable;
    readable.pipe(writeStream);
    readable.on("end", resolve);
    readable.on("error", reject);
  });

  return tmpFile;
}
