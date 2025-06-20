
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { JWTPayload } from '../types/index.js';

export class AuthService {
  validateToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, config.SUPABASE_JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('JWT validation failed:', error);
      return null;
    }
  }

  extractTokenFromHeaders(headers: Record<string, string | string[]>): string | null {
    const authorization = headers.authorization;
    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      return authorization.slice(7);
    }
    return null;
  }
}
