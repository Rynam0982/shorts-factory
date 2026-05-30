import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getElevenLabsClient } from "@/lib/api-clients";

// Cache 10 min
let elevenLabsCache: { voices: unknown[]; expiresAt: number } | null = null;

// Curated Google TTS voices (static list — doesn't require API call)
const GOOGLE_VOICES = [
  { voiceId: "fr-FR-Wavenet-A", name: "Amélie (FR, féminine)", language: "fr-FR", gender: "FEMALE", preview: null },
  { voiceId: "fr-FR-Wavenet-B", name: "Bastien (FR, masculin)", language: "fr-FR", gender: "MALE", preview: null },
  { voiceId: "fr-FR-Wavenet-C", name: "Chloé (FR, féminine)", language: "fr-FR", gender: "FEMALE", preview: null },
  { voiceId: "fr-FR-Wavenet-D", name: "David (FR, masculin)", language: "fr-FR", gender: "MALE", preview: null },
  { voiceId: "en-US-Wavenet-A", name: "Alex (EN, masculin)", language: "en-US", gender: "MALE", preview: null },
  { voiceId: "en-US-Wavenet-C", name: "Clara (EN, féminine)", language: "en-US", gender: "FEMALE", preview: null },
  { voiceId: "es-ES-Wavenet-A", name: "Isabel (ES, féminine)", language: "es-ES", gender: "FEMALE", preview: null },
  { voiceId: "de-DE-Wavenet-A", name: "Anna (DE, féminine)", language: "de-DE", gender: "FEMALE", preview: null },
];

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = req.nextUrl.searchParams.get("provider") ?? "elevenlabs";
  const language = req.nextUrl.searchParams.get("language") ?? "fr";

  if (provider === "google") {
    const filtered = language
      ? GOOGLE_VOICES.filter(v => v.language.startsWith(language))
      : GOOGLE_VOICES;
    return NextResponse.json({ voices: filtered });
  }

  // ElevenLabs
  if (elevenLabsCache && elevenLabsCache.expiresAt > Date.now()) {
    return NextResponse.json({ voices: elevenLabsCache.voices });
  }

  try {
    const client = await getElevenLabsClient();
    const response = await client.voices.getAll();
    const voices = (response.voices ?? []).map((v) => {
      const vAny = v as unknown as Record<string, unknown>;
      return {
        voiceId: vAny.voice_id,
        name: vAny.name,
        language: (vAny.labels as Record<string, string>)?.language ?? "en",
        gender: (vAny.labels as Record<string, string>)?.gender ?? "neutral",
        accent: (vAny.labels as Record<string, string>)?.accent ?? null,
        description: (vAny.labels as Record<string, string>)?.description ?? null,
        useCase: (vAny.labels as Record<string, string>)?.use_case ?? null,
        previewUrl: vAny.preview_url ?? null,
      };
    });

    elevenLabsCache = { voices, expiresAt: Date.now() + 10 * 60 * 1000 };
    return NextResponse.json({ voices });
  } catch {
    // ElevenLabs not configured — return static defaults
    return NextResponse.json({
      voices: [
        { voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", language: "en", gender: "female", previewUrl: null },
        { voiceId: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", language: "en", gender: "female", previewUrl: null },
        { voiceId: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", language: "en", gender: "male", previewUrl: null },
      ],
    });
  }
}
