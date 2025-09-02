// middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { env } from 'hono/adapter';
import { Session } from '../models/Session.js';

export const authMiddleware = createMiddleware(async (c, next) => {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization header missing or invalid' }, 401);
    }

    const token = authHeader.substring(7);

    try {
        const payload = await verify(token, JWT_SECRET, 'HS256');
        const session = await Session.findOne({ accessToken: token })

        if (!session) {
            throw new Error('Invalid or expired token');
        }

        c.set('user', {
            userId: payload.sub,
            scopes: session.scopes,
        });

        await next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
});