import { createHmac, timingSafeEqual } from "node:crypto";

export function createHmacSignature(payload: string, timestamp: string, secret: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
}

export function verifyHmacSignature(input: {
  payload: string;
  timestamp: string | undefined;
  providedSignature: string | undefined;
  secret: string;
}) {
  if (!input.timestamp || !input.providedSignature) {
    return false;
  }

  const expected = createHmacSignature(input.payload, input.timestamp, input.secret);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(input.providedSignature);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
