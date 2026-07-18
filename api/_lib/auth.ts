import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'bait-el-hakma-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  // Works with both standard Request and VercelRequest
  const headers = request.headers;
  let authHeader: string | null = null;

  if (typeof headers.get === 'function') {
    authHeader = headers.get('Authorization');
  } else {
    // VercelRequest: headers is a plain object
    authHeader = (headers as any).authorization || (headers as any).Authorization || null;
  }

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function getUserFromRequest(request: Request): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
