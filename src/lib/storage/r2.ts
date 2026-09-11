import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { type StorageProvider, type UploadIntent, type UploadOptions } from "./types";

const PRESIGN_EXPIRES_IN = 5 * 60; // seconds

function createClient(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// Lazily created so import doesn't crash when env vars are absent.
let _client: S3Client | null = null;
function client(): S3Client {
  return (_client ??= createClient());
}

export class R2StorageProvider implements StorageProvider {
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const bucket = process.env.R2_BUCKET;
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!bucket || !publicUrl) {
      throw new Error(
        "R2_BUCKET and R2_PUBLIC_URL must be set to use R2StorageProvider",
      );
    }
    this.bucket = bucket;
    this.publicUrl = publicUrl.replace(/\/$/, "");
  }

  async getUploadIntent(
    key: string,
    opts: UploadOptions,
  ): Promise<UploadIntent> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: opts.contentType,
      ...(opts.metadata ? { Metadata: opts.metadata } : {}),
    });

    const url = await getSignedUrl(client(), command, {
      expiresIn: PRESIGN_EXPIRES_IN,
    });

    return {
      key,
      url,
      method: "PUT",
      headers: { "Content-Type": opts.contentType },
      expiresAt: new Date(Date.now() + PRESIGN_EXPIRES_IN * 1000),
    };
  }

  async deleteObject(key: string): Promise<void> {
    await client().send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
