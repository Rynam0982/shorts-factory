export interface VideoTemplate {
  id: string;
  name: string;
  icon: string;
  durationRecommended: number | null;
  qualityRecommended: "standard" | "premium" | "cinema" | null;
  systemPromptOverride: string | null;
}

export const TEMPLATES: VideoTemplate[] = [
  {
    id: "top5-facts",
    name: "Top 5 Faits",
    icon: "list-ordered",
    durationRecommended: 60,
    qualityRecommended: "standard",
    systemPromptOverride: `Génère un scénario "Top 5 faits surprenants sur : {subject}".
Structure : Hook choc (5s) → Fait 5 (10s) → Fait 4 (10s) → Fait 3 (10s) → Fait 2 (10s) → Fait 1 le plus fou (10s) → CTA (5s).
Ton : éducatif, rythmé, phrases courtes max 15 mots.
Retourne UNIQUEMENT le JSON storyboard sans markdown.`,
  },
  {
    id: "myth-reality",
    name: "Mythe vs Réalité",
    icon: "arrows-left-right",
    durationRecommended: 30,
    qualityRecommended: "standard",
    systemPromptOverride: `Génère un scénario "Mythe ou Réalité : {subject}".
Structure : Hook accrocheur (5s) → Mythe présenté (8s) → Révélation choc (10s) → Explication courte (5s) → CTA (2s).
Ton : percutant, informatif, suspense maintenu jusqu'à la révélation.
Retourne UNIQUEMENT le JSON storyboard sans markdown.`,
  },
  {
    id: "story-drama",
    name: "Histoire Vraie",
    icon: "clapperboard",
    durationRecommended: 60,
    qualityRecommended: "premium",
    systemPromptOverride: `Génère un scénario narratif dramatique sur : {subject}.
Structure : Mise en contexte (10s) → Montée en tension (20s) → Point culminant (15s) → Résolution (10s) → Morale/CTA (5s).
Ton : dramatique, immersif, narration à la troisième personne.
Retourne UNIQUEMENT le JSON storyboard sans markdown.`,
  },
  {
    id: "explain-60s",
    name: "Explication 60s",
    icon: "lightbulb",
    durationRecommended: 60,
    qualityRecommended: "standard",
    systemPromptOverride: `Explique le concept suivant en 60 secondes : {subject}.
Structure : Hook question (5s) → Contexte simple (10s) → Explication principale 3 points (30s) → Exemple concret (10s) → Conclusion actionnable (5s).
Ton : pédagogique, accessible, analogies simples.
Retourne UNIQUEMENT le JSON storyboard sans markdown.`,
  },
  {
    id: "before-after",
    name: "Avant / Après",
    icon: "arrow-left-right",
    durationRecommended: 30,
    qualityRecommended: "premium",
    systemPromptOverride: `Génère un scénario de transformation "Avant / Après" sur : {subject}.
Structure : Situation AVANT problématique (10s) → Transition dramatique (5s) → Résultat APRÈS impressionnant (10s) → Comment faire pareil (5s).
Ton : inspirant, concret, contrastes visuels forts.
Retourne UNIQUEMENT le JSON storyboard sans markdown.`,
  },
  {
    id: "free",
    name: "Prompt libre",
    icon: "pencil",
    durationRecommended: null,
    qualityRecommended: null,
    systemPromptOverride: null,
  },
];
