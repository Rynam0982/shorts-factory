import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import AdminSidebar from "@/components/admin-sidebar";
import AdminHeader from "@/components/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
