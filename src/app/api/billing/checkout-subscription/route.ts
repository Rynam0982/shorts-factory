import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getStripe, getOrCreateStripeCustomer, getPriceId } from "@/lib/stripe";

const PLAN_PRICE_MAP: Record<string, string> = {
  starter_creator: "STRIPE_PRICE_CREATOR_MONTHLY",
  creator_pro:     "STRIPE_PRICE_CREATOR_PRO_MONTHLY",
  studio:          "STRIPE_PRICE_STUDIO_MONTHLY",
  agency:          "STRIPE_PRICE_AGENCY_MONTHLY",
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

  const { plan } = await req.json();
  const priceEnvKey = PLAN_PRICE_MAP[plan];
  if (!priceEnvKey) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  try {
    const priceId = getPriceId(priceEnvKey);
    const customerId = await getOrCreateStripeCustomer(userId, user.email);
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/billing?success=1`,
      cancel_url: `${appUrl}/billing`,
      metadata: { userId, plan },
      automatic_tax: { enabled: true },
      subscription_data: { metadata: { userId, plan } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe subscription error:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
