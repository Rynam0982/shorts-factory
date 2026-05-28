import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { estimateRemainingVideos } from "@/lib/admin-stats";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // In a real implementation, fetch actual balances from fal.ai and ElevenLabs APIs
  // For now return a placeholder — the admin can configure actual balance fetching
  const falBalance = 0;
  const elevenLabsBalance = 0;

  const estimates = await estimateRemainingVideos(falBalance, elevenLabsBalance);

  return NextResponse.json({
    service: "fal",
    balanceUsd: falBalance,
    elevenLabsBalanceUsd: elevenLabsBalance,
    estimates,
  });
}
