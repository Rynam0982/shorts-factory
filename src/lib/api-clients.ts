import { adminDb } from "./firebase-admin";
import { safeDecrypt } from "./crypto";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { fal } from "@fal-ai/client";
import { ElevenLabsClient } from "elevenlabs";
import { S3Client } from "@aws-sdk/client-s3";

export class MissingApiKeyError extends Error {
  constructor(public service: string) {
    super(`MISSING_API_KEY:${service}`);
    this.name = "MissingApiKeyError";
  }
}

async function getApiKeyValue(service: string): Promise<string> {
  // Try Firestore first
  try {
    const doc = await adminDb.collection("api_keys").doc("current").get();
    if (doc.exists) {
      const data = doc.data()!;
      const keyData = data[service];
      if (keyData?.enabled && keyData?.value) {
        const value = safeDecrypt(keyData.value) ?? keyData.value;
        if (value) return value;
      }
    }
  } catch {
    // fallback to env
  }

  // Fallback to env
  const envMap: Record<string, string | undefined> = {
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    fal: process.env.FAL_KEY,
    elevenlabs: process.env.ELEVENLABS_API_KEY,
    pixabay: process.env.PIXABAY_API_KEY,
    pexels: process.env.PEXELS_API_KEY,
    apiframe: process.env.APIFRAME_KEY,
    resend: process.env.RESEND_API_KEY,
  };

  const envValue = envMap[service];
  if (envValue) return envValue;

  throw new MissingApiKeyError(service);
}

export async function getAnthropicClient(): Promise<Anthropic> {
  const key = await getApiKeyValue("anthropic");
  return new Anthropic({ apiKey: key });
}

export async function getOpenAIClient(): Promise<OpenAI> {
  const key = await getApiKeyValue("openai");
  return new OpenAI({ apiKey: key });
}

export async function getFalApiKey(): Promise<string> {
  return getApiKeyValue("fal");
}

export async function configureFalClient(): Promise<void> {
  const key = await getFalApiKey();
  fal.config({ credentials: key });
}

export async function getElevenLabsClient(): Promise<ElevenLabsClient> {
  const key = await getApiKeyValue("elevenlabs");
  return new ElevenLabsClient({ apiKey: key });
}

export async function getR2Client(): Promise<{
  s3: S3Client;
  bucket: string;
  publicBaseUrl: string;
}> {
  // R2 is primarily from env (not editable post-setup for security)
  const accountId =
    process.env.R2_ACCOUNT_ID ?? (await getApiKeyValue("r2_account_id"));
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID ?? (await getApiKeyValue("r2_access_key_id"));
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY ??
    (await getApiKeyValue("r2_secret_access_key"));
  const bucket = process.env.R2_BUCKET ?? "shorts-factory-v2";
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL ?? "";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new MissingApiKeyError("r2");
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { s3, bucket, publicBaseUrl };
}

export async function getPixabayKey(): Promise<string> {
  return getApiKeyValue("pixabay");
}

export async function getPexelsKey(): Promise<string> {
  return getApiKeyValue("pexels");
}

export async function getApiframeKey(): Promise<string> {
  return getApiKeyValue("apiframe");
}

export async function getResendKey(): Promise<string> {
  return getApiKeyValue("resend");
}
