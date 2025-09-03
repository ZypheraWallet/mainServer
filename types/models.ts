import { Document, Types } from 'mongoose';

export interface IWallet extends Document {
    userId: Types.ObjectId;
    name: string;
    type: 'custodial' | 'non-custodial';
    currency: string;
    balance: number;
    nfts?: string[];
    tags?: string[];
    multisig?: Types.ObjectId[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser extends Document {
    username?: string
    email: string
    googleId: string
    avatarUrl?: string
    createdAt: Date
    lastLogin?: Date
}

export interface ISession extends Document {
    userId: Types.ObjectId
    device?: string
    platform?: string
    ip?: string
    scopes: string[]
    accessToken: string
    refreshToken: string
    createdAt: Date
    updatedAt: Date
    expiresAt?: Date
}