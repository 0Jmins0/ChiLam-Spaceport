import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/db';

// 管理员 JWT payload 类型
export interface AdminPayload {
  adminId: string;
  email: string;
  name: string;
}

// Note: ADMIN_JWT_SECRET is kept for reference but no longer used for verification.
// Admin auth now goes through USER_JWT_SECRET + role check.

const USER_JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-fallback-secret-do-not-use-in-production',
);

/**
 * 验证管理员 JWT token
 * 使用 USER_JWT_SECRET 验证用户 token，然后检查用户角色是否为 ADMIN
 * 返回 admin payload 或 null
 */
export async function verifyAdmin(request: Request): Promise<AdminPayload | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const { payload } = await jwtVerify(token, USER_JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (!payload.userId || !payload.username) return null;

    // Check if user has admin role
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (!user || user.role !== 'ADMIN') return null;

    return {
      adminId: user.id,
      email: user.username,
      name: user.displayName || user.username,
    };
  } catch {
    return null;
  }
}

export interface UserPayload {
  userId: string;
  username: string;
}

export async function signUserToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(USER_JWT_SECRET);
}

export async function verifyUser(request: Request): Promise<UserPayload | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const { payload } = await jwtVerify(token, USER_JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (!payload.userId || !payload.username) return null;

    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}
