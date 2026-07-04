import jwt from 'jsonwebtoken';

export interface UserPayload {
  userId: number;
  username: string;
  nama: string;
}

function getSecret(): string {
  const secret = import.meta.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'userId' in decoded &&
      'username' in decoded &&
      'nama' in decoded
    ) {
      return decoded as UserPayload;
    }
    return null;
  } catch {
    return null;
  }
}
