import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Firebase Admin: missing env vars — ` +
      `FIREBASE_PROJECT_ID=${!!projectId}, ` +
      `FIREBASE_CLIENT_EMAIL=${!!clientEmail}, ` +
      `FIREBASE_PRIVATE_KEY=${!!privateKey}`
    );
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const adminDb = getFirestore();
