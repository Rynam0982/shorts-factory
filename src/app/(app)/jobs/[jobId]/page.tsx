import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import JobDetailClient from "./job-detail-client";

export const dynamic = "force-dynamic";

// Recursively convert Firestore Timestamps → ISO strings so the object
// is safe to serialize for Client Components (no class instances).
function serializeFirestore(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  // Firestore Timestamp: has toDate() method
  if (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestore);
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serializeFirestore(v);
    }
    return out;
  }

  return value;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [jobDoc, userDoc] = await Promise.all([
    adminDb.collection("jobs").doc(jobId).get(),
    adminDb.collection("users").doc(userId).get(),
  ]);

  if (!jobDoc.exists) redirect("/jobs");

  const userData = userDoc.data() ?? {};
  const isAdmin  = (userData as Record<string, unknown>).role === "admin";

  // Ownership check
  const rawJobData = jobDoc.data() ?? {};
  if (rawJobData.userId !== userId && !isAdmin) redirect("/jobs");

  // Serialize ALL Firestore Timestamps recursively so the Client Component
  // receives only plain JSON-serializable values.
  const job = serializeFirestore({
    id: jobDoc.id,
    ...rawJobData,
  }) as Record<string, unknown>;

  return <JobDetailClient job={job} isAdmin={isAdmin} />;
}
