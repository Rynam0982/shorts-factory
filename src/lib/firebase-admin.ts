import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  // Vercel stores env vars verbatim — strip accidental surrounding quotes
  // and convert literal \n to real newlines
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? "";
  const privateKey = rawKey
    .replace(/^"|"$/g, "")   // remove leading/trailing " if present
    .replace(/\\n/g, "\n");  // literal \n → real newline

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Firebase Admin: missing env vars — ` +
      `FIREBASE_PROJECT_ID=${!!projectId}, ` +
      `FIREBASE_CLIENT_EMAIL=${!!clientEmail}, ` +
      `FIREBASE_PRIVATE_KEY=${!!privateKey}`
    );
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminDb = getFirestore();
