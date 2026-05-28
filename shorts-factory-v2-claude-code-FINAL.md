# SHORTS FACTORY v2 — Prompt complet pour Claude Code

> **Document unique à donner à Claude Code en début de session.**
> Lis TOUT ce document avant d'écrire la moindre ligne de code.
> Tu implémenteras les features dans l'ordre exact des phases ci-dessous.
> À la fin de chaque phase, tu enregistres ton avancement dans un fichier `PROGRESS.md` à la racine du projet.

---

## 0. RÈGLES DE FONCTIONNEMENT

### Permissions
Tu as l'autorisation de :
- Installer toutes les dépendances nécessaires via `pnpm add` sans demander
- Créer, modifier, supprimer tous les fichiers du projet
- Lancer `pnpm tsc --noEmit`, `pnpm build`, `npx prisma migrate dev`, `npx prisma generate`
- Créer et modifier les migrations Prisma
- Écrire dans `PROGRESS.md` à chaque fin de phase

### Quand demander à l'utilisateur
Tu DOIS t'arrêter et demander UNIQUEMENT pour :
- Les clés API et secrets (Clerk, Stripe, Firebase, fal.ai, etc.)
- Les Price IDs Stripe à créer dans le dashboard
- Une décision business non couverte par ce document
- Toute donnée externe impossible à déduire

### Format de tes questions
Regroupe toutes tes questions en une seule fois en début de phase. Exemple :
> "Pour démarrer la Phase 2, j'ai besoin de : (1) ta clé Clerk publishable, (2) ta clé Clerk secret..."

### Fichier PROGRESS.md
À la fin de chaque phase, mets à jour `PROGRESS.md` avec :
```markdown
## Phase X — [Nom] ✅ TERMINÉE
Date : [date]
Fichiers créés/modifiés : [liste]
Variables d'env ajoutées : [liste]
Prochaine étape : [Phase Y]
Notes : [difficultés rencontrées ou décisions prises]
```

### Ne jamais
- Inventer de fausses valeurs pour les clés API
- Exposer des clés côté client (bundle Next.js)
- Faire UPDATE ou DELETE sur la table `credit_transactions`
- Passer à la phase suivante sans que `pnpm tsc --noEmit` passe sans erreur

---

## 1. VISION DU PROJET

Shorts Factory v2 est un **SaaS multi-utilisateurs** de génération automatique de vidéos courtes (TikTok, YouTube Shorts, Instagram Reels) depuis un simple prompt texte.

### Deux modes de création
- **Mode AUTO** : l'utilisateur configure une "série" (sujet + format + fréquence). L'app génère et publie automatiquement sans intervention. Modèle d'abonnement fixe.
- **Mode STUDIO** : création à la demande avec contrôle total (prompt libre, qualité, durée). Modèle par crédits.

### Rôles
- **Opérateur** (toi) : accès total via dashboard admin. Clés API gérées côté serveur. Crédits illimités pour tests.
- **Utilisateurs finaux** : ne voient jamais les noms des providers IA (Kling, Hailuo, etc.), uniquement Standard / Premium / Cinema.

---

## 2. STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| Framework | Next.js 15 (App Router) | Dernière version stable |
| Langage | TypeScript strict | Sécurité de types |
| Base de données | **Firebase Firestore** (firebase-admin, server-side only) | Demandé explicitement |
| Auth | **Clerk** | Multi-users, composants UI prêts, webhooks |
| Paiements | **Stripe** | Le moins cher en EU (1.5% + 0.25€), pas de frais fixes |
| Jobs background | **Trigger.dev v3** | Pas d'infra Redis, jobs long-running, free tier 5k runs/mois |
| Génération vidéo | **fal.ai** | Un SDK pour tous les providers (Kling, Hailuo, Wan) |
| LLM scénario | **Anthropic Claude** (claude-sonnet-4-20250514) | Meilleur LLM pour la génération créative |
| Génération images | **OpenAI DALL-E 3** | Pour références avatar Cinema |
| Voix off | **ElevenLabs** Flash v2.5 (Standard/Premium) + Multilingual v3 (Cinema) | Meilleure qualité voix IA |
| Musique fond | **Pixabay Music API** (gratuit, par défaut) + **Suno via Apiframe** (option +5 crédits) | Gratuit en défaut |
| Stock fallback | **Pexels API** (gratuit) | Si provider vidéo échoue |
| Tendances | **pytrends / Google Trends** (gratuit) | Suggestions sujets pour séries |
| Assemblage | **FFmpeg** via fluent-ffmpeg | Inchangé |
| Stockage | **Cloudflare R2** (S3-compatible) | Free egress |
| UI | Shadcn/ui + Tailwind CSS | Moderne, accessible |
| Validation | Zod v4 | Schémas stricts |
| Email | Resend | Transactionnel |
| Chiffrement | AES-256-GCM (custom) | Clés API en base |
| Package manager | pnpm | Rapide |
| Déploiement app | Vercel | Natif Next.js |
| Déploiement workers | Trigger.dev Cloud | Inclus SDK |

### Dépendances à installer dès le départ
```bash
pnpm add next react react-dom typescript
pnpm add @clerk/nextjs svix
pnpm add stripe
pnpm add @trigger.dev/sdk @trigger.dev/nextjs
pnpm add firebase firebase-admin
pnpm add @fal-ai/client
pnpm add @anthropic-ai/sdk
pnpm add openai
pnpm add elevenlabs
pnpm add @aws-sdk/client-s3
pnpm add fluent-ffmpeg
pnpm add resend
pnpm add zod
pnpm add swr
pnpm add date-fns
pnpm add sharp

pnpm add -D @types/node @types/react @types/fluent-ffmpeg tsx
pnpm dlx shadcn@latest init
```

---

## 3. VARIABLES D'ENVIRONNEMENT

Créer `.env.local` avec ces variables (les valeurs seront demandées phase par phase) :

```bash
# App
NEXT_PUBLIC_APP_URL=https://shorts-factory.vercel.app
SESSION_SECRET=                        # openssl rand -hex 32 (64 chars hex)

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
ADMIN_EMAIL=                           # ton email Clerk → reçoit role:admin automatiquement

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_CREATOR_MONTHLY=
STRIPE_PRICE_CREATOR_PRO_MONTHLY=
STRIPE_PRICE_STUDIO_MONTHLY=
STRIPE_PRICE_AGENCY_MONTHLY=
STRIPE_PRICE_CREDITS_500=
STRIPE_PRICE_CREDITS_2000=
STRIPE_PRICE_CREDITS_5000=
STRIPE_PRICE_CREDITS_15000=

# Trigger.dev
TRIGGER_SECRET_KEY=
TRIGGER_API_URL=https://api.trigger.dev

# IAs (stockées aussi chiffrées dans Firebase via Setup Wizard)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
FAL_KEY=
ELEVENLABS_API_KEY=
PIXABAY_API_KEY=                       # gratuit sur pixabay.com/api
PEXELS_API_KEY=                        # gratuit sur pexels.com/api
APIFRAME_KEY=                          # pour Suno music (optionnel)

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=shorts-factory-v2
R2_PUBLIC_BASE_URL=

# OAuth plateformes
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=

# Email
RESEND_API_KEY=
ALERT_EMAIL=
```

---

## 4. STRUCTURE FIREBASE FIRESTORE

**Toutes les opérations Firebase se font UNIQUEMENT côté serveur via firebase-admin.**
Jamais d'accès direct Firebase côté client.

### Collections

#### `users/{userId}` (userId = Clerk user ID)
```typescript
{
  email: string
  name: string | null
  imageUrl: string | null
  clerkUserId: string
  stripeCustomerId: string | null
  
  // Crédits
  creditsBalance: number              // CACHE — recalculable depuis le ledger
  totalCreditsEarned: number
  totalCreditsSpent: number
  
  // Plan
  plan: 'free' | 'starter_creator' | 'creator_pro' | 'studio' | 'agency'
  subscriptionStatus: 'none' | 'active' | 'past_due' | 'canceled'
  subscriptionId: string | null
  subscriptionPeriodEnd: Timestamp | null
  monthlyResetAt: Timestamp | null
  
  // Rôle
  role: 'user' | 'admin'
  isAdminTestMode: boolean            // si true → crédits illimités, pas de débit réel
  
  // Sécurité
  bannedAt: Timestamp | null
  deletedAt: Timestamp | null
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `credit_transactions/{txId}` — LEDGER IMMUABLE
```typescript
// RÈGLE ABSOLUE : jamais de update() ni delete() sur cette collection
{
  userId: string
  type: 
    | 'PURCHASE'              // achat pack crédits
    | 'SUBSCRIPTION_GRANT'    // refill mensuel abonnement
    | 'CONSUMPTION'           // débit après génération vidéo réussie
    | 'RESERVATION'           // réservation avant lancement job (négatif)
    | 'RESERVATION_RELEASE'   // libération réservation (positif)
    | 'REFUND'                // remboursement (échec job)
    | 'BONUS'                 // crédits offerts (bienvenue, etc.)
    | 'ADMIN_ADJUSTMENT'      // ajustement manuel par l'admin
  amount: number              // positif = crédit, négatif = débit
  balanceAfter: number        // snapshot pour audit
  relatedJobId: string | null
  stripeEventId: string | null        // pour idempotence webhook
  stripePaymentId: string | null
  description: string
  metadata: Record<string, any>
  createdAt: Timestamp
}
```

#### `jobs/{jobId}`
```typescript
{
  userId: string | null         // null = job admin legacy
  userPrompt: string
  templateId: string | null     // ID du template utilisé
  status: 
    | 'QUEUED' | 'PROCESSING_STORYBOARD' | 'GENERATING_SCENES'
    | 'ASSEMBLING' | 'READY' | 'PUBLISHING' | 'DONE' | 'FAILED'
  creationMode: 'FULL_AUTO' | 'MANUAL_SCRIPT' | 'IMPORT_CLIP' | 'UPLOAD_PUBLISH'
  videoQuality: 'standard' | 'premium' | 'cinema' | null
  videoProviderId: string | null  // provider technique réel (hailuo, kling_standard, etc.)
  durationSeconds: number | null
  storyboard: Storyboard | null
  sceneOverrides: Record<string, any> | null
  customAudioUrl: string | null
  useSunoMusic: boolean           // true = musique Suno générée (-5 crédits)
  avatarId: string | null         // avatar lié à la série
  finalVideoUrl: string | null
  thumbnailUrl: string | null
  estimatedCredits: number | null
  actualCredits: number | null
  reservationTxId: string | null
  triggerRunId: string | null
  errorMsg: string | null
  isAdminTest: boolean            // true = pas de débit crédits
  // Métriques coût opérateur (pour le dashboard admin)
  costBreakdown: {
    claudeUsd: number
    videoUsd: number
    elevenLabsUsd: number
    dalleUsd: number
    sunoUsd: number
    totalUsd: number
    totalEur: number
  } | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `series/{seriesId}` — Mode AUTO
```typescript
{
  userId: string
  name: string                    // "Faits Insolites avec Maya"
  avatarId: string | null
  voiceId: string                 // ElevenLabs voice ID
  templateId: string              // format narratif
  topicPrompt: string             // sujet général "Histoire mondiale"
  videoQuality: 'standard' | 'premium' | 'cinema'
  videoDurationSeconds: number    // 20 ou 30
  frequency: 'daily' | 'twice_weekly' | 'three_weekly' | 'weekly'
  daysOfWeek: number[]
  timeOfDay: string               // "18:00"
  timezone: string                // "Europe/Paris"
  platforms: ('youtube' | 'tiktok' | 'instagram')[]
  captionStyle: 'wordbyword' | 'karaoke' | 'bold_center' | 'boxed' | 'minimal'
  useSunoMusic: boolean
  isActive: boolean
  lastRunAt: Timestamp | null
  nextRunAt: Timestamp | null
  totalVideosGenerated: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `avatars/{avatarId}`
```typescript
{
  userId: string
  name: string                    // "Maya", "Alex"
  type: 'generated_ai' | 'from_photo' | 'manual_description'
  characterDescription: string    // "femme 30 ans, cheveux noirs, style professionnel"
  referenceImageUrls: string[]    // 1 à 4 URLs R2 (générées par DALL-E)
  voiceId: string | null          // ElevenLabs voice ID lié
  createdAt: Timestamp
}
```

#### `pricing_config/current` — Config éditable par l'admin
```typescript
{
  videoQualities: {
    standard: { 
      provider: 'hailuo',
      fallback: 'hailuo', 
      label: 'Standard',
      description: 'Rapide et économique',
      perSecondCostUsd: 0.04,
      perSecondCredits: 7         // 7 crédits/s = 0.07€/s, coût 0.037€, marge ~47%
    },
    premium: { 
      provider: 'kling_standard',
      fallback: 'wan',
      label: 'Premium',
      description: 'Qualité supérieure 4K',
      perSecondCostUsd: 0.084,
      perSecondCredits: 14        // 14 crédits/s = 0.14€/s, coût 0.077€, marge ~45%
    },
    cinema: {
      provider: 'kling_pro',
      fallback: 'kling_standard',
      label: 'Cinema',
      description: 'Qualité professionnelle 4K',
      perSecondCostUsd: 0.112,
      perSecondCredits: 19        // 19 crédits/s = 0.19€/s, coût 0.103€, marge ~46%
    }
  },
  
  fixedCosts: {
    storyboardCredits: 2,         // génération Claude (~0.03€, 2 crédits = 0.02€)
    dalleImageCredits: 7,         // par image DALL-E (~0.037€)
    elevenlabsFlashPer1kChars: 10, // ~0.103$ per 1k chars
    elevenlabsMultiPer1kChars: 20,
    sunoMusicCredits: 5,          // option Suno music (~0.05€)
    importClipCredits: 15,
    uploadPublishCredits: 0,
  },
  
  // Plans d'abonnement
  plans: {
    free: {
      monthlyCredits: 0,
      priceEur: 0,
      autoSeriesMax: 0,
      autoVideosPerSeriesPerWeek: 0,
      autoMaxDurationSeconds: 0,
      studioCreditsBonus: 0,
      allowedQualities: ['standard'],
      maxConcurrentJobs: 1,
      dailyJobsLimit: 1,
      voiceCloning: false,
      sunoMusic: false,
      multiLanguage: false,
      avatarAI: false,
      trendingSuggestions: false,
      thumbnailAI: false,
      priorityQueue: false,
      teamSeats: 1,
      stripePriceIdEnv: null
    },
    starter_creator: {
      monthlyCredits: 0,           // AUTO = inclus dans le plan, pas de crédits mensuels
      priceEur: 19.99,
      autoSeriesMax: 1,
      autoVideosPerSeriesPerWeek: 3,
      autoMaxDurationSeconds: 30,
      studioCreditsBonus: 50,
      allowedQualities: ['standard'],
      maxConcurrentJobs: 1,
      dailyJobsLimit: 5,
      voiceCloning: false,
      sunoMusic: false,
      multiLanguage: false,
      avatarAI: true,
      trendingSuggestions: true,
      thumbnailAI: false,
      priorityQueue: false,
      teamSeats: 1,
      stripePriceIdEnv: 'STRIPE_PRICE_CREATOR_MONTHLY'
    },
    creator_pro: {
      monthlyCredits: 0,
      priceEur: 34.99,
      autoSeriesMax: 3,
      autoVideosPerSeriesPerWeek: 7, // quotidien
      autoMaxDurationSeconds: 30,
      studioCreditsBonus: 200,
      allowedQualities: ['standard', 'premium'],
      maxConcurrentJobs: 2,
      dailyJobsLimit: 15,
      voiceCloning: true,
      sunoMusic: true,
      multiLanguage: true,
      avatarAI: true,
      trendingSuggestions: true,
      thumbnailAI: true,
      priorityQueue: false,
      teamSeats: 1,
      stripePriceIdEnv: 'STRIPE_PRICE_CREATOR_PRO_MONTHLY'
    },
    studio: {
      monthlyCredits: 5000,
      priceEur: 44.99,
      autoSeriesMax: 0,
      autoVideosPerSeriesPerWeek: 0,
      autoMaxDurationSeconds: 0,
      studioCreditsBonus: 0,
      allowedQualities: ['standard', 'premium', 'cinema'],
      maxConcurrentJobs: 3,
      dailyJobsLimit: 50,
      voiceCloning: true,
      sunoMusic: true,
      multiLanguage: true,
      avatarAI: true,
      trendingSuggestions: true,
      thumbnailAI: true,
      priorityQueue: true,
      teamSeats: 1,
      stripePriceIdEnv: 'STRIPE_PRICE_STUDIO_MONTHLY'
    },
    agency: {
      monthlyCredits: 3000,
      priceEur: 79.99,
      autoSeriesMax: 10,
      autoVideosPerSeriesPerWeek: 14, // 2/jour
      autoMaxDurationSeconds: 30,
      studioCreditsBonus: 0,
      allowedQualities: ['standard', 'premium', 'cinema'],
      maxConcurrentJobs: 5,
      dailyJobsLimit: 200,
      voiceCloning: true,
      sunoMusic: true,
      multiLanguage: true,
      avatarAI: true,
      trendingSuggestions: true,
      thumbnailAI: true,
      priorityQueue: true,
      teamSeats: 3,
      stripePriceIdEnv: 'STRIPE_PRICE_AGENCY_MONTHLY'
    }
  },
  
  // Packs crédits supplémentaires
  creditPacks: [
    { id: 'pack_500',   credits: 500,   priceEur: 4.99,  stripePriceIdEnv: 'STRIPE_PRICE_CREDITS_500'   },
    { id: 'pack_2000',  credits: 2000,  priceEur: 17.99, stripePriceIdEnv: 'STRIPE_PRICE_CREDITS_2000'  },
    { id: 'pack_5000',  credits: 5000,  priceEur: 39.99, stripePriceIdEnv: 'STRIPE_PRICE_CREDITS_5000'  },
    { id: 'pack_15000', credits: 15000, priceEur: 99.99, stripePriceIdEnv: 'STRIPE_PRICE_CREDITS_15000' }
  ],
  
  creditExpiration: {
    packExpiresDays: null,
    subscriptionCarryOverCap: 3    // max 3× monthlyCredits accumulés
  },
  
  updatedAt: Timestamp,
  updatedBy: string
}
```

#### `api_keys/current` — Clés API chiffrées (accès admin uniquement)
```typescript
{
  anthropic: { value: string, enabled: boolean }   // chiffré AES-256-GCM
  openai:    { value: string, enabled: boolean }
  fal:       { value: string, enabled: boolean }
  elevenlabs:{ value: string, enabled: boolean }
  pixabay:   { value: string, enabled: boolean }
  pexels:    { value: string, enabled: boolean }
  apiframe:  { value: string, enabled: boolean }
  resend:    { value: string, enabled: boolean }
  r2: {
    accountId:       string   // chiffré
    accessKeyId:     string
    secretAccessKey: string
    bucket:          string
    publicBaseUrl:   string
  }
  updatedAt: Timestamp
}
```

#### `oauth_tokens/{platform}` (youtube | tiktok | instagram) — par user
```typescript
// Document path : oauth_tokens/{userId}_{platform}
{
  userId: string
  platform: string
  accessToken: string    // chiffré
  refreshToken: string | null
  expiresAt: Timestamp | null
  meta: Record<string, any>
  updatedAt: Timestamp
}
```

#### `webhook_events/{eventId}` — idempotence
```typescript
{
  source: 'clerk' | 'stripe'
  processedAt: Timestamp
}
```

#### `credit_snapshots/{id}` — suivi des soldes API pour le dashboard admin
```typescript
{
  service: string         // 'fal', 'elevenlabs', 'anthropic', etc.
  balanceUsd: number
  estimatedVideosRemaining: {
    standard_30s: number
    premium_30s: number
    cinema_30s: number
  }
  capturedAt: Timestamp
}
```

#### `alerts/{id}`
```typescript
{
  service: string
  level: 'warning' | 'critical'
  message: string
  acknowledged: boolean
  createdAt: Timestamp
}
```

#### `system_settings/config`
```typescript
{
  setupCompleted: boolean
  adminEmail: string | null
  updatedAt: Timestamp
}
```

---

## 5. CALCUL DES CRÉDITS — LOGIQUE EXACTE

### Règle de conversion
**1 crédit = 0.01€ (1 centime)**

### Estimation d'un job
```typescript
// src/lib/pricing.ts
async function estimateJobCost(options: {
  creationMode: string
  videoQuality: 'standard' | 'premium' | 'cinema'
  durationSeconds: number
  ttsProvider: 'elevenlabs_flash' | 'elevenlabs_multi'
  voiceoverCharacters: number    // approximation basée sur le texte entré
  generateImages: boolean        // true pour Cinema
  sceneCount: number             // généralement 6 scènes max
  useSunoMusic: boolean
}): Promise<{ totalCredits: number, breakdown: Record<string, number> }>
```

### Exemples de calcul exact

**Vidéo Standard 30s (6 scènes × 5s) :**
- Hailuo : 30s × 7 cr/s = 210 crédits
- ElevenLabs Flash (~500 chars) : 500 × 0.01 cr/char = 5 crédits
- Claude storyboard : 2 crédits
- BGM Pixabay : 0 crédits
- **Total : 217 crédits ≈ 2.17€** (coût opérateur ~1.18€, marge ~46%)

**Vidéo Standard 60s (6 scènes × 10s) :**
- Hailuo : 60s × 7 cr/s = 420 crédits
- ElevenLabs Flash (~900 chars) : 9 crédits
- Claude : 2 crédits
- **Total : 431 crédits ≈ 4.31€** (coût opérateur ~2.38€, marge ~45%)

**Vidéo Premium 30s :**
- Kling Standard : 30s × 14 cr/s = 420 crédits
- ElevenLabs Flash : 5 crédits
- Claude : 2 crédits
- **Total : 427 crédits ≈ 4.27€** (coût opérateur ~2.45€, marge ~43%)

**Vidéo Premium 60s :**
- Kling Standard : 60s × 14 cr/s = 840 crédits
- ElevenLabs Flash : 9 crédits
- Claude : 2 crédits
- **Total : 851 crédits ≈ 8.51€** (coût opérateur ~4.81€, marge ~43%)

**Vidéo Cinema 30s :**
- Kling Pro : 30s × 19 cr/s = 570 crédits
- ElevenLabs Multilingual (~500 chars) : 500 × 0.02 cr/char = 10 crédits
- Claude : 2 crédits
- DALL-E (4 images ref) : 4 × 7 = 28 crédits
- **Total : 610 crédits ≈ 6.10€** (coût opérateur ~3.34€, marge ~45%)

**Vidéo Cinema 60s :**
- Kling Pro : 60s × 19 cr/s = 1140 crédits
- ElevenLabs Multi : 18 crédits
- Claude : 2 crédits
- DALL-E : 28 crédits
- **Total : 1188 crédits ≈ 11.88€** (coût opérateur ~6.57€, marge ~45%)

**Option Suno music (tous types) :** +5 crédits

**Vidéo AUTO (incluse dans plan, PAS de débit crédits) :**
- Qualité Standard 20-30s
- Le coût est absorbé par l'abonnement (~0.80-1.18€ par vidéo)
- **Pas de déduction de crédits Studio pour ces vidéos**

### Fonction applyCreditTransaction
```typescript
// src/lib/credits.ts
// RÈGLE : cette fonction est la seule qui modifie les crédits
// Elle utilise une transaction Firestore atomique
// Le ledger est IMMUABLE : jamais de update() ou delete()

async function applyCreditTransaction(params: {
  userId: string
  type: TxType
  amount: number           // positif = crédit, négatif = débit
  description: string
  relatedJobId?: string
  stripeEventId?: string  // pour idempotence
  metadata?: Record<string, any>
  bypassBalanceCheck?: boolean  // true pour l'admin en test mode
}): Promise<{ balanceAfter: number, transactionId: string }>

// Implémentation avec adminDb.runTransaction() :
// 1. Vérifier idempotence si stripeEventId fourni
// 2. Lire le user en transaction
// 3. Si bypassBalanceCheck=false ET amount<0 ET newBalance<0 → throw InsufficientCreditsError
// 4. Créer la transaction ledger (jamais update/delete)
// 5. Update user.creditsBalance + compteurs
// 6. Retourner { balanceAfter, transactionId }
```

### Estimation vidéos restantes pour le dashboard admin
```typescript
// src/lib/admin-stats.ts
async function estimateRemainingVideos(
  currentFalBalanceUsd: number,
  currentElevenLabsBalanceUsd: number
): Promise<{
  standardVideos30s: number
  standardVideos60s: number
  premiumVideos30s: number
  premiumVideos60s: number
  cinemaVideos30s: number
  cinemaVideos60s: number
  bottleneck: 'fal' | 'elevenlabs' | 'balanced'
}> {
  // Coûts par vidéo (USD)
  const costs = {
    standard30s: { fal: 1.20, el: 0.05 },
    standard60s: { fal: 2.40, el: 0.09 },
    premium30s:  { fal: 2.52, el: 0.05 },
    premium60s:  { fal: 5.04, el: 0.09 },
    cinema30s:   { fal: 3.36, el: 0.10 },
    cinema60s:   { fal: 6.72, el: 0.17 },
  }
  // Pour chaque type : min(balanceFal / costFal, balanceEL / costEL)
}
```

---

## 6. PROVIDERS VIDÉO

Tous via **fal.ai SDK**. L'utilisateur final ne voit jamais ces noms.

| ID interne | Modèle fal.ai | Usage | Coût/s |
|---|---|---|---|
| `hailuo` | `fal-ai/minimax/video-01` | Standard | $0.04 |
| `kling_standard` | `fal-ai/kling-video/v2.1/standard` | Premium | $0.084 |
| `kling_pro` | `fal-ai/kling-video/v2.1/pro` | Cinema | $0.112 |
| `wan` | `fal-ai/wan-i2v` | Fallback Premium | $0.07 |

### Fallbacks automatiques
```
Standard : hailuo → pexels_stock (si hailuo fail)
Premium  : kling_standard → wan → pexels_stock
Cinema   : kling_pro → kling_standard → pexels_stock
```

Si pexels_stock est utilisé : rembourser la différence de crédits au user.

---

## 7. TEMPLATES VIRAUX

Stocker dans `src/data/templates.ts` (pas en base, données statiques) :

```typescript
export const TEMPLATES = [
  {
    id: 'top5-facts',
    name: 'Top 5 Faits',
    icon: 'ti-list-numbers',
    durationRecommended: 60,
    qualityRecommended: 'standard',
    systemPromptOverride: `
      Génère un scénario "Top 5 faits surprenants sur : {subject}".
      Structure : Hook choc (5s) → Fait 5 (10s) → Fait 4 (10s) → Fait 3 (10s) → Fait 2 (10s) → Fait 1 le plus fou (10s) → CTA (5s).
      Ton : éducatif, rythmé, phrases courtes max 15 mots.
      Retourne UNIQUEMENT le JSON storyboard sans markdown.
    `
  },
  {
    id: 'myth-reality',
    name: 'Mythe vs Réalité',
    icon: 'ti-arrows-exchange',
    durationRecommended: 30,
    qualityRecommended: 'standard',
    systemPromptOverride: `...`
  },
  {
    id: 'story-drama',
    name: 'Histoire Vraie',
    icon: 'ti-movie',
    durationRecommended: 60,
    qualityRecommended: 'premium',
    systemPromptOverride: `...`
  },
  {
    id: 'explain-60s',
    name: 'Explication 60s',
    icon: 'ti-bulb',
    durationRecommended: 60,
    qualityRecommended: 'standard',
    systemPromptOverride: `...`
  },
  {
    id: 'before-after',
    name: 'Avant / Après',
    icon: 'ti-arrows-right-left',
    durationRecommended: 30,
    qualityRecommended: 'premium',
    systemPromptOverride: `...`
  },
  {
    id: 'free',
    name: 'Prompt libre',
    icon: 'ti-pencil',
    durationRecommended: null,
    qualityRecommended: null,
    systemPromptOverride: null
  }
]
```

---

## 8. ARCHITECTURE APPLICATIVE

```
src/
  app/
    (public)/                     # Pages publiques
      page.tsx                    # Landing page
      pricing/page.tsx
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
      legal/
        terms/page.tsx
        privacy/page.tsx

    (app)/                        # Dashboard utilisateur (auth requise)
      layout.tsx                  # Vérifie auth Clerk + check banni + header + sidebar
      dashboard/page.tsx          # Solde, dernières vidéos, CTA
      create/page.tsx             # Création vidéo (Studio mode)
      series/
        page.tsx                  # Mes séries AUTO
        new/page.tsx              # Créer une série
        [id]/page.tsx             # Détail série
      jobs/
        page.tsx                  # Historique vidéos
        [jobId]/page.tsx          # Détail + player + download
      credits/page.tsx            # Solde + historique + achat packs
      billing/page.tsx            # Plan + abonnement + Customer Portal
      profile/page.tsx            # UserProfile Clerk

    (admin)/                      # Dashboard opérateur (role:admin requis)
      layout.tsx                  # Vérifie role:admin
      page.tsx                    # Vue d'ensemble admin
      
      api-keys/page.tsx           # ⚙️ Gestion clés API chiffrées
      pipeline/page.tsx           # ⚙️ Config providers + pricing_config
      platforms/page.tsx          # ⚙️ OAuth YouTube/TikTok/Instagram
      
      # Gestion utilisateurs
      users/
        page.tsx                  # Liste paginée + recherche + stats
        [userId]/page.tsx         # Détail user + historique transactions + actions
      
      # Monitoring
      jobs/page.tsx               # Tous les jobs (tous users)
      transactions/page.tsx       # Ledger complet filtrable
      analytics/page.tsx          # MRR, jobs/jour, coûts API, etc.
      
      # Test mode admin
      test-create/page.tsx        # Créer une vidéo EN MODE TEST (crédits illimités)

  api/
    webhooks/
      clerk/route.ts              # Sync users Clerk → Firebase
      stripe/route.ts             # Paiements (idempotent)
    
    billing/
      checkout-credits/route.ts
      checkout-subscription/route.ts
      portal/route.ts
      plans/route.ts
    
    jobs/
      create/route.ts
      [id]/route.ts
      [id]/status/route.ts        # SSE pour suivi temps réel
    
    series/
      route.ts                    # CRUD séries
      [id]/route.ts
    
    avatars/
      route.ts
      generate/route.ts           # Génère 4 images DALL-E depuis description
    
    credits/
      balance/route.ts
      estimate/route.ts
      transactions/route.ts
    
    trending/route.ts             # Suggestions Google Trends par niche
    
    me/route.ts
    
    # Admin only
    admin/
      users/route.ts
      users/[id]/route.ts
      users/[id]/adjust-credits/route.ts
      pricing/route.ts
      api-keys/route.ts
      analytics/route.ts
      test-job/route.ts           # Job de test sans débit crédits
    
    # OAuth plateformes
    oauth/
      youtube/start/route.ts
      youtube/callback/route.ts
      tiktok/start/route.ts
      tiktok/callback/route.ts
      instagram/start/route.ts
      instagram/callback/route.ts
    
    settings/
      platforms/route.ts
      api-keys/route.ts

  trigger/                        # Trigger.dev tasks
    generate-video.ts             # Task principale de génération
    publish-video.ts              # Task de publication
    scheduler.ts                  # Cron toutes les 15min pour séries AUTO
    index.ts                      # Export de toutes les tasks

  lib/
    firebase-admin.ts             # Client Firestore server-side
    firebase-client.ts            # Client Firebase public (minimal)
    auth.ts                       # requireUser(), requireAdmin()
    crypto.ts                     # AES-256-GCM
    credits.ts                    # applyCreditTransaction() + InsufficientCreditsError
    pricing.ts                    # estimateJobCost() + cache 60s
    fal.ts                        # Wrappers fal.ai par provider
    elevenlabs.ts                 # Client ElevenLabs
    anthropic.ts                  # Client Claude + prompt storyboard
    openai.ts                     # DALL-E
    pixabay.ts                    # BGM gratuit
    pexels.ts                     # Stock footage fallback
    suno.ts                       # Musique IA via Apiframe (optionnel)
    r2.ts                         # Upload/download R2
    stripe.ts                     # Client Stripe + helpers
    resend.ts                     # Emails transactionnels
    ffmpeg.ts                     # Assemblage vidéo
    trends.ts                     # Google Trends via pytrends/unofficial
    api-clients.ts                # getAnthropicClient(), getFalClient(), etc. avec MissingApiKeyError
    admin-stats.ts                # estimateRemainingVideos(), dashboard metrics
    pipeline/
      generate-storyboard.ts
      generate-scene.ts           # Standard / Premium / Cinema
      assemble-video.ts

  types/
    storyboard.ts                 # Zod schema storyboard
    credits.ts
    pricing.ts
    job.ts
    series.ts
    user.ts

  data/
    templates.ts                  # Templates viraux (statique)

  components/
    ui/                           # Shadcn/ui
    credit-balance.tsx            # Solde temps réel (SWR, revalidation 30s)
    job-card.tsx
    quality-selector.tsx          # Standard/Premium/Cinema avec lock si plan insuffisant
    cost-estimator.tsx            # Estimation live debounce 300ms
    api-key-field.tsx             # Champ clé API réutilisable
    series-card.tsx
    avatar-creator.tsx
    caption-style-picker.tsx
    remaining-videos-widget.tsx   # Widget admin : tokens restants + vidéos estimées

  middleware.ts

trigger.config.ts
```

---

## 9. DASHBOARD ADMIN — DÉTAIL COMPLET

### Ce que l'admin peut faire

**Page `/admin` (vue d'ensemble) :**
- Métriques temps réel : users actifs, jobs en cours, revenus du mois, coûts API du mois
- Widget `<RemainingVideosWidget />` : pour CHAQUE service API (fal.ai, ElevenLabs, Anthropic)
  - Solde actuel en USD
  - Estimation du nombre de vidéos restantes possibles par type :
    - "≈ 847 vidéos Standard 30s"
    - "≈ 423 vidéos Standard 60s"
    - "≈ 203 vidéos Premium 60s"
    - "≈ 77 vidéos Cinema 60s"
  - Couleur : vert si >500, orange si 50-500, rouge si <50
  - Bouton "Rafraîchir les soldes" → appelle les APIs pour récupérer les soldes réels
- Alertes actives non acquittées

**Page `/admin/api-keys` :**
- Même logique que v1 : affichage masqué (8 premiers + 4 derniers chars)
- Tester / Sauvegarder / Supprimer / Activer-Désactiver
- Stockage chiffré AES-256-GCM dans `api_keys/current`

**Page `/admin/pipeline` :**
- Édition complète du document `pricing_config/current`
- Formulaire structuré (pas de JSON brut) pour chaque valeur
- Historique des modifications (updatedBy, updatedAt)
- Bouton "Tester l'estimation" : entrer des paramètres → voir le coût calculé en crédits

**Page `/admin/test-create` :**
- Interface identique à `/create` pour l'utilisateur lambda
- Badge rouge "MODE TEST — Crédits illimités" affiché en permanence
- Création via `POST /api/admin/test-job` → `isAdminTest: true` dans Firestore
- Pas de débit de crédits, pas de réservation
- Les coûts réels API sont quand même trackés dans `costBreakdown` pour monitoring
- Affichage du coût réel engendré après génération ("Cette vidéo de test a coûté 1.24€ à l'opérateur")

**Page `/admin/users` :**
- Liste paginée avec recherche par email/ID
- Colonnes : email, plan, crédits, vidéos générées, revenus générés, statut, date inscription
- Clic → page détail utilisateur

**Page `/admin/users/[userId]` :**
- Toutes les infos du user
- Historique complet des transactions (ledger)
- Formulaire "Ajuster les crédits" (raison obligatoire → ADMIN_ADJUSTMENT)
- Toggle "Mode test" pour ce user (crédits illimités)
- Bouton "Bannir" / "Débannir"
- Bouton "Recalculer le solde depuis le ledger"

**Page `/admin/transactions` :**
- Ledger complet de tous les users
- Filtres : type, date, user, montant
- Export CSV

**Page `/admin/analytics` :**
- MRR (Monthly Recurring Revenue) estimé
- Chiffre d'affaires total vs coûts API totaux → marge brute
- Évolution du nombre de jobs/jour
- Top 10 users par consommation
- Distribution des plans
- Taux d'échec des jobs

---

## 10. SYSTÈME DE PAIEMENT STRIPE

### Produits à créer dans le dashboard Stripe

**Abonnements mensuels (recurring, EUR) :**
- Creator : 19.99€/mois → `STRIPE_PRICE_CREATOR_MONTHLY`
- Creator Pro : 34.99€/mois → `STRIPE_PRICE_CREATOR_PRO_MONTHLY`
- Studio : 44.99€/mois → `STRIPE_PRICE_STUDIO_MONTHLY`
- Agency : 79.99€/mois → `STRIPE_PRICE_AGENCY_MONTHLY`

**Packs de crédits (one-time, EUR) :**
- Pack 500 : 4.99€ → `STRIPE_PRICE_CREDITS_500`
- Pack 2000 : 17.99€ → `STRIPE_PRICE_CREDITS_2000`
- Pack 5000 : 39.99€ → `STRIPE_PRICE_CREDITS_5000`
- Pack 15000 : 99.99€ → `STRIPE_PRICE_CREDITS_15000`

**Activer Stripe Tax** pour la TVA UE automatique.

### Webhook `/api/webhooks/stripe` — events à gérer

Tous idempotents via `stripeEventId` dans le ledger.

| Event | Action |
|---|---|
| `checkout.session.completed` (payment) | `applyCreditTransaction(PURCHASE, +credits)` + email confirmation |
| `checkout.session.completed` (subscription) | Update user plan/status + `SUBSCRIPTION_GRANT` immédiat |
| `invoice.paid` | Refill mensuel : `SUBSCRIPTION_GRANT` avec cap (3× monthly credits max) |
| `customer.subscription.updated` | Sync plan/status |
| `customer.subscription.deleted` | Plan → free, crédits conservés |
| `invoice.payment_failed` | Status → past_due + email alerte |
| `charge.dispute.created` | Ban user + alerte critique admin |

### Accès Customer Portal
```typescript
// POST /api/billing/portal
// → stripe.billingPortal.sessions.create()
// → redirect vers URL Stripe
```

---

## 11. INTÉGRATION CLERK

### Webhook `/api/webhooks/clerk`
Vérification signature via `svix`.
Idempotence : check `webhook_events/{svix-id}` avant traitement.

- `user.created` :
  - Créer `users/{userId}` avec `plan: 'free'`, `role: 'user'`, `creditsBalance: 0`
  - Si email === `process.env.ADMIN_EMAIL` ET aucun admin existant → `role: 'admin'`, `isAdminTestMode: true`
  - `applyCreditTransaction(BONUS, +0)` (le plan free offre 0 crédits, seulement la démo 3s)
- `user.updated` → sync email, name, imageUrl
- `user.deleted` → `deletedAt = now()` (ne jamais supprimer pour audit)

### middleware.ts
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublic = createRouteMatcher([
  '/', '/pricing', '/sign-in(.*)', '/sign-up(.*)',
  '/api/webhooks/(.*)', '/legal/(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return
  await auth.protect()
})
```

---

## 12. PIPELINE DE GÉNÉRATION VIDÉO

### Task Trigger.dev `generate-video`

```typescript
// src/trigger/generate-video.ts
export const generateVideoTask = task({
  id: 'generate-video',
  maxDuration: 3600,
  run: async ({ jobId }: { jobId: string }) => {
    const job = await getJob(jobId)
    
    try {
      // 1. STORYBOARD
      await updateJob(jobId, { status: 'PROCESSING_STORYBOARD' })
      const storyboard = job.storyboard ?? await generateStoryboard(job)
      await updateJob(jobId, { storyboard, status: 'GENERATING_SCENES' })
      
      // 2. SCÈNES EN PARALLÈLE
      const scenePaths = await Promise.all(
        storyboard.scenes.map(scene => generateScene(scene, job))
      )
      
      // 3. BGM
      let bgmPath: string
      if (job.useSunoMusic) {
        bgmPath = await generateSunoMusic(storyboard.suggestedMood)
      } else {
        bgmPath = await getPixabayTrack(storyboard.suggestedMood)
      }
      
      // 4. ASSEMBLAGE
      await updateJob(jobId, { status: 'ASSEMBLING' })
      const outputPath = await assembleVideo({
        scenePaths, bgmPath, storyboard, job
      })
      
      // 5. THUMBNAIL
      const thumbnailPath = job.useThumbnailAI
        ? await generateDalleThumbnail(storyboard.title)
        : await extractBestFrame(outputPath)
      
      // 6. UPLOAD R2
      const [finalVideoUrl, thumbnailUrl] = await Promise.all([
        uploadToR2(outputPath, `jobs/${jobId}/final.mp4`),
        uploadToR2(thumbnailPath, `jobs/${jobId}/thumbnail.jpg`)
      ])
      
      // 7. DÉBIT CRÉDITS (si pas mode test)
      if (!job.isAdminTest && job.userId) {
        await applyCreditTransaction({
          userId: job.userId,
          type: 'CONSUMPTION',
          amount: -(job.estimatedCredits ?? 0),
          relatedJobId: jobId,
          description: `Vidéo générée — ${jobId}`
        })
        await applyCreditTransaction({
          userId: job.userId,
          type: 'RESERVATION_RELEASE',
          amount: +(job.estimatedCredits ?? 0),
          relatedJobId: jobId,
          description: 'Libération réservation'
        })
      }
      
      await updateJob(jobId, {
        status: 'READY',
        finalVideoUrl,
        thumbnailUrl,
        actualCredits: job.estimatedCredits,
        costBreakdown: calculateActualCost(job)
      })
      
    } catch (error) {
      // TOUJOURS libérer la réservation en cas d'échec
      if (!job.isAdminTest && job.userId && job.reservationTxId) {
        await applyCreditTransaction({
          userId: job.userId,
          type: 'RESERVATION_RELEASE',
          amount: +(job.estimatedCredits ?? 0),
          relatedJobId: jobId,
          description: 'Libération — échec job'
        })
      }
      
      if (error instanceof MissingApiKeyError) {
        await sendAdminAlert(`Clé API manquante : ${error.service}`)
        await updateJob(jobId, { status: 'FAILED', errorMsg: `Service temporairement indisponible` })
        return // pas de throw → pas de retry
      }
      
      await updateJob(jobId, { status: 'FAILED', errorMsg: error.message })
      throw error
    }
  }
})
```

### generateScene (Standard / Premium / Cinema)

```typescript
// src/lib/pipeline/generate-scene.ts
async function generateScene(scene: Scene, job: Job): Promise<string> {
  const config = await getPricingConfig()
  const tier = config.videoQualities[job.videoQuality!]
  
  try {
    if (job.videoQuality === 'cinema') {
      // Cinema : image de référence + Kling Pro
      const imageUrl = job.avatarId
        ? await getAvatarReferenceImage(job.avatarId)
        : await generateDalleImage(scene.visualPrompt)
      return await falImageToVideo({
        model: tier.provider,
        imageUrl,
        prompt: scene.motionStyle,
        duration: scene.durationSeconds,
        audioPrompt: scene.audioPrompt
      })
    } else {
      // Standard/Premium : text-to-video avec avatar reference si disponible
      const prompt = job.avatarId
        ? await buildPromptWithAvatar(scene.visualPrompt, job.avatarId)
        : scene.visualPrompt
      return await falTextToVideo({
        model: tier.provider,
        prompt,
        duration: scene.durationSeconds,
        audioEnabled: false  // audio géré séparément via ElevenLabs
      })
    }
  } catch (error) {
    // Fallback automatique
    const fallbackProvider = tier.fallback
    logger.warn(`Provider ${tier.provider} failed, trying ${fallbackProvider}`)
    try {
      return await falTextToVideo({ model: fallbackProvider, prompt: scene.visualPrompt, duration: scene.durationSeconds })
    } catch {
      // Dernier recours : stock footage
      logger.warn('All AI providers failed, using Pexels stock footage')
      return await getPexelsStockClip(scene.visualPrompt)
    }
  }
}
```

### Cron séries AUTO

```typescript
// src/trigger/scheduler.ts
export const checkSeriesScheduler = schedules.task({
  id: 'check-series-scheduler',
  cron: '*/15 * * * *',  // toutes les 15 minutes
  run: async () => {
    const now = new Date()
    const dueSeries = await getSeriesDueForGeneration(now)
    
    for (const series of dueSeries) {
      const user = await getUser(series.userId)
      
      // Vérifier crédits uniquement si la vidéo AUTO dépasse le quota gratuit
      // En réalité pour le mode AUTO les vidéos sont "incluses" mais on vérifie
      // que le plan est toujours actif
      if (user.subscriptionStatus !== 'active' && user.plan !== 'free') {
        await pauseSeries(series.id, 'subscription_expired')
        continue
      }
      
      // Vérifier que le plan supporte encore des séries
      const planConfig = config.plans[user.plan]
      if (!planConfig.autoSeriesMax) continue
      
      // Générer le sujet du jour via tendances ou rotation
      const topic = await suggestTopicForSeries(series)
      
      // Créer le job (isAdminTest=false, pas de débit crédits pour AUTO)
      const jobId = await createAutoJob(series, topic)
      await videoQueue.trigger({ jobId })
      
      await updateSeriesAfterRun(series.id, now)
    }
  }
})
```

---

## 13. FEATURES GRATUITES INTÉGRÉES

### Pixabay Music (BGM par défaut, gratuit)
```typescript
// src/lib/pixabay.ts
async function getPixabayTrack(mood: string): Promise<string> {
  // mood → query : 'upbeat' → 'upbeat background music'
  const response = await fetch(
    `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(mood + ' background music')}&video_type=music`
  )
  // Télécharger le fichier MP3 et retourner le chemin local temporaire
}
```

### Pexels Stock Fallback (gratuit)
```typescript
// src/lib/pexels.ts
async function getPexelsStockClip(visualDescription: string): Promise<string> {
  const keywords = await extractKeywords(visualDescription) // via Claude, 2-3 mots
  const response = await fetch(
    `https://api.pexels.com/videos/search?query=${keywords.join('+')}&orientation=portrait`,
    { headers: { Authorization: PEXELS_API_KEY } }
  )
  // Télécharger le clip le plus pertinent
}
```

### Google Trends (suggestions, gratuit)
```typescript
// src/lib/trends.ts
// Utiliser l'API officielle Google Trends (alpha, accès gratuit)
// ou pytrends via un endpoint proxy si l'API officielle n'est pas dispo
async function getTrendingSuggestions(niche: string, country: string): Promise<string[]> {
  // Retourne 5 sujets tendances dans la niche pour la semaine
}
```

### Captions 5 styles (gratuit, FFmpeg)
Les styles sont appliqués au moment de l'assemblage FFmpeg via le filtre `subtitles=` avec les paramètres appropriés.

---

## 14. EMAILS TRANSACTIONNELS (Resend)

Templates à créer dans `src/lib/resend.ts` :

| Email | Déclencheur |
|---|---|
| Bienvenue | `user.created` webhook Clerk |
| Confirmation achat crédits | `checkout.session.completed` Stripe |
| Confirmation abonnement | Souscription réussie |
| Paiement échoué | `invoice.payment_failed` |
| Crédits faibles | Quand `creditsBalance < 50` (max 1x/semaine) |
| Job terminé | Quand `status = READY` (optionnel, activable) |
| Alerte opérateur | `charge.dispute.created` ou `MissingApiKeyError` |

---

## 15. PHASES D'IMPLÉMENTATION

### ⚠️ RÈGLE IMPORTANTE
À la fin de chaque phase :
1. `pnpm tsc --noEmit` doit passer sans erreur
2. Mettre à jour `PROGRESS.md` avec le détail de ce qui a été fait
3. Faire un récap à l'utilisateur : "Phase X terminée. Voici ce qui a été fait... Voici ce que tu dois faire de ton côté avant la phase Y..."

---

### PHASE 0 — Setup du projet ⬜

**Ce que tu fais :**
1. `pnpm create next-app@latest shorts-factory-v2 --typescript --tailwind --app --src-dir --import-alias "@/*"`
2. Installer toutes les dépendances (section 2)
3. Configurer `next.config.ts`
4. Setup Shadcn/ui : `pnpm dlx shadcn@latest init`
5. Créer la structure de dossiers complète (section 8) avec des fichiers vides
6. Configurer `trigger.config.ts`
7. Créer `PROGRESS.md` à la racine
8. Créer `.env.local` avec toutes les variables vides (section 3)
9. Créer `.env.example` (copie sans valeurs)

**Ce que tu demandes à l'utilisateur :**
- Tes clés Firebase (Project ID, client email, private key, variables publiques)
- Session secret : `openssl rand -hex 32`
- URL app : ton URL Vercel ou `http://localhost:3000` pour le dev

**Livrable :** Projet qui compile, `pnpm dev` démarre sans erreur, `pnpm tsc --noEmit` passe.

---

### PHASE 1 — Auth Clerk + Firebase users ⬜

**Ce que tu demandes :**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET` (créer le webhook sur l'URL Vercel/ngrok)
- `ADMIN_EMAIL`

**Ce que tu fais :**
1. `src/lib/firebase-admin.ts` : client Firestore server-side via firebase-admin
2. `src/lib/crypto.ts` : AES-256-GCM (encrypt, decrypt, safeDecrypt, isEncrypted)
3. `src/lib/auth.ts` : `requireUser()`, `requireAdmin()`
4. Configurer `<ClerkProvider>` dans RootLayout
5. `src/middleware.ts` avec clerkMiddleware
6. Pages `/sign-in` et `/sign-up`
7. Webhook `POST /api/webhooks/clerk` (svix + idempotence + sync Firebase + ADMIN_EMAIL check)
8. Layout `(admin)/layout.tsx` : vérification `role === 'admin'`
9. Layout `(app)/layout.tsx` : vérification auth + check banni
10. Page `/admin` minimale (juste "Dashboard admin" pour vérifier l'accès)
11. Page `/dashboard` minimale

**Livrable :**
- Tu peux t'inscrire avec ton ADMIN_EMAIL → tu es admin
- Un doc `users/{userId}` est créé dans Firebase à l'inscription
- Tu accèdes à `/admin` mais pas un user normal
- `pnpm tsc --noEmit` passe

---

### PHASE 2 — Config + Clés API + Pricing ⬜

**Ce que tu fais :**
1. `src/data/templates.ts` : templates viraux complets
2. Seeder `scripts/seed-pricing-config.ts` : crée `pricing_config/current` avec les valeurs de la section 4
3. Seeder `scripts/seed-system-settings.ts` : crée `system_settings/config`
4. `src/lib/pricing.ts` : `estimateJobCost()` + cache mémoire 60s + `getPricingConfig()`
5. Route `POST /api/credits/estimate`
6. `src/lib/api-clients.ts` : `getAnthropicClient()`, `getFalClient()`, `getElevenLabsClient()`, etc. avec `MissingApiKeyError`
7. Page `/admin/api-keys` : lecture/écriture des clés chiffrées dans Firebase
8. Page `/admin/pipeline` : édition `pricing_config/current` + test estimation
9. `src/lib/admin-stats.ts` : `estimateRemainingVideos()` + récupération soldes APIs

**Livrable :**
- Depuis `/admin/api-keys` tu peux sauvegarder les clés API
- Depuis `/admin/pipeline` tu peux modifier le barème
- L'endpoint `/api/credits/estimate` retourne les bons montants

---

### PHASE 3 — Crédits + Ledger ⬜

**Ce que tu fais :**
1. `src/lib/credits.ts` : `applyCreditTransaction()` + `InsufficientCreditsError` + `recalculateBalance()`
2. Routes `GET /api/credits/balance` et `GET /api/credits/transactions`
3. Route `GET /api/me`
4. Composant `<CreditBalance />` (SWR, revalidation 30s)
5. Composant `<RemainingVideosWidget />` pour le dashboard admin
6. Page `/admin/analytics` minimale avec widget tokens restants
7. Page `/credits` utilisateur minimale (solde affiché)

**Livrable :**
- Le solde est affiché dans le header
- Le widget admin montre les estimations de vidéos restantes
- `pnpm tsc --noEmit` passe

---

### PHASE 4 — Pipeline de génération ⬜

**Ce que tu demandes :**
- `FAL_KEY` (fal.ai)
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `PIXABAY_API_KEY`
- `PEXELS_API_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`
- `TRIGGER_SECRET_KEY`

**Ce que tu fais :**
1. `src/lib/fal.ts` : wrappers `falTextToVideo()`, `falImageToVideo()` avec retry/fallback
2. `src/lib/elevenlabs.ts` : `generateVoiceover()` Flash et Multilingual
3. `src/lib/anthropic.ts` : `generateStoryboard()` avec prompt système complet
4. `src/lib/openai.ts` : `generateDalleImage()`
5. `src/lib/pixabay.ts` : `getPixabayTrack()`
6. `src/lib/pexels.ts` : `getPexelsStockClip()`
7. `src/lib/r2.ts` : `uploadToR2()`, `downloadBuffer()`
8. `src/lib/ffmpeg.ts` : `assembleVideo()` avec 5 styles de captions
9. `src/lib/pipeline/generate-scene.ts` : Standard / Premium / Cinema + fallbacks
10. `src/lib/pipeline/generate-storyboard.ts`
11. `src/lib/pipeline/assemble-video.ts`
12. Task Trigger.dev `generate-video.ts`
13. Route `POST /api/jobs/create` avec : réservation crédits, vérif limites plan, mapping qualité→provider
14. Route `GET /api/jobs/[id]/status` (SSE pour suivi temps réel)
15. Page `/admin/test-create` : interface de test admin (mode test, pas de débit crédits)
16. Page `/create` utilisateur : templates + options + estimateur live + bouton générer

**Livrable :**
- Tu peux créer une vidéo depuis `/admin/test-create` sans débit crédits
- La génération tourne dans Trigger.dev et le statut s'update en temps réel
- Le coût réel est affiché après génération

---

### PHASE 5 — Stripe (paiements) ⬜

**Ce que tu demandes :**
> "Pour cette phase, crée dans ton dashboard Stripe ces 8 produits : [liste exacte avec montants]. Active Stripe Tax. Donne-moi les 8 Price IDs."

**Ce que tu fais :**
1. `src/lib/stripe.ts` : client + `getOrCreateStripeCustomer()`
2. Route `POST /api/billing/checkout-credits`
3. Route `POST /api/billing/checkout-subscription`
4. Route `POST /api/billing/portal`
5. Route `GET /api/billing/plans`
6. Webhook `POST /api/webhooks/stripe` (idempotent, tous les events section 10)
7. Page `/credits` complète : solde + packs + historique
8. Page `/billing` : plan actuel + comparatif + Customer Portal

**Livrable :**
- Achat de pack en mode test Stripe fonctionne
- Les crédits sont crédités dans Firebase après paiement
- L'abonnement active le bon plan

---

### PHASE 6 — Mode AUTO (séries) ⬜

**Ce que tu fais :**
1. CRUD `series` : routes `/api/series/` + page `/series/` + `/series/new`
2. `src/lib/trends.ts` : suggestions Google Trends par niche
3. Cron Trigger.dev `scheduler.ts` (toutes les 15 min)
4. `src/lib/suno.ts` : génération musique via Apiframe (optionnel, si `APIFRAME_KEY` présent)
5. CRUD `avatars` : routes `/api/avatars/` + `/api/avatars/generate` + page dans create
6. Composant `<AvatarCreator />` : description texte → 4 images DALL-E → avatar sauvegardé
7. Page `/series/[id]` : historique des épisodes, toggle pause/reprendre, prochaine date

---

### PHASE 7 — OAuth et publication ⬜

**Ce que tu fais :**
1. OAuth YouTube (start + callback)
2. OAuth TikTok (start + callback avec PKCE)
3. OAuth Instagram (start + callback)
4. Page `/admin/platforms` : statut des 3 plateformes (non configuré / configuré / connecté)
5. Task Trigger.dev `publish-video.ts`
6. Bouton "Publier sur..." dans `/jobs/[jobId]`

---

### PHASE 8 — Dashboard admin complet + polish ⬜

**Ce que tu fais :**
1. Page `/admin/users` : liste complète paginée
2. Page `/admin/users/[userId]` : détail + ajustement crédits + ban
3. Page `/admin/transactions` : ledger complet filtrable + export CSV
4. Page `/admin/analytics` : métriques complètes
5. Page `/admin/jobs` : tous les jobs tous users
6. Emails transactionnels Resend (section 14)
7. Page `/` (landing page)
8. Page `/pricing` (publique)
9. Pages `/legal/terms` et `/legal/privacy` (contenu placeholder)
10. Tests end-to-end : inscription → achat crédits → création vidéo → publication

---

### PHASE 9 — Tests et optimisations ⬜

**Ce que tu fais :**
1. Tests du flux complet (FREE → CREATOR → CREATOR PRO → STUDIO → AGENCY)
2. Tests des webhooks Stripe en mode test
3. Tests des fallbacks vidéo (simuler un fail fal.ai)
4. Vérification que `pnpm build` passe sans erreur
5. Optimisations performance (cache, lazy loading)
6. Documentation finale dans README.md

---

## 16. NOTES IMPORTANTES POUR CLAUDE CODE

### Sur Firebase
- Toutes les opérations Firestore se font via `firebase-admin` côté serveur
- Jamais d'accès direct Firestore côté client
- Le middleware Clerk ne peut pas accéder à Firebase (Edge Runtime incompatible) — vérifications Firebase uniquement dans les Server Components

### Sur les crédits
- Le ledger `credit_transactions` est IMMUABLE — jamais de update() ni delete()
- `creditsBalance` dans le user document est un CACHE — recalculable depuis le ledger
- Toute opération passe par `applyCreditTransaction()` dans une transaction Firebase
- L'admin en mode test (`isAdminTestMode: true`) ne débite jamais de crédits

### Sur les providers vidéo
- L'utilisateur final ne voit JAMAIS "Hailuo", "Kling", "fal.ai"
- Il voit uniquement "Standard", "Premium", "Cinema"
- Le mapping est dans `pricing_config/current` et éditable par l'admin sans redéploiement

### Sur Stripe
- Activer Stripe Tax pour la TVA EU automatique
- Tous les webhooks sont idempotents via `stripeEventId`
- Ne jamais exposer `STRIPE_SECRET_KEY` côté client

### Sur les variables d'env
- Toutes les clés API sont stockées AUSSI dans Firebase (chiffrées AES-256-GCM) pour être éditables sans redéploiement
- Les variables d'env sont un fallback si Firebase n'a pas encore la clé
- Pattern : lire Firebase → fallback env → throw MissingApiKeyError

### Sur PROGRESS.md
C'est le fichier de suivi. À la fin de chaque phase, il doit contenir :
- Le statut de chaque phase (✅ ou ⬜)
- La dernière phase complétée
- Les prochaines étapes
- Les variables d'env ajoutées dans cette phase
- Les décisions techniques prises

---

**Commence par la Phase 0. Demande les variables d'environnement Firebase et Session Secret, puis crée la structure du projet.**
