import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) redirect("/sign-in");

  const user = userDoc.data()!;
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
