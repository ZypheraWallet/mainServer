import mongoose, { Schema } from 'mongoose'
import { type IUser } from '../../types/models.js'

const UserSchema = new Schema<IUser>({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true },
    avatarUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
})

export const User = mongoose.model<IUser>('Users', UserSchema)
