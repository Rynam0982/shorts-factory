import type { ContentCategory } from "./types";

type KeywordMap = Record<string, string[]>;

/**
 * Maps French words/concepts → English Pixabay search terms.
 * Add new entries here to improve simulation quality over time.
 */
export const SUBJECT_KEYWORDS: KeywordMap = {
  // ── Countries & cultures ──────────────────────────────────────────────────
  japon:          ["japan", "tokyo", "japanese culture", "japanese people", "japan city"],
  japan:          ["japan", "tokyo", "japanese culture", "japan city"],
  france:         ["france", "paris", "french culture", "paris city"],
  paris:          ["paris", "eiffel tower", "french culture", "paris street"],
  chine:          ["china", "beijing", "chinese culture", "great wall", "shanghai"],
  inde:           ["india", "delhi", "indian culture", "taj mahal", "mumbai"],
  amerique:       ["usa", "america", "new york", "american lifestyle"],
  etats_unis:     ["usa", "america", "new york", "american city"],
  europe:         ["europe", "european city", "travel europe"],
  afrique:        ["africa", "african culture", "savanna", "african landscape"],
  corée:          ["south korea", "seoul", "korean culture", "kpop"],
  italie:         ["italy", "rome", "italian culture", "venice", "colosseum"],
  espagne:        ["spain", "madrid", "barcelona", "spanish culture"],
  allemagne:      ["germany", "berlin", "german engineering", "munich"],
  suède:          ["sweden", "stockholm", "nordic", "scandinavian"],
  brésil:         ["brazil", "rio", "sao paulo", "brazilian culture"],
  australie:      ["australia", "sydney", "outback", "australian wildlife"],
  russie:         ["russia", "moscow", "russian culture", "kremlin"],
  canada:         ["canada", "toronto", "vancouver", "canadian nature"],
  mexique:        ["mexico", "mexico city", "mexican culture", "pyramid"],

  // ── Topics ────────────────────────────────────────────────────────────────
  propreté:       ["clean city", "clean street", "street cleaning", "urban cleanliness"],
  propre:         ["clean", "cleaning", "clean environment", "hygiene"],
  santé:          ["health", "healthy lifestyle", "wellness", "fitness", "medical"],
  sport:          ["sport", "athlete", "training", "fitness", "competition"],
  football:       ["football", "soccer", "stadium", "player", "match"],
  basketball:     ["basketball", "nba", "player", "dunk", "basketball court"],
  tennis:         ["tennis", "court", "tennis player", "match", "racket"],
  natation:       ["swimming", "pool", "swimmer", "water sport"],
  cyclisme:       ["cycling", "bicycle", "race", "tour de france"],
  course:         ["running", "marathon", "athlete", "race", "runner"],
  technologie:    ["technology", "tech", "computer", "digital", "innovation"],
  ia:             ["artificial intelligence", "AI", "machine learning", "neural network"],
  robots:         ["robot", "automation", "technology", "machine", "AI"],
  internet:       ["internet", "digital", "online", "network", "web"],
  argent:         ["money", "finance", "wealth", "cash", "investment"],
  finance:        ["finance", "stock market", "investment", "bank", "economy"],
  business:       ["business", "office", "entrepreneur", "startup", "corporate"],
  startup:        ["startup", "entrepreneur", "innovation", "tech company"],
  motivation:     ["motivation", "success", "winner", "achieve", "goal"],
  succès:         ["success", "achievement", "winner", "victory", "goal"],
  histoire:       ["history", "historical", "ancient", "vintage", "museum"],
  guerre:         ["war", "conflict", "military", "battle", "history"],
  révolution:     ["revolution", "protest", "change", "history"],
  science:        ["science", "laboratory", "research", "experiment", "discovery"],
  espace:         ["space", "galaxy", "stars", "universe", "cosmos", "nasa"],
  nature:         ["nature", "forest", "mountain", "landscape", "wildlife"],
  océan:          ["ocean", "sea", "waves", "underwater", "beach"],
  mer:            ["sea", "ocean", "waves", "beach", "coastal"],
  animaux:        ["animals", "wildlife", "nature", "animal"],
  nourriture:     ["food", "cooking", "meal", "restaurant", "cuisine"],
  cuisine:        ["cooking", "chef", "food", "kitchen", "recipe"],
  voyage:         ["travel", "adventure", "tourist", "journey", "exploration"],
  musique:        ["music", "concert", "musician", "band", "performance"],
  art:            ["art", "painting", "artist", "gallery", "creative"],
  architecture:   ["architecture", "building", "city", "design", "urban"],
  ville:          ["city", "urban", "downtown", "metropolis", "cityscape"],
  famille:        ["family", "together", "happiness", "home", "parents"],
  enfants:        ["children", "kids", "family", "playing", "school"],
  éducation:      ["education", "school", "learning", "student", "university"],
  politique:      ["politics", "government", "democracy", "election", "leadership"],
  économie:       ["economy", "finance", "market", "business", "growth"],
  environnement:  ["environment", "ecology", "green", "sustainable", "nature"],
  climat:         ["climate", "environment", "global warming", "sustainability"],
  futur:          ["future", "innovation", "technology", "digital", "modern"],
  voiture:        ["car", "vehicle", "driving", "automobile", "road"],
  avion:          ["airplane", "aviation", "airport", "flight", "travel"],
  méditation:     ["meditation", "mindfulness", "yoga", "calm", "peace"],
  yoga:           ["yoga", "meditation", "fitness", "flexibility", "wellness"],
  crypto:         ["cryptocurrency", "bitcoin", "blockchain", "digital money"],
  bitcoin:        ["bitcoin", "cryptocurrency", "blockchain", "digital currency"],
  luxe:           ["luxury", "rich", "expensive", "premium", "exclusive"],
  mode:           ["fashion", "clothes", "style", "designer", "runway"],
  beauté:         ["beauty", "makeup", "cosmetics", "skincare", "fashion"],
  photographie:   ["photography", "camera", "photo", "photographer"],
  cinéma:         ["cinema", "movie", "film", "hollywood", "actor"],
  jeux_vidéo:     ["video game", "gaming", "esports", "console", "player"],
  musées:         ["museum", "art", "culture", "exhibition", "gallery"],
  religion:       ["religion", "church", "temple", "faith", "spiritual"],
  philosophie:    ["philosophy", "thinking", "wisdom", "knowledge"],
  psychologie:    ["psychology", "mind", "mental health", "behavior"],
  leadership:     ["leadership", "business", "team", "manager", "success"],
  innovation:     ["innovation", "startup", "technology", "creative", "invention"],
  durabilité:     ["sustainability", "green energy", "eco", "renewable", "nature"],
  soleil:         ["sun", "sunshine", "golden hour", "sunrise", "sunset"],
  nuit:           ["night", "city lights", "nightlife", "dark", "moon"],
  montagne:       ["mountain", "hiking", "nature", "peak", "landscape"],
  désert:         ["desert", "sand", "arid", "dunes", "dry landscape"],
};

/** Category-level search terms (added when no subject match found) */
export const CATEGORY_KEYWORDS: Record<ContentCategory, string[]> = {
  culture:      ["culture", "tradition", "people", "lifestyle", "community", "society"],
  business:     ["business", "corporate", "office", "entrepreneur", "work", "professional"],
  motivation:   ["success", "motivation", "achievement", "winner", "positive", "inspire"],
  sport:        ["sport", "athlete", "competition", "training", "victory", "championship"],
  histoire:     ["history", "historical", "ancient", "archive", "monument", "heritage"],
  science:      ["science", "research", "laboratory", "discovery", "innovation"],
  technologie:  ["technology", "digital", "computer", "innovation", "future", "tech"],
  santé:        ["health", "wellness", "medical", "fitness", "care"],
  voyage:       ["travel", "adventure", "destination", "tourism", "journey"],
  general:      ["lifestyle", "people", "city", "nature", "world"],
};

/** Maps French prompt words → content category */
export const TOPIC_TO_CATEGORY: Record<string, ContentCategory> = {
  // Culture
  japon: "culture", japan: "culture", france: "culture", chine: "culture",
  inde: "culture", afrique: "culture", europe: "culture", corée: "culture",
  culture: "culture", tradition: "culture", société: "culture",
  pays: "culture", ville: "culture", monde: "culture",

  // Business
  business: "business", argent: "business", finance: "business",
  économie: "business", entreprise: "business", startup: "business",
  investissement: "business", travail: "business", emploi: "business",
  riche: "business", richesse: "business", entrepreneur: "business",
  crypto: "business", bitcoin: "business", bourse: "business",

  // Motivation
  motivation: "motivation", succès: "motivation", objectif: "motivation",
  rêve: "motivation", persévérance: "motivation", développement: "motivation",
  champion: "motivation", gagner: "motivation", réussir: "motivation",
  leadership: "motivation", discipline: "motivation",

  // Sport
  sport: "sport", football: "sport", basketball: "sport", tennis: "sport",
  course: "sport", athlétisme: "sport", natation: "sport", cyclisme: "sport",
  yoga: "santé", fitness: "santé",

  // Histoire
  histoire: "histoire", guerre: "histoire", antiquité: "histoire",
  révolution: "histoire", empire: "histoire", roi: "histoire",
  siècle: "histoire", historique: "histoire", passé: "histoire",

  // Science
  science: "science", physique: "science", chimie: "science",
  biologie: "science", astronomie: "science", espace: "science",
  découverte: "science", recherche: "science", expérience: "science",

  // Technologie
  technologie: "technologie", ia: "technologie", robot: "technologie",
  ordinateur: "technologie", internet: "technologie", digital: "technologie",
  intelligence: "technologie", artificielle: "technologie", numérique: "technologie",
  futur: "technologie", innovation: "technologie",

  // Santé
  santé: "santé", médecine: "santé", maladie: "santé",
  nutrition: "santé", méditation: "santé", bien_être: "santé",
  régime: "santé", sommeil: "santé", stress: "santé",

  // Voyage
  voyage: "voyage", tourisme: "voyage", aventure: "voyage",
  destination: "voyage", exploration: "voyage", randonnée: "voyage",
};
