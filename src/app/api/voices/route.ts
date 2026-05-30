import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getElevenLabsClient } from "@/lib/api-clients";

interface ElevenLabsVoice {
  voiceId: string; name: string; language: string; gender: string;
  accent: string | null; description: string | null; useCase: string | null; previewUrl: string | null;
}

// Cache 10 min
let elevenLabsCache: { voices: ElevenLabsVoice[]; expiresAt: number } | null = null;

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
  const language = req.nextUrl.searchParams.get("language") ?? "";
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const gender = req.nextUrl.searchParams.get("gender") ?? "";

  if (provider === "google") {
    let filtered = [...GOOGLE_VOICES];
    if (language) filtered = filtered.filter(v => v.language.startsWith(language));
    if (gender) filtered = filtered.filter(v => v.gender.toLowerCase() === gender.toLowerCase());
    if (search) filtered = filtered.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
    return NextResponse.json({ voices: filtered });
  }

  function applyFilters(list: ElevenLabsVoice[]) {
    let out = list;
    if (language) out = out.filter(v => v.language?.toLowerCase().startsWith(language.toLowerCase()));
    if (gender) out = out.filter(v => v.gender?.toLowerCase() === gender.toLowerCase());
    if (search) out = out.filter(v => v.name?.toLowerCase().includes(search.toLowerCase()));
    return out;
  }

  // ElevenLabs
  if (elevenLabsCache && elevenLabsCache.expiresAt > Date.now()) {
    return NextResponse.json({ voices: applyFilters(elevenLabsCache.voices) });
  }

  try {
    const client = await getElevenLabsClient();
    const response = await client.voices.getAll();
    const voices: ElevenLabsVoice[] = (response.voices ?? []).map((v) => {
      const vAny = v as unknown as Record<string, unknown>;
      return {
        voiceId: String(vAny.voice_id ?? ""),
        name: String(vAny.name ?? ""),
        language: (vAny.labels as Record<string, string>)?.language ?? "en",
        gender: (vAny.labels as Record<string, string>)?.gender ?? "neutral",
        accent: (vAny.labels as Record<string, string>)?.accent ?? null,
        description: (vAny.labels as Record<string, string>)?.description ?? null,
        useCase: (vAny.labels as Record<string, string>)?.use_case ?? null,
        previewUrl: String(vAny.preview_url ?? "") || null,
      };
    });

    elevenLabsCache = { voices, expiresAt: Date.now() + 10 * 60 * 1000 };
    return NextResponse.json({ voices: applyFilters(voices) });
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
