export interface SignedUploadTarget {
  uploadUrl: string;
  storagePath: string;
  expiresAt: string;
}

export interface DocumentFile {
  storagePath: string;
  filename: string;
  mimeType: string;
  content: Buffer;
}

export interface StorageAdapter {
  createSignedUploadTarget(input: {
    sessionId: string;
    filename: string;
    mimeType: string;
  }): Promise<SignedUploadTarget>;
  readDocument(storagePath: string): Promise<DocumentFile>;
  saveReport(input: {
    sessionId: string;
    filename: string;
    content: Buffer;
    mimeType: string;
  }): Promise<string>;
  createSignedDownloadUrl(storagePath: string): Promise<string>;
}
