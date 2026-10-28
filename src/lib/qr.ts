import crypto from "crypto";

const SECRET = process.env.QR_HMAC_SECRET || "strict-attend-flow-default-secret-key-998877";

/**
 * Generate a rotating token for a session that refreshes every 30 seconds
 * Format: `${sessionId}:${timestamp30s}:${signature}`
 */
export function generateRotatingQrToken(sessionId: string): { token: string; code: string; expiresInSeconds: number } {
  const currentEpochSeconds = Math.floor(Date.now() / 1000);
  const windowInterval = 30; // 30 seconds rotation
  const timeWindow = Math.floor(currentEpochSeconds / windowInterval);
  const expiresInSeconds = windowInterval - (currentEpochSeconds % windowInterval);

  const data = `${sessionId}:${timeWindow}`;
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(data);
  const signature = hmac.digest("hex").slice(0, 16);

  // Generate deterministic 4-digit code from the signature for this window
  const numericCode = String(parseInt(signature.slice(0, 8), 16) % 9000 + 1000);

  const token = `${sessionId}.${timeWindow}.${signature}`;
  return { token, code: numericCode, expiresInSeconds };
}

/**
 * Verify a rotating QR token or 4-digit code.
 * Allows current window and previous window (30s grace for network transit).
 */
export function verifyQrTokenOrCode({
  sessionId,
  token,
  code,
}: {
  sessionId: string;
  token?: string;
  code?: string;
}): boolean {
  const currentEpochSeconds = Math.floor(Date.now() / 1000);
  const windowInterval = 30;
  const currentWindow = Math.floor(currentEpochSeconds / windowInterval);
  const windows = [currentWindow, currentWindow - 1]; // Current & previous 30s window

  for (const win of windows) {
    const data = `${sessionId}:${win}`;
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(data);
    const signature = hmac.digest("hex").slice(0, 16);
    const expectedCode = String(parseInt(signature.slice(0, 8), 16) % 9000 + 1000);

    // Check code if provided
    if (code && code === expectedCode) {
      return true;
    }

    // Check token if provided
    if (token) {
      const parts = token.split(".");
      if (parts.length === 3) {
        const [tokSessionId, tokWindowStr, tokSig] = parts;
        if (
          tokSessionId === sessionId &&
          parseInt(tokWindowStr, 10) === win &&
          tokSig === signature
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
