import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const stripe = getStripe();
  const { adminDb } = await import("./firebase-admin");

  const userDoc = await adminDb.collection("users").doc(userId).get();
  const user = userDoc.data()!;

  if (user.stripeCustomerId) return user.stripeCustomerId as string;

  const customer = await stripe.customers.create({
    email,
    metadata: { clerkUserId: userId },
  });

  await adminDb.collection("users").doc(userId).update({
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

// Price ID env mapping
export function getPriceId(envKey: string): string {
  const id = process.env[envKey];
  if (!id) throw new Error(`Stripe Price ID not configured: ${envKey}`);
  return id;
}
