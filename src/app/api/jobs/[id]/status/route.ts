import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: jobId } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastStatus = "";
      let attempts = 0;
      const maxAttempts = 720; // 1 hour at 5s intervals

      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      while (attempts < maxAttempts) {
        try {
          const doc = await adminDb.collection("jobs").doc(jobId).get();
          if (!doc.exists) {
            send({ error: "Job not found" });
            break;
          }

          const job = doc.data()!;

          // Only send on status change to reduce noise
          if (job.status !== lastStatus) {
            lastStatus = job.status;
            send({
              status: job.status,
              finalVideoUrl: job.finalVideoUrl ?? null,
              thumbnailUrl: job.thumbnailUrl ?? null,
              errorMsg: job.errorMsg ?? null,
              actualCredits: job.actualCredits ?? null,
              storyboard: job.storyboard ?? null,
            });
          }

          if (["READY", "DONE", "FAILED"].includes(job.status)) {
            break;
          }
        } catch (err) {
          send({ error: "Polling error" });
          break;
        }

        // Wait 5 seconds
        await new Promise(r => setTimeout(r, 5000));
        attempts++;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
