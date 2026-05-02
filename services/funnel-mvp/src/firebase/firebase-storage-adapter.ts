import type { StorageAdapter } from "../services/storage-adapter.js";
import { nowIso } from "../utils/time.js";

type BucketLike = {
  file(storagePath: string): {
    getSignedUrl(input: {
      action: "write" | "read";
      expires: Date | number;
      contentType?: string;
    }): Promise<[string]>;
    download(): Promise<[Buffer]>;
    getMetadata(): Promise<[{ name?: string; contentType?: string }, ...unknown[]]>;
    save(content: Buffer, input: { contentType: string; resumable: boolean }): Promise<void>;
  };
};

export class FirebaseStorageAdapter implements StorageAdapter {
  constructor(private readonly bucket: BucketLike) {}

  async createSignedUploadTarget(input: {
    sessionId: string;
    filename: string;
    mimeType: string;
  }) {
    const storagePath = `uploads/${input.sessionId}/${input.filename}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [uploadUrl] = await this.bucket.file(storagePath).getSignedUrl({
      action: "write",
      expires: expiresAt,
      contentType: input.mimeType
    });

    return {
      uploadUrl,
      storagePath,
      expiresAt: expiresAt.toISOString()
    };
  }

  async readDocument(storagePath: string) {
    const file = this.bucket.file(storagePath);
    const [content] = await file.download();
    const [metadata] = await file.getMetadata();

    return {
      storagePath,
      filename: metadata.name ?? storagePath.split("/").at(-1) ?? "document",
      mimeType: metadata.contentType ?? "text/plain",
      content
    };
  }

  async saveReport(input: {
    sessionId: string;
    filename: string;
    content: Buffer;
    mimeType: string;
  }) {
    const storagePath = `reports/${input.sessionId}/${nowIso()}-${input.filename}`;
    const file = this.bucket.file(storagePath);
    await file.save(input.content, {
      contentType: input.mimeType,
      resumable: false
    });
    return storagePath;
  }

  async createSignedDownloadUrl(storagePath: string) {
    const [url] = await this.bucket.file(storagePath).getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000
    });
    return url;
  }
}
