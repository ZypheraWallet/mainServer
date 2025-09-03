import { Hono } from 'hono'
import { authMiddleware } from '../../../middleware/auth.js'
import { type VariblesUser } from '../../../../types/index.js';
import { havePermission } from '../../../utils/permissions.js';

import { getUserWallets } from '../../../utils/wallet.js';

const wallet = new Hono<VariblesUser>();

wallet.get('/balance', authMiddleware, async (c) => {
    const user = c.get('user');

    if (!havePermission('wallet:read', user.scopes)) {
        return c.json({ error: 'Forbidden: insufficient permissions' }, 403);
    }

    const wallets = await getUserWallets(user.userId);

    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

    return c.json({ balance: totalBalance, currency: 'RUB' });
});

export default wallet