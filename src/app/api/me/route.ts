import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await requireUser();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      creditsBalance: user.creditsBalance,
      role: user.role,
      isAdminTestMode: user.isAdminTestMode,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
