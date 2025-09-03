import { Wallet } from "../models/Wallet.js";
import { type IWallet } from "../../types/models.js";

// Создание нового кошелька
export async function createWallet(walletData: Partial<IWallet>): Promise<IWallet> {
    const wallet = new Wallet(walletData);
    return await wallet.save();
}

// Получение кошелька по ID
export async function getWalletById(id: string): Promise<IWallet | null> {
    return Wallet.findById(id).populate('userId multisig');
}

// Получение всех кошельков пользователя
export async function getUserWallets(userId: string): Promise<IWallet[]> {
    return Wallet.find({ userId, isActive: true });
}

// Обновление баланса
export async function updateBalance(walletId: string, amount: number): Promise<IWallet | null> {
    return Wallet.findByIdAndUpdate(
        walletId,
        { $inc: { balance: amount } },
        { new: true }
    );
}

// Добавление NFT
export async function addNFT(walletId: string, nftId: string): Promise<IWallet | null> {
    return Wallet.findByIdAndUpdate(
        walletId,
        { $push: { nfts: nftId } },
        { new: true }
    );
}

// Обновление тегов
export async function updateTags(walletId: string, tags: string[]): Promise<IWallet | null> {
    return Wallet.findByIdAndUpdate(
        walletId,
        { tags },
        { new: true }
    );
}

// Деактивация кошелька
export async function deactivateWallet(walletId: string): Promise<IWallet | null> {
    return Wallet.findByIdAndUpdate(
        walletId,
        { isActive: false },
        { new: true }
    );
}

// Поиск по тегам и валюте
export async function findWalletsByCriteria(criteria: {
    tags?: string[];
    currency?: string;
    minBalance?: number;
}): Promise<IWallet[]> {
    const query: any = { isActive: true };

    if (criteria.tags) {
        query.tags = { $in: criteria.tags };
    }
    if (criteria.currency) {
        query.currency = criteria.currency;
    }
    if (criteria.minBalance !== undefined) {
        query.balance = { $gte: criteria.minBalance };
    }

    return Wallet.find(query);
}
