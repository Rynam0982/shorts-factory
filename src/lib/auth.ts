import { auth } from "@clerk/nextjs/server";
import { adminDb } from "./firebase-admin";
import type { UserDoc } from "@/types/user";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireUser(): Promise<{ clerkUserId: string; user: UserDoc }> {
  const { userId } = await auth();
  if (!userId) throw new AuthError("Unauthorized", 401);

  const doc = await adminDb.collection("users").doc(userId).get();
  if (!doc.exists) throw new AuthError("User not found", 404);

  const user = { id: doc.id, ...doc.data() } as UserDoc;

  if (user.bannedAt) throw new AuthError("Account banned", 403);
  if (user.deletedAt) throw new AuthError("Account deleted", 403);

  return { clerkUserId: userId, user };
}

export async function requireAdmin(): Promise<{ clerkUserId: string; user: UserDoc }> {
  const result = await requireUser();
  if (result.user.role !== "admin") {
    throw new AuthError("Forbidden — admin only", 403);
  }
  return result;
}
