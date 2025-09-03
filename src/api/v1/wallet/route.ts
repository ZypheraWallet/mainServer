import { Hono } from 'hono'
import { authMiddleware } from '../../../middleware/auth.js'
import { type VariblesUser } from '../../../../types/index.js';
import { havePermission } from '../../../utils/permissions.js';

import { getUserWallets } from '../../../utils/wallet.js';
import { convertCurrency } from '../../../utils/currency.js';

const wallet = new Hono<VariblesUser>();

wallet.get('/balance', authMiddleware, async (c) => {
    const user = c.get('user');

    if (!havePermission('wallet:read', user.scopes)) {
        return c.json({ error: 'Forbidden: insufficient permissions' }, 403);
    }

    try {
        const targetCurrency = c.req.query('currency') || 'RUB';
        const wallets = await getUserWallets(user.userId);

        const totalBalanceInTON = wallets.reduce((sum, w) => {
            if (w.currency === 'TON') {
                return sum + (w.balance || 0);
            }
            return sum;
        }, 0);

        let convertedBalance = totalBalanceInTON;
        if (targetCurrency !== 'TON') {
            convertedBalance = await convertCurrency(totalBalanceInTON, 'TON', targetCurrency);
        }

        return c.json({
            balance: convertedBalance,
            currency: targetCurrency
        });
    } catch (error) {
        console.error('Balance calculation error:', error);
        return c.json({ error: 'Failed to calculate balance' }, 500);
    }
});

wallet.get('/wallets', authMiddleware, async (c) => {
    const user = c.get('user')

    if (!havePermission('wallet:read', user.scopes)) {
        return c.json({ error: 'Forbidden: insufficient permissions' }, 403)
    }

    try {
        const targetCurrency = c.req.query('currency') || 'RUB';
        const wallets = await getUserWallets(user.userId);

        // Добавляем конвертированный баланс в каждый объект кошелька
        const walletsWithConvertedBalance = await Promise.all(
            wallets.map(async (wallet) => {
                // Создаем копию объекта кошелька
                const walletWithConverted = { ...wallet.toObject ? wallet.toObject() : wallet };

                // Добавляем поле convertedBalance
                if (wallet.currency !== targetCurrency && wallet.balance !== null && wallet.balance !== undefined) {
                    try {
                        walletWithConverted.convertedBalance = await convertCurrency(
                            wallet.balance,
                            wallet.currency,
                            targetCurrency
                        );
                    } catch (error) {
                        console.error(`Failed to convert ${wallet.currency} to ${targetCurrency}:`, error);
                        // В случае ошибки не добавляем поле или устанавливаем в null
                        walletWithConverted.convertedBalance = null;
                    }
                } else {
                    // Если валюта совпадает или баланс null/undefined
                    walletWithConverted.convertedBalance = wallet.balance;
                }

                return walletWithConverted;
            })
        );

        return c.json(walletsWithConvertedBalance);
    } catch (error) {
        console.error('Error fetching wallets:', error);
        return c.json({ error: 'Failed to fetch wallets' }, 500);
    }
})
export default wallet