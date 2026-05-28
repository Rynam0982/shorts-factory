/* global window */
// data.jsx — données mock Shorts Factory

const TEMPLATES = [
  { id: "top5", name: "Top 5 Faits", icon: "list-numbers", dur: 60, q: "standard", desc: "Hook choc → 5 faits surprenants → CTA" },
  { id: "myth", name: "Mythe vs Réalité", icon: "arrows-exchange", dur: 30, q: "standard", desc: "Idée reçue confrontée à la vérité" },
  { id: "story", name: "Histoire Vraie", icon: "movie", dur: 60, q: "premium", desc: "Récit narratif immersif et dramatique" },
  { id: "explain", name: "Explication 60s", icon: "bulb", dur: 60, q: "standard", desc: "Un concept complexe rendu simple" },
  { id: "beforeafter", name: "Avant / Après", icon: "arrows-right-left", dur: 30, q: "premium", desc: "Transformation visuelle marquante" },
  { id: "free", name: "Prompt libre", icon: "pencil", dur: null, q: null, desc: "Contrôle total, à toi de jouer" },
];

const QUALITIES = {
  standard: { key: "standard", label: "Standard", desc: "Rapide & économique · 1080p", crps: 7, tone: "neutral", icon: "bolt", color: "var(--tx-1)" },
  premium: { key: "premium", label: "Premium", desc: "Qualité supérieure · 4K", crps: 14, tone: "accent", icon: "diamond", color: "var(--accent-bright)" },
  cinema: { key: "cinema", label: "Cinema", desc: "Rendu professionnel · 4K + réf. avatar", crps: 19, tone: "cinema", icon: "movie", color: "var(--cinema)" },
};

const CAPTION_STYLES = [
  { id: "bold_center", label: "Bold Center" },
  { id: "karaoke", label: "Karaoké" },
  { id: "wordbyword", label: "Mot à mot" },
  { id: "boxed", label: "Encadré" },
  { id: "minimal", label: "Minimal" },
];

const PIPELINE_STEPS = [
  { id: "storyboard", label: "Scénario", sub: "Claude écrit le storyboard", icon: "writing", engine: "LLM" },
  { id: "scenes", label: "Scènes vidéo", sub: "Génération des 6 plans", icon: "movie", engine: "Video AI" },
  { id: "voice", label: "Voix off", sub: "Synthèse vocale", icon: "microphone", engine: "TTS" },
  { id: "music", label: "Musique", sub: "Ambiance sonore", icon: "music", engine: "Audio" },
  { id: "assembly", label: "Assemblage", sub: "Montage + sous-titres", icon: "layers-subtract", engine: "FFmpeg" },
];

const RECENT_VIDEOS = [
  { id: "v1", title: "5 faits insolites sur l'espace", q: "premium", status: "DONE", seed: 0, cr: 427, dur: 30, plats: ["youtube", "tiktok"], cap: "L'espace SENT le métal brûlé", date: "il y a 2 h", views: "12,4k" },
  { id: "v2", title: "Pourquoi le ciel est bleu", q: "standard", status: "DONE", seed: 1, cr: 217, dur: 30, plats: ["tiktok", "instagram"], cap: "Ce n'est PAS l'océan", date: "il y a 5 h", views: "8,1k" },
  { id: "v3", title: "L'histoire vraie du Titanic", q: "cinema", status: "READY", seed: 2, cr: 610, dur: 30, plats: ["youtube"], cap: "Personne ne s'y attendait", date: "hier", views: "—" },
  { id: "v4", title: "Mythe : on utilise 10% du cerveau", q: "standard", status: "DONE", seed: 3, cr: 217, dur: 30, plats: ["tiktok"], cap: "FAUX. Voici la vérité", date: "hier", views: "31,2k" },
  { id: "v5", title: "Avant/Après : Tokyo en 100 ans", q: "premium", status: "PROCESSING_STORYBOARD", seed: 4, cr: 427, dur: 30, plats: ["youtube", "tiktok", "instagram"], cap: "1920 vs aujourd'hui", date: "en cours", views: "—" },
  { id: "v6", title: "Top 5 animaux les plus rapides", q: "standard", status: "DONE", seed: 1, cr: 217, dur: 60, plats: ["instagram"], cap: "Le n°1 va te choquer", date: "il y a 2 j", views: "5,6k" },
];

const SERIES = [
  { id: "s1", name: "Faits Insolites avec Maya", avatar: "Maya", topic: "Histoire mondiale & science", q: "standard", freq: "daily", time: "18:00", plats: ["tiktok", "youtube"], active: true, total: 47, next: "Aujourd'hui 18:00", seed: 0 },
  { id: "s2", name: "Mystères Non Résolus", avatar: "Alex", topic: "True crime & énigmes", q: "premium", freq: "three_weekly", time: "20:00", plats: ["youtube"], active: true, total: 18, next: "Demain 20:00", seed: 2 },
  { id: "s3", name: "Science en 30s", avatar: null, topic: "Vulgarisation scientifique", q: "standard", freq: "twice_weekly", time: "12:00", plats: ["tiktok", "instagram"], active: false, total: 9, next: "En pause", seed: 3 },
];

const FREQ_LABEL = { daily: "Tous les jours", twice_weekly: "2× / semaine", three_weekly: "3× / semaine", weekly: "1× / semaine" };

const TX = [
  { type: "CONSUMPTION", amount: -427, desc: "Vidéo Premium 30s — Titanic", date: "Aujourd'hui 14:32", bal: 3411 },
  { type: "PURCHASE", amount: 2000, desc: "Pack 2000 crédits", date: "Aujourd'hui 09:10", bal: 3838 },
  { type: "CONSUMPTION", amount: -217, desc: "Vidéo Standard 30s — Ciel bleu", date: "Hier 19:48", bal: 1838 },
  { type: "SUBSCRIPTION_GRANT", amount: 5000, desc: "Refill mensuel — Studio", date: "Hier 00:00", bal: 2055 },
  { type: "CONSUMPTION", amount: -610, desc: "Vidéo Cinema 30s", date: "12 mai", bal: -2945 },
  { type: "BONUS", amount: 50, desc: "Bonus de bienvenue", date: "02 mai", bal: 50 },
];

const PLANS = [
  { id: "starter_creator", name: "Creator", price: 19.99, tagline: "Lance ta 1ʳᵉ série auto", series: 1, vids: "3 / sem.", credits: 50, q: ["standard"], feats: ["1 série automatisée", "Vidéos Standard 20-30s", "Avatar IA", "Suggestions tendances", "+50 crédits Studio"], pop: false },
  { id: "creator_pro", name: "Creator Pro", price: 34.99, tagline: "Publie tous les jours", series: 3, vids: "Quotidien", credits: 200, q: ["standard", "premium"], feats: ["3 séries automatisées", "Standard + Premium", "Clonage de voix", "Musique IA (Suno)", "Multi-langue + Thumbnail IA", "+200 crédits Studio"], pop: true },
  { id: "studio", name: "Studio", price: 44.99, tagline: "Création à la demande", series: 0, vids: "—", credits: 5000, q: ["standard", "premium", "cinema"], feats: ["5000 crédits / mois", "Standard · Premium · Cinema", "File prioritaire", "3 jobs simultanés", "Toutes les options débloquées"], pop: false },
  { id: "agency", name: "Agency", price: 79.99, tagline: "Pour les équipes & agences", series: 10, vids: "2 / jour", credits: 3000, q: ["standard", "premium", "cinema"], feats: ["10 séries + 3000 crédits", "Toutes qualités", "3 sièges d'équipe", "5 jobs simultanés", "Support prioritaire"], pop: false },
];

const CREDIT_PACKS = [
  { id: "p500", credits: 500, price: 4.99, per: "1 ct / crédit" },
  { id: "p2000", credits: 2000, price: 17.99, per: "économise 10%", best: false },
  { id: "p5000", credits: 5000, price: 39.99, per: "économise 20%", best: true },
  { id: "p15000", credits: 15000, price: 99.99, per: "économise 33%" },
];

const STATUS_MAP = {
  DONE: { label: "Publiée", tone: "ok", icon: "circle-check" },
  READY: { label: "Prête", tone: "accent", icon: "circle-check" },
  PROCESSING_STORYBOARD: { label: "Scénario…", tone: "warn", icon: "loader-2" },
  GENERATING_SCENES: { label: "Génération…", tone: "warn", icon: "loader-2" },
  ASSEMBLING: { label: "Assemblage…", tone: "warn", icon: "loader-2" },
  QUEUED: { label: "En file", tone: "neutral", icon: "clock" },
  FAILED: { label: "Échec", tone: "bad", icon: "alert-triangle" },
};

Object.assign(window, { TEMPLATES, QUALITIES, CAPTION_STYLES, PIPELINE_STEPS, RECENT_VIDEOS, SERIES, FREQ_LABEL, TX, PLANS, CREDIT_PACKS, STATUS_MAP });
