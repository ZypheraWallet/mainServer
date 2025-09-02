import { Hono } from 'hono'
import { authMiddleware } from '../../../middleware/auth.js'
import { type VariblesUser } from '../../../../types/index.js';
import { havePermission } from '../../../utils/permissions.js';

const wallet = new Hono<VariblesUser>();

wallet.get('/balance', authMiddleware, async (c) => {
    const user = c.get('user');

    if (!havePermission('wallet:read', user.scopes)) {
        return c.json({ error: 'Forbidden: insufficient permissions' }, 403);
    }

    return c.json({ balance: 1000, currency: 'RUB' });
});

export default wallet