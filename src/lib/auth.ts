import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthUser } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthUser | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
