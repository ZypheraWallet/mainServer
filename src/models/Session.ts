import mongoose, { Schema } from 'mongoose'
import { type ISession } from '../../types/models.js'

const SessionSchema = new Schema<ISession>({
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    device: { type: String },
    platform: { type: String },
    ip: { type: String },
    scopes: { type: [String], default: [] },
    accessToken: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
})

SessionSchema.pre('save', function (next) {
    this.updatedAt = new Date()
    next()
})

export const Session = mongoose.model<ISession>('Session', SessionSchema)
