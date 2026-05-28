import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import StudioClient from "./studio-client";

export default async function CreatePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userDoc = await adminDb.collection("users").doc(userId).get();
  const user = userDoc.data()!;

  // Get plan config to know allowed qualities
  let allowedQualities: string[] = ["standard"];
  try {
    const pricingDoc = await adminDb.collection("pricing_config").doc("current").get();
    if (pricingDoc.exists) {
      const pricing = pricingDoc.data()!;
      allowedQualities = pricing.plans?.[user.plan]?.allowedQualities ?? ["standard"];
    }
  } catch {
    // use default
  }

  return (
    <StudioClient
      creditsBalance={user.creditsBalance ?? 0}
      isAdminTestMode={user.isAdminTestMode ?? false}
      allowedQualities={allowedQualities}
    />
  );
}
