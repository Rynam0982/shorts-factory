import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Load .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function seed() {
  await db
    .collection("pricing_config")
    .doc("current")
    .set({
      videoQualities: {
        standard: {
          provider: "hailuo",
          fallback: "hailuo",
          label: "Standard",
          description: "Rapide et économique",
          perSecondCostUsd: 0.04,
          perSecondCredits: 7,
        },
        premium: {
          provider: "kling_standard",
          fallback: "wan",
          label: "Premium",
          description: "Qualité supérieure 4K",
          perSecondCostUsd: 0.084,
          perSecondCredits: 14,
        },
        cinema: {
          provider: "kling_pro",
          fallback: "kling_standard",
          label: "Cinema",
          description: "Qualité professionnelle 4K",
          perSecondCostUsd: 0.112,
          perSecondCredits: 19,
        },
      },
      fixedCosts: {
        storyboardCredits: 2,
        dalleImageCredits: 7,
        elevenlabsFlashPer1kChars: 10,
        elevenlabsMultiPer1kChars: 20,
        sunoMusicCredits: 5,
        importClipCredits: 15,
        uploadPublishCredits: 0,
      },
      plans: {
        free: {
          monthlyCredits: 0,
          priceEur: 0,
          autoSeriesMax: 0,
          autoVideosPerSeriesPerWeek: 0,
          autoMaxDurationSeconds: 0,
          studioCreditsBonus: 0,
          allowedQualities: ["standard"],
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
          stripePriceIdEnv: null,
        },
        starter_creator: {
          monthlyCredits: 0,
          priceEur: 19.99,
          autoSeriesMax: 1,
          autoVideosPerSeriesPerWeek: 3,
          autoMaxDurationSeconds: 30,
          studioCreditsBonus: 50,
          allowedQualities: ["standard"],
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
          stripePriceIdEnv: "STRIPE_PRICE_CREATOR_MONTHLY",
        },
        creator_pro: {
          monthlyCredits: 0,
          priceEur: 34.99,
          autoSeriesMax: 3,
          autoVideosPerSeriesPerWeek: 7,
          autoMaxDurationSeconds: 30,
          studioCreditsBonus: 200,
          allowedQualities: ["standard", "premium"],
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
          stripePriceIdEnv: "STRIPE_PRICE_CREATOR_PRO_MONTHLY",
        },
        studio: {
          monthlyCredits: 5000,
          priceEur: 44.99,
          autoSeriesMax: 0,
          autoVideosPerSeriesPerWeek: 0,
          autoMaxDurationSeconds: 0,
          studioCreditsBonus: 0,
          allowedQualities: ["standard", "premium", "cinema"],
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
          stripePriceIdEnv: "STRIPE_PRICE_STUDIO_MONTHLY",
        },
        agency: {
          monthlyCredits: 3000,
          priceEur: 79.99,
          autoSeriesMax: 10,
          autoVideosPerSeriesPerWeek: 14,
          autoMaxDurationSeconds: 30,
          studioCreditsBonus: 0,
          allowedQualities: ["standard", "premium", "cinema"],
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
          stripePriceIdEnv: "STRIPE_PRICE_AGENCY_MONTHLY",
        },
      },
      creditPacks: [
        {
          id: "pack_500",
          credits: 500,
          priceEur: 4.99,
          stripePriceIdEnv: "STRIPE_PRICE_CREDITS_500",
        },
        {
          id: "pack_2000",
          credits: 2000,
          priceEur: 17.99,
          stripePriceIdEnv: "STRIPE_PRICE_CREDITS_2000",
        },
        {
          id: "pack_5000",
          credits: 5000,
          priceEur: 39.99,
          stripePriceIdEnv: "STRIPE_PRICE_CREDITS_5000",
        },
        {
          id: "pack_15000",
          credits: 15000,
          priceEur: 99.99,
          stripePriceIdEnv: "STRIPE_PRICE_CREDITS_15000",
        },
      ],
      creditExpiration: {
        packExpiresDays: null,
        subscriptionCarryOverCap: 3,
      },
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: "seed-script",
    });

  await db.collection("system_settings").doc("config").set({
    setupCompleted: true,
    adminEmail: process.env.ADMIN_EMAIL ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log("✅ Pricing config and system settings seeded successfully.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
