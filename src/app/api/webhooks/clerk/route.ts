import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Idempotence check
  const eventRef = adminDb.collection("webhook_events").doc(svixId);
  const existing = await eventRef.get();
  if (existing.exists) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;
  const userId = data.id;
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address ?? "";
  const name =
    [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

  try {
    if (type === "user.created") {
      const adminEmail = process.env.ADMIN_EMAIL;
      const isAdmin = !!adminEmail && primaryEmail.toLowerCase() === adminEmail.trim().toLowerCase();

      // Check if another account with the same email already exists (duplicate OAuth)
      const duplicateSnap = await adminDb
        .collection("users")
        .where("email", "==", primaryEmail)
        .limit(1)
        .get();

      if (!duplicateSnap.empty) {
        // Merge: copy existing account so both OAuth accounts share the same credits/plan/role
        const existing = duplicateSnap.docs[0].data();
        await adminDb.collection("users").doc(userId).set({
          ...existing,
          clerkUserId: userId,
          imageUrl: data.image_url ?? existing.imageUrl,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        await adminDb.collection("users").doc(userId).set({
          email: primaryEmail,
          name,
          imageUrl: data.image_url,
          clerkUserId: userId,
          stripeCustomerId: null,
          creditsBalance: 0,
          totalCreditsEarned: 0,
          totalCreditsSpent: 0,
          plan: "free",
          subscriptionStatus: "none",
          subscriptionId: null,
          subscriptionPeriodEnd: null,
          monthlyResetAt: null,
          role: isAdmin ? "admin" : "user",
          isAdminTestMode: isAdmin,
          bannedAt: null,
          deletedAt: null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (type === "user.updated") {
      await adminDb.collection("users").doc(userId).update({
        email: primaryEmail,
        name,
        imageUrl: data.image_url,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (type === "user.deleted") {
      await adminDb.collection("users").doc(userId).update({
        deletedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Mark as processed
    await eventRef.set({
      source: "clerk",
      processedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
