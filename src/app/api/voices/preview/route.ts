import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getElevenLabsClient } from "@/lib/api-clients";
import { Readable } from "stream";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const voiceId = req.nextUrl.searchParams.get("voiceId");
  const text = req.nextUrl.searchParams.get("text") ?? "Bonjour, voici un aperçu de ma voix.";

  if (!voiceId) return NextResponse.json({ error: "voiceId required" }, { status: 400 });

  try {
    const client = await getElevenLabsClient();
    const stream = await client.generate({
      voice: voiceId,
      model_id: "eleven_flash_v2_5",
      text: text.slice(0, 100), // max 100 chars pour preview 3s
    });

    const chunks: Buffer[] = [];
    const readable = stream as unknown as Readable;
    for await (const chunk of readable) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Voice preview error:", err);
    return NextResponse.json({ error: "Preview unavailable" }, { status: 500 });
  }
}
