import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import BillingClient from "./billing-client";
import { isStripeConfigured } from "@/lib/stripe";

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) redirect("/sign-in");
  const user = userDoc.data()!;

  return <BillingClient user={user} stripeConfigured={isStripeConfigured()} />;
}
