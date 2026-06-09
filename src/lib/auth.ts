import { jwtVerify, SignJWT } from 'jose';

// 管理员 JWT payload 类型
export interface AdminPayload {
  adminId: string;
  email: string;
  name: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-secret-do-not-use-in-production',
);

/**
 * 验证管理员 JWT token
 * 从 Request headers 读取 Authorization: Bearer <token>
 * 返回 admin payload 或 null
 */
export async function verifyAdmin(request: Request): Promise<AdminPayload | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // 验证 payload 中包含必要字段
    if (!payload.adminId || !payload.email || !payload.name) {
      return null;
    }

    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export interface UserPayload {
  userId: string;
  username: string;
}

const USER_JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-fallback-secret-do-not-use-in-production',
);

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
