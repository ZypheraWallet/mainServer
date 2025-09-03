import mongoose, { Schema } from 'mongoose';
import { type IWallet } from '../../types/models.js';

const WalletSchema: Schema = new Schema<IWallet>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['custodial', 'non-custodial'], default: 'custodial' },
    currency: { type: String, required: true },
    balance: { type: Number, default: 0 },
    nfts: [{ type: String }],
    tags: [{ type: String }],
    multisig: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
