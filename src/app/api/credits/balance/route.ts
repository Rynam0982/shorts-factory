import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await requireUser();
    return NextResponse.json({
      creditsBalance: user.creditsBalance,
      totalCreditsEarned: user.totalCreditsEarned,
      totalCreditsSpent: user.totalCreditsSpent,
      plan: user.plan,
      isAdminTestMode: user.isAdminTestMode,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
