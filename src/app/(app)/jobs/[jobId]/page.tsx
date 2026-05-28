import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import JobDetailClient from "./job-detail-client";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const jobDoc = await adminDb.collection("jobs").doc(jobId).get();
  if (!jobDoc.exists) redirect("/jobs");

  const job = { id: jobDoc.id, ...jobDoc.data() } as Record<string, unknown>;

  // Auth check — user must own the job or be admin
  const userDoc = await adminDb.collection("users").doc(userId).get();
  const user = userDoc.data()!;
  if (job.userId !== userId && user.role !== "admin") redirect("/jobs");

  return <JobDetailClient job={job} isAdmin={user.role === "admin"} />;
}
