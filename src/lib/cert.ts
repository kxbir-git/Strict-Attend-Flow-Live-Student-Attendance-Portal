import crypto from "crypto";

const SECRET = process.env.QR_HMAC_SECRET || "strict-attend-flow-super-secure-jwt-secret-key-32chars";

export interface CertificateData {
  certId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  overallPercentage: number;
  totalLectures: number;
  attendedLectures: number;
  generatedAt: string;
  isOfficial: boolean; // false if percentage < 75%
}

/**
 * Generates an HMAC-signed verification token for an attendance certificate.
 */
export function generateCertificateToken(data: CertificateData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verifies a certificate token against the secret and checks integrity.
 */
export function verifyCertificateToken(token: string): { valid: boolean; data?: CertificateData; error?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return { valid: false, error: "Invalid token format" };
    }

    const [payload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: "HMAC signature mismatch: Certificate has been tampered with or is counterfeit" };
    }

    const decodedJson = Buffer.from(payload, "base64url").toString("utf-8");
    const data = JSON.parse(decodedJson) as CertificateData;

    return { valid: true, data };
  } catch (err: any) {
    return { valid: false, error: "Malformed certificate token: " + (err?.message || "Unknown error") };
  }
}
