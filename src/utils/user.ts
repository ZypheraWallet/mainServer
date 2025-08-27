import { User } from '../models/User.js'

export async function findUserByGoogleId(googleId: string) {
    return User.findOne({ googleId })
}

export async function findUserById(id: string) {
    return User.findById(id)
}

export async function createUser(data: {
    googleId: string
    email: string
    username: string
    avatarUrl?: string
}) {
    return User.create(data)
}

export async function upsertUserByGoogleId(data: {
    googleId: string
    email: string
    username: string
    avatarUrl?: string
}) {
    return User.findOneAndUpdate(
        { googleId: data.googleId },
        { $set: data },
        { upsert: true, new: true }
    )
}
