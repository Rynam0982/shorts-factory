# SHORTS FACTORY v2 — Flow de création vidéo complet (v3)

> **Addendum au fichier principal `shorts-factory-v2-CREATION-VIDEO.md`**
> Ce fichier remplace et enrichit la section "pipeline de création" uniquement.
> Toutes les autres specs (Firebase, Stripe, Clerk, crédits) restent inchangées.

---

## NOUVEAU FLOW : 6 ÉTAPES SÉQUENTIELLES

### Principe fondamental
Les étapes 1 à 4 sont de la **validation gratuite** — zéro crédit dépensé, zéro API payante appelée.
Les crédits sont réservés **uniquement au moment du clic "Lancer la génération"** (étape 6).

---

## ÉTAPE 1 — SUJET ET TENDANCES

### Ce qui s'affiche
- Champ texte libre pour le sujet
- Sélecteur de format narratif (6 templates + prompt libre)
- Sélecteur de niche pour les tendances (Science, Histoire, Tech, Finance, Sport, Lifestyle, Nature)
- **Bouton "Voir les tendances du moment →"** : au clic, appelle Google Trends et affiche 5 sujets viraux de la semaine dans la niche choisie. L'utilisateur peut cliquer sur n'importe quel sujet pour le sélectionner comme base de sa vidéo.

### Implémentation Google Trends
```typescript
// src/lib/trends.ts
// Utiliser l'API officielle Google Trends (juillet 2025)
// ou pytrends comme fallback si l'API officielle n'est pas accessible

async function getTrendingSuggestions(
  niche: string,
  country: string = 'FR'
): Promise<Array<{ topic: string, growth: string, searchVolume: string }>>

// Appelé uniquement au clic sur le bouton — pas au chargement de la page
// Résultats mis en cache 1h côté serveur pour éviter les quotas
// Route : GET /api/trending?niche=science&country=FR
```

### Templates narratifs disponibles
```typescript
// src/data/templates.ts
export const TEMPLATES = [
  { id: 'top5-facts',    name: 'Top 5 Faits',      icon: 'ti-list-numbers', durationRecommended: 60, qualityRecommended: 'standard' },
  { id: 'myth-reality',  name: 'Mythe vs Réalité',  icon: 'ti-arrows-exchange', durationRecommended: 30, qualityRecommended: 'standard' },
  { id: 'story-drama',   name: 'Histoire Vraie',    icon: 'ti-movie', durationRecommended: 60, qualityRecommended: 'premium' },
  { id: 'explain-60s',   name: 'Explication 60s',   icon: 'ti-bulb', durationRecommended: 60, qualityRecommended: 'standard' },
  { id: 'before-after',  name: 'Avant / Après',     icon: 'ti-arrows-right-left', durationRecommended: 30, qualityRecommended: 'premium' },
  { id: 'free',          name: 'Prompt libre',      icon: 'ti-pencil', durationRecommended: null, qualityRecommended: null }
]
```

---

## ÉTAPE 2 — VALIDATION VISUELLE

### Ce qui s'affiche
Dès que l'utilisateur a entré son sujet (debounce 800ms), l'app appelle Pexels et affiche **9 aperçus visuels** (images ou clips courts) correspondant au sujet. L'utilisateur voit immédiatement la direction visuelle avant de générer quoi que ce soit.

### Options supplémentaires
- **Style visuel** : Réaliste · Cinématique · Anime · Futuriste · Vintage · Nature · Graphique
- **Ton lumineux** : Dramatique · Ensoleillé · Sombre/Mystérieux · Neutre · Chaud · Froid
- **Mouvement de caméra** : Statique · Lent zoom · Pan · Dolly avant · Dynamique/Cut rapide

Ces choix sont injectés dans le prompt de chaque scène envoyé à fal.ai.

### Implémentation
```typescript
// src/lib/pexels.ts
async function getVisualPreview(
  subject: string,
  style: string
): Promise<Array<{ url: string, thumbnail: string, type: 'photo' | 'video' }>>
// → appelle https://api.pexels.com/v1/search + /videos/search
// → retourne 9 résultats mixtes
// → appelé côté serveur : GET /api/visual-preview?subject=volcans&style=cinematic
// → cache 30 min côté serveur
```

---

## ÉTAPE 3 — PHOTO DE RÉFÉRENCE (OPTIONNEL)

### Logique exacte
```
Si l'utilisateur uploade une photo :
  → isPhotoUpload = true
  → customReferenceImageUrl = URL R2 après upload
  → generateImages = false (DALL-E désactivé pour toutes les scènes)
  → Kling reçoit customReferenceImageUrl comme image de référence (image-to-video)
  → Crédits DALL-E NON débités (économie de 21 crédits sur Cinema 30s)

Si pas de photo uploadée :
  → Standard/Premium : text-to-video (pas de DALL-E)
  → Cinema : DALL-E génère les images de référence (7 crédits par image)
```

### Route upload
```typescript
// POST /api/jobs/upload-reference
// Multipart form-data — fichier max 10 Mo
// Types acceptés : image/jpeg, image/png, image/webp
// → Upload vers R2 dans /tmp/{sessionId}/reference.jpg
// → Retourne { url: string }
// → URL valable 2h (sera attachée au job lors du lancement)
```

---

## ÉTAPE 4 — AUDIO (TROIS COUCHES INDÉPENDANTES)

### Couche 1 — Voix off (deux options)

**Option A : ElevenLabs** (premium)
- 3 000+ voix disponibles
- Filtres : genre (masculin/féminin/neutre), langue (32), ton (autoritaire/doux/énergique/narratif)
- Prévisualisation 3 secondes au survol de chaque voix
- Clonage de voix (Creator Pro+)
- Modèle : Flash v2.5 (Standard/Premium) ou Multilingual v3 (Cinema)

**Option B : Google Cloud TTS** (gratuit)
- 1 000 000 caractères/mois gratuits (WaveNet)
- 380+ voix, 50+ langues
- Prévisualisation disponible
- Usage recommandé : plan free, tests, langues rares
- Si choisi → pas de débit crédits ElevenLabs

```typescript
// src/lib/google-tts.ts
// Utiliser Google Cloud Text-to-Speech API
// Free tier : 1M chars/mois WaveNet, 4M chars/mois Standard
// SDK : @google-cloud/text-to-speech
// Voix listées via : GET /api/voices?provider=google&language=fr-FR

async function generateVoiceoverGoogle(
  text: string,
  voiceName: string,  // ex: 'fr-FR-Wavenet-D'
  languageCode: string
): Promise<Buffer>
```

### Couche 2 — Musique de fond (Pixabay gratuit)

```typescript
// src/lib/pixabay.ts — MUSIQUE

// Types de musique disponibles sur Pixabay API :
// ?media_type=music&q=epic+background
// ?media_type=music&q=chill+ambient
// etc.

const MUSIC_MOODS = [
  { id: 'epic',       label: 'Épique / Dramatique',  query: 'epic orchestral dramatic' },
  { id: 'chill',      label: 'Chill / Relaxant',      query: 'chill ambient relaxing' },
  { id: 'corporate',  label: 'Corporate / Pro',       query: 'corporate upbeat professional' },
  { id: 'fun',        label: 'Fun / Énergie',         query: 'upbeat fun energetic' },
  { id: 'mysterious', label: 'Mystérieux / Sombre',   query: 'mysterious dark suspense' },
  { id: 'action',     label: 'Action / Intense',      query: 'action intense fast' },
  { id: 'emotional',  label: 'Émotionnel / Inspirant', query: 'emotional inspiring piano' }
]

// Sélection automatique par Claude selon le ton du storyboard
// OU sélection manuelle par l'utilisateur avec prévisualisation 5s
// Balance audio : slider 0-100 (défaut voix=80, musique=20)

async function getPixabayMusic(mood: string): Promise<{ url: string, title: string }>
```

### Couche 3 — Effets sonores (Pixabay 120k+ SFX, gratuit)

Pixabay propose 120 000+ effets sonores royalty-free pour usage commercial sans attribution requise.

```typescript
// src/lib/pixabay.ts — EFFETS SONORES

// Claude analyse chaque scène et détermine le SFX approprié
// Exemples : transition entre scènes = whoosh, chiffre annoncé = impact, etc.

const SFX_CATEGORIES = {
  transition: 'whoosh swoosh transition',
  impact:     'impact hit dramatic',
  reveal:     'reveal magic sparkle',
  ambient:    'crowd nature ambiance',
  notification: 'ping notification alert'
}

// Niveaux : désactivé / subtil (volume 10%) / normal (20%) / intense (35%)
// SFX inséré par FFmpeg au bon timestamp selon le montage

async function getPixabaySFX(category: string): Promise<{ url: string }>
```

---

## ÉTAPE 5 — PARAMÈTRES DE PRODUCTION

### Qualité vidéo
```
Standard  → Hailuo (fal-ai/minimax/video-01) — 7 cr/s
Premium   → Kling Standard (fal-ai/kling-video/v2.1/standard) — 14 cr/s
Cinema    → Kling Pro (fal-ai/kling-video/v2.1/pro) — 19 cr/s
```

### Ratios supportés — tous providers confondus

Sources vérifiées :

Hailuo 02 supporte : 9:16, 16:9, 1:1, 2:3, 3:2, 3:4, 4:3. Kling 2.1 supporte : 9:16, 16:9, 1:1.

```typescript
// Ratios disponibles selon le provider sélectionné
const RATIOS_BY_PROVIDER = {
  hailuo: ['9:16', '16:9', '1:1', '4:3', '3:4', '2:3'],   // Hailuo 02 — le plus large
  kling_standard: ['9:16', '16:9', '1:1'],
  kling_pro: ['9:16', '16:9', '1:1'],
  wan: ['9:16', '16:9', '1:1']
}

// Ratios affichés dans l'UI avec leur usage suggéré :
const RATIO_LABELS = {
  '9:16':  { label: '9:16', usage: 'TikTok · Reels · Shorts', icon: 'phone' },
  '16:9':  { label: '16:9', usage: 'YouTube · Landscape',      icon: 'device-tv' },
  '1:1':   { label: '1:1',  usage: 'Instagram Feed · Carré',   icon: 'square' },
  '4:3':   { label: '4:3',  usage: 'Format classique',         icon: 'rectangle' },
  '3:4':   { label: '3:4',  usage: 'Portrait alternatif',      icon: 'rectangle-vertical' },
  '2:3':   { label: '2:3',  usage: 'Pinterest · Tall portrait',icon: 'rectangle-vertical' }
}

// Si Kling sélectionné et ratio non supporté → afficher message
// "Ce ratio n'est disponible qu'avec Standard (Hailuo)"
```

### Durée
- **15s** : mode AUTO + STUDIO Standard (3 scènes × 5s)
- **30s** : STUDIO tous tiers (3-6 scènes × 5-10s)
- **60s** : STUDIO tous tiers (6 scènes × 10s)

### Captions — Système complet

**Architecture technique :**
```
1. ElevenLabs génère la voix + retourne les timestamps mot par mot (Forced Alignment API)
   OU Google Cloud TTS → timestamps approximatifs calculés (chars/durée)
2. Claude génère un fichier .ASS (Advanced SubStation Alpha) avec animations
3. FFmpeg brûle les captions dans la vidéo avec le filtre `ass=`
```

**Les 6 styles (tous via FFmpeg ASS, coût = 0) :**

```typescript
const CAPTION_STYLES = {
  wordbyword: {
    label: 'Mot par mot',
    description: 'Chaque mot apparaît au rythme exact de la voix',
    // ASS : chaque mot = un évènement dialogue avec timing précis
    assStyle: 'FontName=Arial,Bold=1,FontSize=18,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Alignment=2'
  },
  karaoke: {
    label: 'Karaoké highlight',
    description: 'Texte blanc, mot actif en jaune — style viral TikTok',
    // ASS : utiliser les tags {\k} pour le timing karaoké
    assStyle: 'karaoke_override_tags'
  },
  bold_center: {
    label: 'Bold Center',
    description: '3-5 mots par bloc, gras centré, lisible sur tous fonds',
    assStyle: 'FontName=Arial Black,Bold=1,FontSize=22,PrimaryColour=&HFFFFFF,Outline=3'
  },
  boxed: {
    label: 'Boxed',
    description: 'Fond semi-transparent derrière le texte — style cinéma',
    assStyle: 'FontName=Arial,FontSize=16,BackColour=&H80000000,BorderStyle=4'
  },
  minimal: {
    label: 'Minimal',
    description: 'Texte fin discret en bas — visuels au premier plan',
    assStyle: 'FontName=Arial,FontSize=14,PrimaryColour=&HFFFFFF,Outline=1,Alignment=2'
  },
  none: {
    label: 'Désactivé',
    description: 'Aucune caption brûlée dans la vidéo'
  }
}
```

**Options supplémentaires captions :**
```typescript
const CAPTION_OPTIONS = {
  fontFamily: ['Arial Black', 'Impact', 'Montserrat', 'Roboto'],
  fontSize: ['small', 'medium', 'large'],  // 14 / 18 / 22px
  position: ['top', 'center', 'bottom'],
  highlightColor: ['yellow', 'white', 'cyan', 'pink'],  // couleur du mot actif (karaoké)
  autoEmoji: boolean  // Claude insère des émojis pertinents dans les captions
}
```

### Options additionnelles (étape 5)

```typescript
// Transitions entre scènes
const TRANSITIONS = {
  cut:    'Coupe franche — rythme rapide TikTok',
  fade:   'Fondu enchaîné — ton narratif',
  zoom:   'Zoom out/in — effet dynamique',
  slide:  'Glissement latéral — storytelling',
  flash:  'Flash blanc — énergie maximale'
}

// FPS selon usage
const FPS_OPTIONS = {
  24: '24fps — Cinématique, film',
  30: '30fps — Standard réseaux sociaux (défaut)',
  60: '60fps — Ultra fluide, gaming/sport'
}

// Langue des captions (si différente de la voix)
// ex: voix en français, captions en anglais pour audience internationale

// Variantes (option avancée)
// Générer 2 ou 3 versions du même sujet avec angles différents
// Coût = N × coût unitaire
```

---

## ÉTAPE 6 — RÉCAPITULATIF ET LANCEMENT

### Ce qui s'affiche avant lancement
```
┌─────────────────────────────────────────────────┐
│  Récapitulatif de ta vidéo                       │
│                                                  │
│  Sujet : "Top 5 faits insolites sur l'espace"   │
│  Format : Top 5 Faits · 60s · Standard          │
│  Ratio : 9:16 (TikTok/Reels)                    │
│  Voix : Emma (ElevenLabs, français)             │
│  Musique : Épique (Pixabay, prévisualisation ▶)  │
│  SFX : Normal                                   │
│  Captions : Karaoké highlight                   │
│                                                  │
│  Coût estimé : 432 crédits                      │
│  ├ Vidéo Hailuo 60s    : 420 crédits            │
│  ├ ElevenLabs voix     :   8 crédits            │
│  └ Claude storyboard   :   4 crédits            │
│                                                  │
│  Solde après : 568 crédits                      │
│                                                  │
│  Publier sur : TikTok ✓  YouTube ✓              │
│  Programmé : Demain 18:00                       │
│                                                  │
│  [← Modifier]        [🎬 Lancer la génération]  │
└─────────────────────────────────────────────────┘
```

### Actions disponibles
- **Modifier** : retourne à n'importe quelle étape sans perdre les autres choix
- **Lancer** : réserve les crédits + enqueue le job Trigger.dev
- **Sauvegarder comme preset** : enregistre tous les paramètres pour les prochaines vidéos
- **Ajouter une variante** : génère 2-3 versions différentes (× coût)

---

## MODIFICATIONS DU PIPELINE TECHNIQUE

### src/lib/pipeline/generate-scene.ts — version complète

```typescript
async function generateScene(
  scene: Scene,
  job: Job,
  config: PricingConfig
): Promise<string> {

  const tier = config.videoQualities[job.videoQuality!]

  // Construire le prompt avec les options visuelles
  const visualPrompt = buildScenePrompt({
    basePrompt: scene.visualPrompt,
    style: job.visualStyle,        // 'cinematic', 'anime', etc.
    lighting: job.lightingTone,    // 'dramatic', 'sunny', etc.
    camera: job.cameraMovement,    // 'slow_zoom', 'pan', etc.
    aspectRatio: job.aspectRatio,
    fps: job.fps ?? 30
  })

  // Provider selon qualité
  const provider = tier.provider

  // Mode : photo uploadée ou génération IA
  if (job.customReferenceImageUrl) {
    // Image-to-video avec la photo de l'utilisateur
    // DALL-E n'est JAMAIS appelé
    return await falImageToVideo({
      model: provider,
      imageUrl: job.customReferenceImageUrl,
      prompt: visualPrompt,
      duration: scene.durationSeconds,
      aspectRatio: job.aspectRatio ?? '9:16',
      fps: job.fps ?? 30
    })
  }

  if (job.videoQuality === 'cinema') {
    // Cinema sans photo uploadée : DALL-E génère l'image de référence
    const imageUrl = await generateDalleImage(scene.visualPrompt + ', ' + job.visualStyle)
    return await falImageToVideo({
      model: provider,
      imageUrl,
      prompt: visualPrompt,
      duration: scene.durationSeconds,
      aspectRatio: job.aspectRatio ?? '9:16',
      fps: job.fps ?? 30
    })
  }

  // Standard/Premium : text-to-video
  return await falTextToVideo({
    model: provider,
    prompt: visualPrompt,
    duration: scene.durationSeconds,
    aspectRatio: job.aspectRatio ?? '9:16',
    fps: job.fps ?? 30
  })
}
```

### src/lib/pipeline/generate-voiceover.ts

```typescript
async function generateVoiceover(
  text: string,
  provider: 'elevenlabs' | 'google',
  voiceId: string,
  language: string
): Promise<{ audioBuffer: Buffer, wordTimestamps: WordTimestamp[] }> {

  if (provider === 'elevenlabs') {
    const audio = await elevenlabsClient.generate({ text, voiceId, model: 'eleven_flash_v2_5' })
    // ElevenLabs Forced Alignment pour timestamps précis
    const timestamps = await elevenlabsClient.forceAlignment({ audio, text })
    return { audioBuffer: audio, wordTimestamps: timestamps }
  }

  if (provider === 'google') {
    const audio = await googleTTSClient.synthesize({ text, voiceName: voiceId, languageCode: language })
    // Calcul approximatif : chars / vitesse de parole moyenne
    const timestamps = estimateTimestamps(text, audio.duration)
    return { audioBuffer: audio.audioContent, wordTimestamps: timestamps }
  }
}
```

### src/lib/pipeline/assemble-video.ts — avec SFX Pixabay

```typescript
async function assembleVideo(params: {
  scenePaths: string[]
  audioPaths: string[]         // voix off par scène
  bgmPath: string              // musique de fond Pixabay
  sfxPaths: SFXEvent[]         // effets sonores avec timestamps
  wordTimestamps: WordTimestamp[]
  captionStyle: CaptionStyle
  captionOptions: CaptionOptions
  transitions: TransitionType
  audioBalance: { voice: number, music: number }  // défaut: 80/20
}): Promise<string> {

  // 1. Normaliser tous les clips (résolution, fps, codec)
  // 2. Ajouter les transitions entre scènes
  // 3. Concaténer les clips
  // 4. Mixage audio :
  //    - Voix off à volume audioBalance.voice / 100
  //    - BGM Pixabay à volume audioBalance.music / 100
  //    - SFX Pixabay aux timestamps précis à volume sfxIntensity
  // 5. Générer fichier ASS depuis wordTimestamps + captionStyle
  // 6. Brûler les captions avec filtre FFmpeg `ass=`
  // 7. Encoder output final H.264/AAC
}
```

---

## MODIFICATIONS DE LA COLLECTION `jobs` FIREBASE

Ajouter ces champs :

```typescript
{
  // ... champs existants

  // Nouveaux champs issue du flow v3
  visualStyle: 'realistic' | 'cinematic' | 'anime' | 'futuristic' | 'vintage' | 'nature' | 'graphic' | null
  lightingTone: 'dramatic' | 'sunny' | 'dark' | 'neutral' | 'warm' | 'cold' | null
  cameraMovement: 'static' | 'slow_zoom' | 'pan' | 'dolly' | 'dynamic' | null
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:3' | '3:4' | '2:3'
  fps: 24 | 30 | 60
  customReferenceImageUrl: string | null   // photo uploadée par l'utilisateur
  voiceProvider: 'elevenlabs' | 'google'
  voiceId: string
  voiceLanguage: string
  musicMood: string                         // 'epic', 'chill', etc.
  musicUrl: string | null                   // URL Pixabay BGM sélectionnée
  sfxIntensity: 'none' | 'subtle' | 'normal' | 'intense'
  captionStyle: 'wordbyword' | 'karaoke' | 'bold_center' | 'boxed' | 'minimal' | 'none'
  captionFontFamily: string
  captionFontSize: 'small' | 'medium' | 'large'
  captionPosition: 'top' | 'center' | 'bottom'
  captionHighlightColor: string
  captionAutoEmoji: boolean
  transitionStyle: 'cut' | 'fade' | 'zoom' | 'slide' | 'flash'
  audioVoiceBalance: number                 // 0-100 (défaut 80)
  audioMusicBalance: number                 // 0-100 (défaut 20)
}
```

---

## NOUVELLES VARIABLES D'ENVIRONNEMENT

```bash
# Google Cloud TTS (gratuit 1M chars/mois)
GOOGLE_CLOUD_TTS_API_KEY=          # ou utiliser Service Account
GOOGLE_CLOUD_PROJECT_ID=

# Pixabay (déjà prévu, rappel)
PIXABAY_API_KEY=                   # gratuit sur pixabay.com/api
                                   # couvre : musique + SFX + images + vidéos
```

---

## NOUVELLES ROUTES API

```
GET  /api/trending?niche=science&country=FR      # Google Trends
GET  /api/visual-preview?subject=...&style=...   # Pexels preview
POST /api/jobs/upload-reference                  # Upload photo référence
GET  /api/voices?provider=elevenlabs&lang=fr     # Liste voix ElevenLabs
GET  /api/voices?provider=google&lang=fr         # Liste voix Google TTS
GET  /api/voices/preview?voiceId=...&text=...    # Aperçu 3s voix ElevenLabs
GET  /api/music/preview?mood=epic                # Aperçu 5s Pixabay music
GET  /api/sfx/preview?category=impact           # Aperçu Pixabay SFX
```

---

## RÉSUMÉ DES SERVICES AUDIO PIXABAY

Pixabay fournit via une seule API key :

| Usage | Endpoint Pixabay | Gratuit | Volume |
|---|---|---|---|
| BGM (musique de fond) | `?media_type=music` | ✅ | illimité |
| SFX (effets sonores) | `?media_type=sound_effect` | ✅ | 120k+ sons |
| Stock footage fallback | `?media_type=video` | ✅ | illimité |
| Images de référence | `?media_type=photo` | ✅ | illimité |

Une seule clé, quatre usages, zéro coût, usage commercial autorisé sans attribution.

---

**Ce fichier complète `shorts-factory-v2-CREATION-VIDEO.md`. Implémenter ce flow dans la Phase 4 de l'implémentation principale.**
