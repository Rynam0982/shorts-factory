import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getStripe, getOrCreateStripeCustomer, getPriceId } from "@/lib/stripe";

const PACK_PRICE_MAP: Record<string, string> = {
  pack_500:   "STRIPE_PRICE_CREDITS_500",
  pack_2000:  "STRIPE_PRICE_CREDITS_2000",
  pack_5000:  "STRIPE_PRICE_CREDITS_5000",
  pack_15000: "STRIPE_PRICE_CREDITS_15000",
};

export async function POST(req: NextRequest) {
  let userId: string;
  let user: Awaited<ReturnType<typeof requireUser>>["user"];

  try {
    const result = await requireUser();
    userId = result.clerkUserId;
    user = result.user;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packId } = await req.json();
  const priceEnvKey = PACK_PRICE_MAP[packId];
  if (!priceEnvKey) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  try {
    const priceId = getPriceId(priceEnvKey);
    const customerId = await getOrCreateStripeCustomer(userId, user.email);
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${appUrl}/credits?success=1`,
      cancel_url: `${appUrl}/credits`,
      metadata: { userId, packId },
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
