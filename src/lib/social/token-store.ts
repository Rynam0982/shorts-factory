import { adminDb } from "@/lib/firebase-admin";
import { encrypt, decrypt } from "@/lib/crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { SocialAccountDoc, SocialPlatform } from "@/types/social-account";

function docId(userId: string, platform: SocialPlatform): string {
  return `${userId}_${platform}`;
}

export async function upsertSocialAccount(params: {
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username: string;
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  scopes: string[];
}): Promise<void> {
  const id = docId(params.userId, params.platform);
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + params.expiresIn * 1000));

  const docRef = adminDb.collection("social_accounts").doc(id);
  const existing = await docRef.get();
  const now = FieldValue.serverTimestamp();

  await docRef.set({
    userId: params.userId,
    platform: params.platform,
    platformUserId: params.platformUserId,
    username: params.username,
    accessToken: encrypt(params.accessToken),
    refreshToken: params.refreshToken ? encrypt(params.refreshToken) : null,
    expiresAt,
    scopes: params.scopes,
    createdAt: existing.exists ? existing.data()!.createdAt : now,
    updatedAt: now,
  });
}

export async function getSocialAccount(
  userId: string,
  platform: SocialPlatform
): Promise<SocialAccountDoc | null> {
  const doc = await adminDb
    .collection("social_accounts")
    .doc(docId(userId, platform))
    .get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as SocialAccountDoc;
}

export async function updateTokens(
  userId: string,
  platform: SocialPlatform,
  tokens: { accessToken: string; refreshToken?: string; expiresIn: number }
): Promise<void> {
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + tokens.expiresIn * 1000));
  const update: Record<string, unknown> = {
    accessToken: encrypt(tokens.accessToken),
    expiresAt,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (tokens.refreshToken) {
    update.refreshToken = encrypt(tokens.refreshToken);
  }
  await adminDb
    .collection("social_accounts")
    .doc(docId(userId, platform))
    .update(update);
}

export async function deleteSocialAccount(
  userId: string,
  platform: SocialPlatform
): Promise<void> {
  await adminDb
    .collection("social_accounts")
    .doc(docId(userId, platform))
    .delete();
}

export async function getUserSocialAccounts(userId: string): Promise<SocialAccountDoc[]> {
  const snap = await adminDb
    .collection("social_accounts")
    .where("userId", "==", userId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SocialAccountDoc));
}

export function decryptToken(encrypted: string): string {
  return decrypt(encrypted);
}
