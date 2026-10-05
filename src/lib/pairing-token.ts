import crypto from 'crypto';

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'arthaflow-secure-pairing-salt-2026';

/**
 * Generate a short, stateless, verifiable pairing code:
 * Format: AF-USERPREFIX-TIMESTAMP-SIGNATURE
 * E.g. AF-U1-6H9A-9F2B
 * Or short base64url payload with HMAC signature.
 */
export function generateSignedPairingCode(userId: string, tenantId: string): string {
  // Payload: userId|tenantId|expiresAt
  const expiresAt = Math.floor((Date.now() + 15 * 60 * 1000) / 1000); // 15 mins timestamp in seconds
  const payload = `${userId}:${tenantId}:${expiresAt}`;
  
  // Create signature
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').substring(0, 8);
  const encodedPayload = Buffer.from(payload).toString('base64url');
  
  return `AF_${encodedPayload}_${hmac}`;
}

/**
 * Verify and unpack signed pairing code
 */
export function verifySignedPairingCode(code: string): { userId: string; tenantId: string } | null {
  try {
    const clean = code.trim();
    if (!clean.startsWith('AF_')) return null;

    const parts = clean.split('_');
    if (parts.length !== 3) return null;

    const [prefix, encodedPayload, signature] = parts;
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    
    // Verify signature
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').substring(0, 8);
    if (signature !== expectedSig) {
      console.warn('Pairing token signature mismatch');
      return null;
    }

    const [userId, tenantId, expiresAtStr] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (now > expiresAt) {
      console.warn('Pairing token expired');
      return null;
    }

    return { userId, tenantId };
  } catch (err) {
    console.error('Error verifying pairing code:', err);
    return null;
  }
}
