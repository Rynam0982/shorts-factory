import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { applyCreditTransaction } from "@/lib/credits";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type Stripe from "stripe";

const PLAN_CREDITS: Record<string, number> = {
  starter_creator: 50,
  creator_pro: 200,
  studio: 5000,
  agency: 3000,
};

const PLAN_FROM_PRICE_ENV: Record<string, string> = {
  [process.env.STRIPE_PRICE_CREATOR_MONTHLY ?? "none_1"]: "starter_creator",
  [process.env.STRIPE_PRICE_CREATOR_PRO_MONTHLY ?? "none_2"]: "creator_pro",
  [process.env.STRIPE_PRICE_STUDIO_MONTHLY ?? "none_3"]: "studio",
  [process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? "none_4"]: "agency",
};

const PACK_CREDITS: Record<string, number> = {
  pack_500: 500, pack_2000: 2000, pack_5000: 5000, pack_15000: 15000,
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "No webhook secret" }, { status: 500 });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotence
  const eventRef = adminDb.collection("webhook_events").doc(event.id);
  const existing = await eventRef.get();
  if (existing.exists) return NextResponse.json({ ok: true, skipped: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        if (session.mode === "payment") {
          // Credit pack purchase
          const packId = session.metadata?.packId;
          const credits = packId ? (PACK_CREDITS[packId] ?? 0) : 0;
          if (credits > 0) {
            await applyCreditTransaction({
              userId,
              type: "PURCHASE",
              amount: credits,
              description: `Achat pack ${packId} (${credits} crédits)`,
              stripeEventId: event.id,
              stripePaymentId: session.payment_intent as string,
            });
          }
        } else if (session.mode === "subscription") {
          // New subscription — grant bonus credits
          const plan = session.metadata?.plan as string;
          const bonusCredits = PLAN_CREDITS[plan] ?? 0;

          await adminDb.collection("users").doc(userId).update({
            plan,
            subscriptionStatus: "active",
            subscriptionId: session.subscription as string,
            updatedAt: FieldValue.serverTimestamp(),
          });

          if (bonusCredits > 0) {
            await applyCreditTransaction({
              userId,
              type: "SUBSCRIPTION_GRANT",
              amount: bonusCredits,
              description: `Bienvenue sur le plan ${plan} — bonus crédits`,
              stripeEventId: event.id,
            });
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (!customerId) break;

        // Find user by stripeCustomerId
        const userQuery = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (userQuery.empty) break;
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const user = userDoc.data();

        const plan = user.plan as string;
        const monthlyCredits = PLAN_CREDITS[plan] ?? 0;

        if (monthlyCredits > 0 && invoice.billing_reason === "subscription_cycle") {
          await applyCreditTransaction({
            userId,
            type: "SUBSCRIPTION_GRANT",
            amount: monthlyCredits,
            description: `Recharge mensuelle — plan ${plan}`,
            stripeEventId: event.id,
          });
        }

        // Update subscription period
        const periodEnd = (invoice as unknown as Record<string, unknown>).period_end;
        await adminDb.collection("users").doc(userId).update({
          subscriptionStatus: "active",
          subscriptionPeriodEnd: periodEnd
            ? Timestamp.fromMillis((periodEnd as number) * 1000)
            : null,
          updatedAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const userQuery = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (userQuery.empty) break;
        const userId = userQuery.docs[0].id;
        const priceId = sub.items.data[0]?.price.id ?? "";
        const plan = PLAN_FROM_PRICE_ENV[priceId] ?? userQuery.docs[0].data().plan;

        await adminDb.collection("users").doc(userId).update({
          plan,
          subscriptionStatus: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
          subscriptionId: sub.id,
          updatedAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const userQuery = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (userQuery.empty) break;
        await adminDb.collection("users").doc(userQuery.docs[0].id).update({
          plan: "free",
          subscriptionStatus: "canceled",
          subscriptionId: null,
          updatedAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userQuery = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!userQuery.empty) {
          await adminDb.collection("users").doc(userQuery.docs[0].id).update({
            subscriptionStatus: "past_due",
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = await getStripe().charges.retrieve(dispute.charge as string);
        const customerId = charge.customer as string;
        if (!customerId) break;

        const userQuery = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!userQuery.empty) {
          await adminDb.collection("users").doc(userQuery.docs[0].id).update({
            bannedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        // Create alert
        await adminDb.collection("alerts").add({
          service: "stripe",
          level: "critical",
          message: `Chargeback reçu — client ${customerId}`,
          acknowledged: false,
          createdAt: FieldValue.serverTimestamp(),
        });
        break;
      }
    }

    await eventRef.set({
      source: "stripe",
      processedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
