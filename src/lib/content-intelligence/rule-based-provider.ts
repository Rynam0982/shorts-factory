import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { JobDoc } from "@/types/job";
import type { Storyboard } from "@/types/storyboard";
import { SUBJECT_KEYWORDS, CATEGORY_KEYWORDS, TOPIC_TO_CATEGORY } from "./keyword-dictionary";
import { SCRIPT_TEMPLATES, CATEGORY_TO_MUSIC_MOOD } from "./script-templates";
import type { ContentCategory, PromptAnalysis, SimulationDebug } from "./types";

// ── Step 1: Prompt analysis ───────────────────────────────────────────────────

function analyzePrompt(prompt: string): PromptAnalysis {
  const lower = prompt.toLowerCase();
  const words = lower.split(/[\s,;?!.'"()[\]]+/).filter(w => w.length > 1);

  // Detect category from most prominent topic word
  let category: ContentCategory = "general";
  for (const word of words) {
    const found = TOPIC_TO_CATEGORY[word];
    if (found) { category = found; break; }
  }

  // Extract main subject: first meaningful non-stopword
  const stopWords = new Set([
    "le","la","les","de","du","des","un","une","est","sont","pour","dans",
    "avec","sur","pas","que","qui","ce","se","si","il","elle","nous","vous",
    "ils","elles","je","tu","au","aux","en","et","ou","ni","par","ne","qu",
    "très","plus","bien","tout","tous","toutes","aussi","mais","donc","car",
    "comment","pourquoi","quand","quel","quelle","quels","quelles","est",
  ]);
  const meaningful = words.filter(w => w.length > 2 && !stopWords.has(w));
  const mainSubject   = meaningful[0] ?? words[0] ?? "sujet";
  const secondarySubject = meaningful[1] ?? "";

  // Tone detection
  let tone: PromptAnalysis["tone"] = "informatif";
  if (lower.match(/comment|étape|guide|apprendre|comprendre/)) tone = "éducatif";
  if (lower.match(/incroyable|secret|vérité|révélation|choc/))  tone = "dramatique";
  if (lower.match(/motivation|champion|réussir|succès|gagner/)) tone = "inspirant";
  if (lower.match(/fun|drôle|humour|bizarre|wtf/))              tone = "humoristique";

  // Emotion
  let emotion: PromptAnalysis["emotion"] = "neutre";
  if (/succès|champion|victoire|incroyable|magnifique/.test(lower)) emotion = "positif";
  if (/motivation|rêve|objectif|inspire|persévérance/.test(lower))  emotion = "inspirant";
  if (/guerre|maladie|crise|catastrophe|drame/.test(lower))         emotion = "négatif";

  // Energy
  const energyMap: Record<ContentCategory, PromptAnalysis["energy"]> = {
    culture:      "medium",
    business:     "medium",
    motivation:   "high",
    sport:        "high",
    histoire:     "low",
    science:      "medium",
    technologie:  "high",
    santé:        "low",
    voyage:       "medium",
    general:      "medium",
  };

  return {
    mainSubject,
    secondarySubject,
    category,
    tone,
    emotion,
    energy: energyMap[category],
  };
}

// ── Step 2: Keyword expansion ──────────────────────────────────────────────────

function expandKeywords(prompt: string, analysis: PromptAnalysis): string[] {
  const lower = prompt.toLowerCase();
  const words = lower.split(/[\s,;?!.'"()[\]]+/).filter(w => w.length > 1);
  const seen = new Set<string>();
  const result: string[] = [];

  const add = (...lists: string[][]) => {
    for (const list of lists) {
      for (const kw of list) {
        const k = kw.toLowerCase().trim();
        if (k && !seen.has(k)) { seen.add(k); result.push(kw); }
      }
    }
  };

  // Exact matches in prompt words
  for (const word of words) {
    const kws = SUBJECT_KEYWORDS[word];
    if (kws) add(kws);
  }

  // Partial matches (word is contained in a known key)
  for (const [key, kws] of Object.entries(SUBJECT_KEYWORDS)) {
    if (lower.includes(key) && !words.includes(key)) add(kws);
  }

  // Category fallback
  add(CATEGORY_KEYWORDS[analysis.category] ?? []);

  // If still sparse, add raw subject words as-is (English)
  if (result.length < 4) {
    add([analysis.mainSubject, analysis.secondarySubject].filter(Boolean));
  }

  return result.slice(0, 20);
}

// ── Step 3: Scene distribution ─────────────────────────────────────────────────

interface RawScene {
  voiceoverText: string;
  captionText: string;
  visualPrompt: string;
  pixabayKeywords: string[];
}

function buildScenes(
  analysis: PromptAnalysis,
  keywords: string[],
  duration: number,
): RawScene[] {
  const sceneCount =
    duration <= 30 ? 6 :
    duration <= 60 ? 12 : 18;

  const template = SCRIPT_TEMPLATES[analysis.category];
  const scenes: RawScene[] = [];
  const usedKwIdx = new Set<number>();

  const pickKw = (preferIdx: number): string[] => {
    const primary = keywords[preferIdx % Math.max(1, keywords.length)] ?? keywords[0];
    const secondary: string[] = [];
    for (let i = 0; i < keywords.length && secondary.length < 2; i++) {
      const idx = (preferIdx + i + 1) % keywords.length;
      if (!usedKwIdx.has(idx)) secondary.push(keywords[idx]);
    }
    usedKwIdx.add(preferIdx % Math.max(1, keywords.length));
    return [primary, ...secondary].filter(Boolean);
  };

  for (let i = 0; i < sceneCount; i++) {
    const isFirst = i === 0;
    const isLast  = i === sceneCount - 1;

    let voiceoverText: string;
    if (isFirst) {
      voiceoverText = pickRandom(template.hooks);
    } else if (isLast) {
      voiceoverText = pickRandom(template.closings);
    } else {
      const phraseIdx = (i - 1) % template.bridgePhrases.length;
      voiceoverText = template.bridgePhrases[phraseIdx];
    }

    const sceneKws = pickKw(i);
    const captionText = voiceoverText.split(" ").slice(0, 4).join(" ").toUpperCase();
    const visualPrompt = [
      ...sceneKws.slice(0, 2),
      analysis.category,
      analysis.energy === "high" ? "dynamic action" : "cinematic calm",
    ].join(", ");

    scenes.push({ voiceoverText, captionText, visualPrompt, pixabayKeywords: sceneKws });
  }

  return scenes;
}

// ── Step 8: SFX triggers ───────────────────────────────────────────────────────

function detectSFXTriggers(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const triggers: string[] = [];
  const SFX_MAP: Record<string, string> = {
    explosion: "blast",  argent: "cash",     succès: "success",
    victoire:  "success", incroyable: "impact", révélation: "reveal",
    surprise:  "impact",  guerre: "blast",     argent2: "cash",
  };
  for (const [kw, sfx] of Object.entries(SFX_MAP)) {
    if (lower.includes(kw.replace("2", "")) && !triggers.includes(sfx)) {
      triggers.push(sfx);
    }
  }
  if (!triggers.includes("whoosh")) triggers.push("whoosh");
  return triggers;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface RuleBasedResult {
  storyboard: Storyboard;
  simulationDebug: SimulationDebug;
}

export async function generateRuleBasedStoryboard(job: JobDoc): Promise<RuleBasedResult> {
  const duration = job.durationSeconds ?? 30;
  const prompt   = job.userPrompt;

  // Step 1
  const analysis = analyzePrompt(prompt);

  // Step 2
  const keywords = expandKeywords(prompt, analysis);

  // Steps 3 & 4
  const rawScenes = buildScenes(analysis, keywords, duration);
  const sceneCount   = rawScenes.length;
  const sceneDuration = Math.round(duration / sceneCount);

  // Step 7: Music mood
  const musicMood  = CATEGORY_TO_MUSIC_MOOD[analysis.category];
  const moodQueryMap: Record<string, string> = {
    epic:       "epic orchestral dramatic",
    chill:      "chill ambient relaxing",
    corporate:  "corporate upbeat professional",
    fun:        "upbeat fun energetic",
    mysterious: "mysterious dark suspense",
    action:     "action intense fast",
    emotional:  "emotional inspiring piano",
  };
  const musicQuery = moodQueryMap[musicMood] ?? `${musicMood} background music`;

  // Step 8: SFX
  const sfxTriggers = detectSFXTriggers(prompt);

  // Build title
  const subjectCapitalized =
    analysis.mainSubject.charAt(0).toUpperCase() + analysis.mainSubject.slice(1);
  const title = `${subjectCapitalized} — ${rawScenes[0].voiceoverText.slice(0, 40)}`;

  // Build storyboard (pixabayKeywords stored per scene)
  const storyboard: Storyboard = {
    title,
    totalDurationSeconds: duration,
    suggestedMood: musicMood,
    thumbnailPrompt: `${analysis.mainSubject} ${analysis.category} dramatic close-up cinematic`,
    scenes: rawScenes.map((s, idx) => ({
      index: idx,
      durationSeconds: sceneDuration,
      visualPrompt: s.visualPrompt,
      motionStyle: analysis.energy === "high" ? "dynamic" : "slow_zoom",
      audioPrompt: `${analysis.category} ambient sound`,
      voiceoverText: s.voiceoverText,
      captionText: s.captionText,
      pixabayKeywords: s.pixabayKeywords,
    })),
  };

  const simulationDebug: SimulationDebug = {
    originalPrompt: prompt,
    analysis,
    generatedKeywords: keywords,
    generatedScript: rawScenes.map(s => s.voiceoverText),
    musicQuery,
    sfxTriggers,
    totalDuration: duration,
    sceneDebugs: {},
  };

  // Persist to job document
  await adminDb.collection("jobs").doc(job.id).update({
    simulationDebug,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { storyboard, simulationDebug };
}
