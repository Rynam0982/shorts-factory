import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { deleteSocialAccount } from "@/lib/social/token-store";
import type { SocialPlatform } from "@/types/social-account";

const VALID_PLATFORMS: SocialPlatform[] = ["tiktok", "instagram", "youtube"];

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: rawPlatform } = await params;
  const platform = rawPlatform as SocialPlatform;

  if (!VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  }

  try {
    const { clerkUserId } = await requireUser();
    await deleteSocialAccount(clerkUserId, platform);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
