export type ContentCategory =
  | "culture"
  | "business"
  | "motivation"
  | "sport"
  | "histoire"
  | "science"
  | "technologie"
  | "santé"
  | "voyage"
  | "general";

export interface PromptAnalysis {
  mainSubject: string;
  secondarySubject: string;
  category: ContentCategory;
  tone: "informatif" | "inspirant" | "dramatique" | "humoristique" | "éducatif";
  emotion: "neutre" | "positif" | "négatif" | "inspirant";
  energy: "low" | "medium" | "high";
}

export interface MediaScoreBreakdown {
  relevance: number;   // 0–40
  orientation: number; // 0–25
  quality: number;     // 0–20
  duration: number;    // 0–10
  diversity: number;   // 0–5
}

export interface ScoredMedia {
  pixabayId: number;
  url: string;
  thumbnailUrl: string;
  type: "video" | "image";
  totalScore: number;
  breakdown: MediaScoreBreakdown;
  query: string;
  tags: string;
  width: number;
  height: number;
  durationSeconds?: number;
}

export interface SceneSimDebug {
  index: number;
  voiceoverText: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  emotion: string;
  energy: string;
  queriesRan: string[];
  topResults: ScoredMedia[];
  selectedMedia: ScoredMedia | null;
}

export interface SimulationDebug {
  originalPrompt: string;
  analysis: PromptAnalysis;
  generatedKeywords: string[];
  generatedScript: string[];
  musicQuery: string;
  sfxTriggers: string[];
  totalDuration: number;
  /** Filled progressively during scene generation; keyed by "scene_N" */
  sceneDebugs: Record<string, SceneSimDebug>;
}
