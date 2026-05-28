import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { estimateJobCost } from "@/lib/pricing";
import { z } from "zod";

const EstimateSchema = z.object({
  videoQuality: z.enum(["standard", "premium", "cinema"]),
  durationSeconds: z.number().min(10).max(120),
  ttsProvider: z.enum(["elevenlabs_flash", "elevenlabs_multi"]).default("elevenlabs_flash"),
  voiceoverCharacters: z.number().min(0).default(500),
  generateImages: z.boolean().default(false),
  sceneCount: z.number().min(1).max(12).default(6),
  useSunoMusic: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const options = EstimateSchema.parse(body);

    const result = await estimateJobCost({
      creationMode: "FULL_AUTO",
      ...options,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
