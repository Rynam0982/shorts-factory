import type { Timestamp } from "firebase-admin/firestore";

export type TxType =
  | "PURCHASE"
  | "SUBSCRIPTION_GRANT"
  | "CONSUMPTION"
  | "RESERVATION"
  | "RESERVATION_RELEASE"
  | "REFUND"
  | "BONUS"
  | "ADMIN_ADJUSTMENT";

export interface CreditTransactionDoc {
  id: string;
  userId: string;
  type: TxType;
  amount: number;
  balanceAfter: number;
  relatedJobId: string | null;
  stripeEventId: string | null;
  stripePaymentId: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
}
