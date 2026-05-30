import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Static fallback suggestions per niche (used when Google Trends unavailable)
const STATIC_SUGGESTIONS: Record<string, string[]> = {
  science:   ["L'univers observable en chiffres", "Les animaux qui ne dorment jamais", "Ce que l'ADN révèle sur l'histoire humaine", "Les propriétés inexpliquées de l'eau", "Les maladies que l'on vient d'éradiquer"],
  histoire:  ["Les secrets de la bibliothèque d'Alexandrie", "L'empire mongol en 60 secondes", "Les prophéties qui se sont réalisées", "Les inventions arabes médiévales oubliées", "La vérité sur les gladiateurs romains"],
  tech:      ["GPT-5 vs cerveau humain", "Les métiers qui n'existeront plus en 2030", "La puce neurale de Neuralink", "Pourquoi l'IA ne peut pas vraiment créer", "Les données que Google a sur toi"],
  finance:   ["5 règles d'or des millionnaires", "Le pouvoir des intérêts composés", "Ce qu'on ne t'apprend pas à l'école sur l'argent", "Les erreurs qui ruinent les débutants en bourse", "Bitcoin vs Or — lequel choisir ?"],
  sport:     ["Les records qui ne seront jamais battus", "La science derrière Mbappé", "Pourquoi Federer est différent de tous", "Les sports les plus dangereux au monde", "La vérité sur le dopage en cyclisme"],
  lifestyle: ["Les 5 habitudes du matin des ultra-productifs", "Pourquoi se lever à 5h change tout", "Le régime des centenaires d'Okinawa", "Les lieux les plus reposants du monde", "Comment méditer en 5 minutes"],
  nature:    ["Les créatures des abysses qu'on découvre encore", "Le réseau d'arbres qui communiquent", "Les éruptions volcaniques les plus spectaculaires", "Pourquoi les baleines chantent", "Les forêts qui disparaissent chaque minute"],
};

// Server-side cache 1h
const trendCache = new Map<string, { topics: string[]; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const niche = req.nextUrl.searchParams.get("niche") ?? "science";
  const country = req.nextUrl.searchParams.get("country") ?? "FR";
  const cacheKey = `${niche}:${country}`;

  const cached = trendCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ topics: cached.topics, source: "cache" });
  }

  try {
    // Try google-trends-api (unofficial)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const googleTrends = require("google-trends-api");

    const result = await googleTrends.dailyTrends({
      trendDate: new Date(),
      geo: country === "FR" ? "FR" : country,
    });

    const data = JSON.parse(result) as {
      default: { trendingSearchesDays: { trendingSearches: { title: { query: string } }[] }[] };
    };

    const searches = data?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? [];
    const topics = searches
      .slice(0, 10)
      .map((s) => s.title?.query)
      .filter(Boolean)
      .slice(0, 5) as string[];

    if (topics.length > 0) {
      trendCache.set(cacheKey, { topics, expiresAt: Date.now() + 60 * 60 * 1000 });
      return NextResponse.json({ topics, source: "google_trends" });
    }

    throw new Error("No trends returned");
  } catch {
    // Fallback to curated static list
    const fallback = STATIC_SUGGESTIONS[niche] ?? STATIC_SUGGESTIONS.science;
    // Shuffle for variety
    const shuffled = [...fallback].sort(() => Math.random() - 0.5).slice(0, 5);
    trendCache.set(cacheKey, { topics: shuffled, expiresAt: Date.now() + 60 * 60 * 1000 });
    return NextResponse.json({ topics: shuffled, source: "static" });
  }
}
