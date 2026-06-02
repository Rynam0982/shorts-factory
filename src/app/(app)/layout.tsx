import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

function matchesAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return false;
  return email.trim().toLowerCase() === adminEmail;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // ── 1. Load or provision the user document ──────────────────────────────
  let userDoc = await adminDb.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? "";
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    const isAdmin = matchesAdminEmail(primaryEmail);

    // Check for duplicate email (Google + GitHub same account)
    try {
      const duplicateSnap = await adminDb
        .collection("users")
        .where("email", "==", primaryEmail)
        .limit(1)
        .get();

      if (!duplicateSnap.empty) {
        const existing = duplicateSnap.docs[0].data();
        // Merge — copy credits/plan/role from existing account
        await adminDb.collection("users").doc(userId).set({
          email:          existing.email      ?? primaryEmail,
          name:           existing.name       ?? name,
          imageUrl:       clerkUser.imageUrl  ?? existing.imageUrl ?? null,
          clerkUserId:    userId,
          stripeCustomerId: existing.stripeCustomerId ?? null,
          creditsBalance: existing.creditsBalance ?? 0,
          totalCreditsEarned: existing.totalCreditsEarned ?? 0,
          totalCreditsSpent:  existing.totalCreditsSpent  ?? 0,
          plan:           existing.plan   ?? "free",
          subscriptionStatus: existing.subscriptionStatus ?? "none",
          subscriptionId: existing.subscriptionId ?? null,
          subscriptionPeriodEnd: existing.subscriptionPeriodEnd ?? null,
          monthlyResetAt: existing.monthlyResetAt ?? null,
          role:           existing.role ?? (isAdmin ? "admin" : "user"),
          isAdminTestMode: existing.isAdminTestMode ?? isAdmin,
          bannedAt:       existing.bannedAt  ?? null,
          deletedAt:      existing.deletedAt ?? null,
          createdAt:      existing.createdAt ?? FieldValue.serverTimestamp(),
          updatedAt:      FieldValue.serverTimestamp(),
        });
      } else {
        await adminDb.collection("users").doc(userId).set({
          email:          primaryEmail,
          name,
          imageUrl:       clerkUser.imageUrl ?? null,
          clerkUserId:    userId,
          stripeCustomerId: null,
          creditsBalance: 0,
          totalCreditsEarned: 0,
          totalCreditsSpent:  0,
          plan:           "free",
          subscriptionStatus: "none",
          subscriptionId: null,
          subscriptionPeriodEnd: null,
          monthlyResetAt: null,
          role:           isAdmin ? "admin" : "user",
          isAdminTestMode: isAdmin,
          bannedAt:       null,
          deletedAt:      null,
          createdAt:      FieldValue.serverTimestamp(),
          updatedAt:      FieldValue.serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("[AppLayout] User provisioning failed:", err);
    }

    userDoc = await adminDb.collection("users").doc(userId).get();
  }

  // ── 2. Safe data extraction ─────────────────────────────────────────────
  const rawUser = userDoc.data();
  if (!rawUser) {
    // Edge case: doc still not found after provisioning attempt
    // Redirect to sign-in instead of crashing the entire page tree
    redirect("/sign-in");
  }

  let user = rawUser;

  if (user.bannedAt)  redirect("/sign-in");
  if (user.deletedAt) redirect("/sign-in");

  // ── 3. Auto-promote to admin if email matches env var ──────────────────
  if (matchesAdminEmail(user.email ?? "") && (user.role !== "admin" || !user.isAdminTestMode)) {
    try {
      await adminDb.collection("users").doc(userId).update({
        role: "admin",
        isAdminTestMode: true,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch {}
    user = { ...user, role: "admin", isAdminTestMode: true };
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AppSidebar isAdmin={user.role === "admin"} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AppHeader plan={(user.plan as string) ?? "free"} />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
