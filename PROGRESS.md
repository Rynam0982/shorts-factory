# Shorts Factory v2 — Progress

## Phase 0 — Setup ✅ TERMINÉE
Date : 2026-05-29
- Next.js 16 + TypeScript strict + Tailwind CSS v4
- Toutes les dépendances installées (Clerk, Stripe, Firebase, fal.ai, Anthropic, ElevenLabs, etc.)
- Shadcn/ui configuré (base-nova, Radix-free)
- Structure de dossiers complète (app/api/trigger/lib/types/components)
- trigger.config.ts, next.config.ts, pnpm-workspace.yaml configurés
- .env.local rempli avec Firebase + Clerk + R2 + SESSION_SECRET (depuis projet précédent)
- PROGRESS.md, .env.example créés

---

## Phase 1 — Auth Clerk + Firebase users ✅ TERMINÉE
- firebase-admin.ts + firebase-client.ts
- crypto.ts (AES-256-GCM encrypt/decrypt/safeDecrypt/isEncrypted)
- auth.ts (requireUser, requireAdmin, AuthError)
- middleware.ts (clerkMiddleware, routes publiques)
- Webhook POST /api/webhooks/clerk (svix + idempotence + sync Firebase + ADMIN_EMAIL → role:admin)
- Layouts (app) + (admin) avec vérification auth/role
- AppSidebar, AppHeader, AdminSidebar, AdminHeader — design SF tokens
- Pages: /sign-in, /sign-up, /dashboard, /admin (minimales)
- pnpm tsc --noEmit : ✅ 0 erreurs

---

## Phase 2 — Config + Clés API + Pricing ✅ TERMINÉE
- data/templates.ts (6 templates viraux)
- lib/pricing.ts (estimateJobCost + cache 60s + getPricingConfig)
- lib/api-clients.ts (getAnthropicClient, getFalClient, getElevenLabsClient, getR2Client... + MissingApiKeyError)
- scripts/seed-pricing-config.ts (à lancer 1× : tsx scripts/seed-pricing-config.ts)
- POST /api/credits/estimate
- GET/POST/DELETE /api/admin/api-keys + /api/admin/api-keys/test
- GET/PUT /api/admin/pricing
- Page /admin/api-keys (ApiKeyField component)
- Page /admin/pipeline (éditeur pricing config + test estimation)

---

## Phase 3 — Crédits + Ledger ✅ TERMINÉE
- lib/credits.ts (applyCreditTransaction + InsufficientCreditsError + recalculateBalance)
- GET /api/credits/balance
- GET /api/credits/transactions
- GET /api/me
- Composant CreditBalance (SWR, refresh 30s)
- Composant RemainingVideosWidget
- lib/admin-stats.ts (estimateRemainingVideos)
- GET /api/admin/analytics/balances
- Page /credits utilisateur complète
- CreditPacks component

---

## Phase 4 — Pipeline de génération ✅ TERMINÉE
- lib/anthropic.ts (generateStoryboard via Claude)
- lib/fal.ts (falTextToVideo + falImageToVideo avec fallback)
- lib/elevenlabs.ts (generateVoiceover Flash/Multi)
- lib/openai.ts (generateDalleImage DALL-E 3)
- lib/pixabay.ts (getPixabayTrack BGM gratuit)
- lib/pexels.ts (getPexelsStockClip stock fallback)
- lib/r2.ts (uploadToR2, downloadBuffer)
- lib/ffmpeg.ts (assembleVideo 5 styles captions + extractBestFrame)
- lib/pipeline/generate-storyboard.ts
- lib/pipeline/generate-scene.ts (Standard/Premium/Cinema + fallbacks)
- lib/pipeline/assemble-video.ts
- src/trigger/generate-video.ts (Trigger.dev task, maxDuration 3600s)
- src/trigger/scheduler.ts (cron 15min séries AUTO)
- src/trigger/index.ts
- POST /api/jobs/create (réservation crédits + trigger Trigger.dev)
- GET /api/jobs/[id]/status (SSE polling)
- POST /api/admin/test-job (isAdminTest=true, pas de débit crédits)
- Page /create (Studio) avec estimateur live et design SF
- Page /admin/test-create avec badge MODE TEST
- Page /jobs/[jobId] avec player + pipeline steps + SSE

---

## Phase 5 — Stripe (paiements) ✅ TERMINÉE
- lib/stripe.ts (getStripe + getOrCreateStripeCustomer + getPriceId)
- POST /api/billing/checkout-credits
- POST /api/billing/checkout-subscription
- POST /api/billing/portal
- Webhook POST /api/webhooks/stripe (7 events, tous idempotents)
- Page /billing avec grille des plans et portail Stripe

---

## Phase 6 — Mode AUTO (séries) ✅ TERMINÉE
- GET/POST /api/series
- GET/PATCH/DELETE /api/series/[id]
- Page /series (liste avec design SF)
- Page /series/new (wizard 3 étapes avec stepper)

---

## Phase 7 — OAuth (stubs) ✅ TERMINÉE
- Page /admin/platforms (statut config OAuth YouTube/TikTok/Instagram)
- Routes OAuth /api/oauth/*/start + /callback : à compléter quand les App OAuth sont créées

---

## Phase 8 — Dashboard admin complet + landing ✅ TERMINÉE
- Landing page / (design exact du fichier landing.jsx)
- Page /pricing (plans + packs crédits)
- Page /profile (UserProfile Clerk)
- Page /admin/users (liste paginée)
- Page /admin/jobs (tous les jobs)
- Page /admin/analytics (métriques + RemainingVideosWidget)
- Page /admin/platforms
- Design system complet appliqué : globals.css avec CSS tokens SF + Google Fonts (Space Grotesk + Manrope + JetBrains Mono)

---

## Variables d'env à configurer avant de lancer

### Déjà remplies (depuis projet précédent)
- SESSION_SECRET ✅
- NEXT_PUBLIC_FIREBASE_* ✅ (toutes)
- FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY ✅
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY ✅
- ADMIN_EMAIL = rynam2407@gmail.com ✅
- R2_* (account, keys, bucket, public URL) ✅

### À remplir avant utilisation
- CLERK_WEBHOOK_SECRET → créer webhook sur dashboard.clerk.com → /api/webhooks/clerk
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- FAL_KEY
- ELEVENLABS_API_KEY
- PIXABAY_API_KEY (gratuit sur pixabay.com/api)
- PEXELS_API_KEY (gratuit sur pexels.com/api)
- TRIGGER_SECRET_KEY → dashboard.trigger.dev
- STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- 8× STRIPE_PRICE_* (créer les produits dans le dashboard Stripe)
- RESEND_API_KEY (optionnel, pour emails)

### Commandes à lancer 1 fois
```bash
# Seeder la pricing config dans Firebase
pnpm tsx scripts/seed-pricing-config.ts
```
