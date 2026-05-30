import type {
  VisualStyle, LightingTone, CameraMovement,
  AspectRatio, TransitionStyle, SFXIntensity,
  CaptionStyle, CaptionFontSize, CaptionPosition,
} from "@/types/job";

// ── Visual styles ───────────────────────────────────────────────────────────
export const VISUAL_STYLES: { id: VisualStyle; label: string; desc: string }[] = [
  { id: "realistic",   label: "Réaliste",      desc: "Photographie naturelle, couleurs vraies" },
  { id: "cinematic",   label: "Cinématique",   desc: "Rendu film, forte profondeur de champ" },
  { id: "anime",       label: "Anime",         desc: "Style animation japonaise" },
  { id: "futuristic",  label: "Futuriste",     desc: "Tech, néons, science-fiction" },
  { id: "vintage",     label: "Vintage",       desc: "Grain pellicule, couleurs fanées" },
  { id: "nature",      label: "Nature",        desc: "Paysages naturels, lumière dorée" },
  { id: "graphic",     label: "Graphique",     desc: "Couleurs vives, lignes nettes" },
];

// ── Lighting tones ──────────────────────────────────────────────────────────
export const LIGHTING_TONES: { id: LightingTone; label: string; emoji: string }[] = [
  { id: "dramatic",  label: "Dramatique",    emoji: "🌑" },
  { id: "sunny",     label: "Ensoleillé",    emoji: "☀️" },
  { id: "dark",      label: "Sombre",        emoji: "🌒" },
  { id: "neutral",   label: "Neutre",        emoji: "⬜" },
  { id: "warm",      label: "Chaud",         emoji: "🟠" },
  { id: "cold",      label: "Froid",         emoji: "🔵" },
];

// ── Camera movements ────────────────────────────────────────────────────────
export const CAMERA_MOVEMENTS: { id: CameraMovement; label: string; desc: string }[] = [
  { id: "static",    label: "Statique",       desc: "Plan fixe, aucun mouvement" },
  { id: "slow_zoom", label: "Slow zoom",      desc: "Zoom lent vers le sujet" },
  { id: "pan",       label: "Pan",            desc: "Balayage horizontal" },
  { id: "dolly",     label: "Dolly avant",    desc: "Travelling avant immersif" },
  { id: "dynamic",   label: "Dynamique",      desc: "Coupes rapides, énergie maximale" },
];

// ── Aspect ratios per provider ──────────────────────────────────────────────
export const RATIOS_BY_PROVIDER: Record<string, AspectRatio[]> = {
  hailuo:         ["9:16", "16:9", "1:1", "4:3", "3:4", "2:3"],
  kling_standard: ["9:16", "16:9", "1:1"],
  kling_pro:      ["9:16", "16:9", "1:1"],
  wan:            ["9:16", "16:9", "1:1"],
};

export const RATIO_LABELS: Record<AspectRatio, { label: string; usage: string }> = {
  "9:16": { label: "9:16",  usage: "TikTok · Reels · Shorts" },
  "16:9": { label: "16:9", usage: "YouTube · Paysage" },
  "1:1":  { label: "1:1",  usage: "Instagram Feed · Carré" },
  "4:3":  { label: "4:3",  usage: "Format classique" },
  "3:4":  { label: "3:4",  usage: "Portrait alternatif" },
  "2:3":  { label: "2:3",  usage: "Pinterest · Tall" },
};

// ── Music moods (Pixabay) ───────────────────────────────────────────────────
export const MUSIC_MOODS: { id: string; label: string; query: string; emoji: string }[] = [
  { id: "epic",       label: "Épique",          query: "epic orchestral dramatic",  emoji: "⚡" },
  { id: "chill",      label: "Chill",           query: "chill ambient relaxing",    emoji: "🌊" },
  { id: "corporate",  label: "Corporate",       query: "corporate upbeat professional", emoji: "💼" },
  { id: "fun",        label: "Fun / Énergie",   query: "upbeat fun energetic",      emoji: "🎉" },
  { id: "mysterious", label: "Mystérieux",      query: "mysterious dark suspense",  emoji: "🌑" },
  { id: "action",     label: "Action",          query: "action intense fast",       emoji: "🔥" },
  { id: "emotional",  label: "Émotionnel",      query: "emotional inspiring piano", emoji: "💫" },
];

// ── SFX intensity ───────────────────────────────────────────────────────────
export const SFX_INTENSITIES: { id: SFXIntensity; label: string; desc: string }[] = [
  { id: "none",    label: "Désactivé", desc: "Aucun effet sonore" },
  { id: "subtle",  label: "Subtil",   desc: "Volume 10% — discret" },
  { id: "normal",  label: "Normal",   desc: "Volume 20% — recommandé" },
  { id: "intense", label: "Intense",  desc: "Volume 35% — impactant" },
];

// ── Caption styles ──────────────────────────────────────────────────────────
export const CAPTION_STYLES: { id: CaptionStyle; label: string; desc: string }[] = [
  { id: "wordbyword",  label: "Mot par mot",      desc: "Chaque mot au rythme de la voix" },
  { id: "karaoke",     label: "Karaoké",           desc: "Mot actif en jaune — style viral" },
  { id: "bold_center", label: "Bold Center",       desc: "3-5 mots gras centrés" },
  { id: "boxed",       label: "Boxed",             desc: "Fond semi-transparent — style cinéma" },
  { id: "minimal",     label: "Minimal",           desc: "Texte discret en bas" },
  { id: "none",        label: "Désactivé",         desc: "Aucune caption" },
];

export const CAPTION_FONT_FAMILIES = [
  { id: "Arial Black", label: "Arial Black" },
  { id: "Impact",      label: "Impact" },
  { id: "Montserrat",  label: "Montserrat" },
  { id: "Roboto",      label: "Roboto" },
];

export const CAPTION_FONT_SIZES: { id: CaptionFontSize; label: string }[] = [
  { id: "small",  label: "Petit" },
  { id: "medium", label: "Moyen" },
  { id: "large",  label: "Grand" },
];

export const CAPTION_POSITIONS: { id: CaptionPosition; label: string }[] = [
  { id: "top",    label: "Haut" },
  { id: "center", label: "Centre" },
  { id: "bottom", label: "Bas" },
];

export const CAPTION_HIGHLIGHT_COLORS = [
  { id: "yellow", label: "Jaune",    hex: "#FFE500" },
  { id: "white",  label: "Blanc",    hex: "#FFFFFF" },
  { id: "cyan",   label: "Cyan",     hex: "#00E5FF" },
  { id: "pink",   label: "Rose",     hex: "#FF4FC3" },
];

// ── Transitions ─────────────────────────────────────────────────────────────
export const TRANSITIONS: { id: TransitionStyle; label: string; desc: string }[] = [
  { id: "cut",   label: "Coupe",    desc: "Coupe franche — rythme TikTok" },
  { id: "fade",  label: "Fondu",    desc: "Fondu enchaîné — ton narratif" },
  { id: "zoom",  label: "Zoom",     desc: "Zoom out/in — effet dynamique" },
  { id: "slide", label: "Glissement", desc: "Slide latéral — storytelling" },
  { id: "flash", label: "Flash",    desc: "Flash blanc — énergie max" },
];

// ── FPS options ─────────────────────────────────────────────────────────────
export const FPS_OPTIONS = [
  { value: 24, label: "24 fps", desc: "Cinématique" },
  { value: 30, label: "30 fps", desc: "Standard (défaut)" },
  { value: 60, label: "60 fps", desc: "Ultra fluide" },
];

// ── Niches for Google Trends ─────────────────────────────────────────────────
export const TREND_NICHES = [
  { id: "science",   label: "Science",   emoji: "🔬" },
  { id: "histoire",  label: "Histoire",  emoji: "📜" },
  { id: "tech",      label: "Tech",      emoji: "💻" },
  { id: "finance",   label: "Finance",   emoji: "💰" },
  { id: "sport",     label: "Sport",     emoji: "⚽" },
  { id: "lifestyle", label: "Lifestyle", emoji: "✨" },
  { id: "nature",    label: "Nature",    emoji: "🌿" },
];

// ── Provider mapping ─────────────────────────────────────────────────────────
export const QUALITY_TO_PROVIDER: Record<string, string> = {
  standard: "hailuo",
  premium:  "kling_standard",
  cinema:   "kling_pro",
};
