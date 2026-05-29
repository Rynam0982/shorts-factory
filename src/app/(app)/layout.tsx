import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { applyCreditTransaction } from "@/lib/credits";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

const WELCOME_CREDITS = 100;

function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!adminEmail && email.trim().toLowerCase() === adminEmail;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let userDoc = await adminDb.collection("users").doc(userId).get();

  // New user — provision Firestore document
  if (!userDoc.exists) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? "";
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    const role = isAdminEmail(primaryEmail) ? "admin" : "user";

    await adminDb.collection("users").doc(userId).set({
      email: primaryEmail,
      name,
      imageUrl: clerkUser.imageUrl ?? null,
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
      role,
      isAdminTestMode: role === "admin",
      bannedAt: null,
      deletedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    userDoc = await adminDb.collection("users").doc(userId).get();
  }

  let user = userDoc.data()!;

  // Promote to admin if email matches ADMIN_EMAIL (case-insensitive, handles env var set after signup)
  if (isAdminEmail(user.email ?? "") && user.role !== "admin") {
    await adminDb.collection("users").doc(userId).update({
      role: "admin",
      isAdminTestMode: true,
      updatedAt: FieldValue.serverTimestamp(),
    });
    user = { ...user, role: "admin", isAdminTestMode: true };
  }

  // Give welcome credits to any user who has never received any (handles users created before this feature)
  if ((user.totalCreditsEarned ?? 0) === 0) {
    await applyCreditTransaction({
      userId,
      type: "BONUS",
      amount: WELCOME_CREDITS,
      description: "Crédits de bienvenue 🎉",
      bypassBalanceCheck: true,
    });
    user = { ...user, creditsBalance: (user.creditsBalance ?? 0) + WELCOME_CREDITS };
  }

  if (user.bannedAt) redirect("/sign-in");
  if (user.deletedAt) redirect("/sign-in");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AppSidebar isAdmin={user.role === "admin"} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppHeader plan={user.plan} />
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
