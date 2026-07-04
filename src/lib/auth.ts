import { SignJWT, jwtVerify } from 'jose';

export interface UserPayload {
  userId: number;
  username: string;
  nama: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = Number(payload['userId']);
    const username = payload['username'];
    const nama = payload['nama'];
    if (
      Number.isInteger(userId) &&
      userId > 0 &&
      typeof username === 'string' &&
      typeof nama === 'string'
    ) {
      return { userId, username, nama };
    }
    return null;
  } catch {
    return null;
  }
}
