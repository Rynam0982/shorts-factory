import { adminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { TxType } from "@/types/credits";

export class InsufficientCreditsError extends Error {
  constructor(
    public required: number,
    public available: number
  ) {
    super(`Insufficient credits: need ${required}, have ${available}`);
    this.name = "InsufficientCreditsError";
  }
}

interface ApplyCreditTransactionParams {
  userId: string;
  type: TxType;
  amount: number;
  description: string;
  relatedJobId?: string;
  stripeEventId?: string;
  stripePaymentId?: string;
  metadata?: Record<string, unknown>;
  bypassBalanceCheck?: boolean;
}

export async function applyCreditTransaction(
  params: ApplyCreditTransactionParams
): Promise<{ balanceAfter: number; transactionId: string }> {
  const {
    userId,
    type,
    amount,
    description,
    relatedJobId = null,
    stripeEventId = null,
    stripePaymentId = null,
    metadata = {},
    bypassBalanceCheck = false,
  } = params;

  let transactionId = "";
  let balanceAfter = 0;

  await adminDb.runTransaction(async (tx) => {
    // Idempotence check
    if (stripeEventId) {
      const eventQuery = await tx.get(
        adminDb
          .collection("credit_transactions")
          .where("stripeEventId", "==", stripeEventId)
          .limit(1)
      );
      if (!eventQuery.empty) {
        const existing = eventQuery.docs[0];
        transactionId = existing.id;
        const userData = (await tx.get(adminDb.collection("users").doc(userId))).data();
        balanceAfter = userData?.creditsBalance ?? 0;
        return;
      }
    }

    // Read user
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await tx.get(userRef);
    if (!userDoc.exists) throw new Error("User not found");

    const userData = userDoc.data()!;
    const currentBalance: number = userData.creditsBalance ?? 0;
    const newBalance = currentBalance + amount;

    // Balance check for debits
    if (!bypassBalanceCheck && !userData.isAdminTestMode && amount < 0 && newBalance < 0) {
      throw new InsufficientCreditsError(Math.abs(amount), currentBalance);
    }

    balanceAfter = userData.isAdminTestMode && amount < 0 ? currentBalance : newBalance;

    // Create ledger entry (IMMUTABLE — never update/delete)
    const txRef = adminDb.collection("credit_transactions").doc();
    transactionId = txRef.id;

    tx.set(txRef, {
      userId,
      type,
      amount,
      balanceAfter,
      relatedJobId,
      stripeEventId,
      stripePaymentId,
      description,
      metadata,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update user balance cache (skip for admin test mode debits)
    const balanceUpdate: Record<string, unknown> = {
      creditsBalance: balanceAfter,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (amount > 0) {
      balanceUpdate.totalCreditsEarned = FieldValue.increment(amount);
    } else if (amount < 0 && !userData.isAdminTestMode) {
      balanceUpdate.totalCreditsSpent = FieldValue.increment(Math.abs(amount));
    }

    tx.update(userRef, balanceUpdate);
  });

  return { balanceAfter, transactionId };
}

export async function recalculateBalance(userId: string): Promise<number> {
  const txSnap = await adminDb
    .collection("credit_transactions")
    .where("userId", "==", userId)
    .get();

  const total = txSnap.docs.reduce(
    (sum, d) => sum + (d.data().amount as number),
    0
  );

  await adminDb.collection("users").doc(userId).update({
    creditsBalance: total,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return total;
}
