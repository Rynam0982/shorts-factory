import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "./api-clients";
import fs from "fs";
import path from "path";
import os from "os";

export async function uploadToR2(
  localPath: string,
  key: string,
  contentType?: string
): Promise<string> {
  const { s3, bucket, publicBaseUrl } = await getR2Client();

  const buffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).slice(1);
  const ct = contentType ?? (ext === "mp4" ? "video/mp4" : ext === "jpg" ? "image/jpeg" : "application/octet-stream");

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: ct,
    })
  );

  return `${publicBaseUrl}/${key}`;
}

export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const { s3, bucket, publicBaseUrl } = await getR2Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${publicBaseUrl}/${key}`;
}

export async function downloadBuffer(key: string): Promise<Buffer> {
  const { s3, bucket } = await getR2Client();

  const response = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );

  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
