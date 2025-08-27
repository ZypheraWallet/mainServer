import { Session } from '../models/Session.js'
import { sign, verify } from 'hono/jwt'

export async function createSession(userId: string, jwtSecret: string) {
    const accessTokenExpiresIn = 15 * 60
    const refreshTokenExpiresIn = 30 * 24 * 60 * 60

    const accessToken = await sign(
        {
            sub: userId,
            type: 'access',
            exp: Math.floor(Date.now() / 1000) + accessTokenExpiresIn,
        },
        jwtSecret
    )

    const refreshToken = await sign(
        {
            sub: userId,
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) + refreshTokenExpiresIn,
        },
        jwtSecret
    )

    await Session.create({
        userId,
        refreshToken,
        scopes: ['*'],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + refreshTokenExpiresIn * 1000),
    })

    return { accessToken, refreshToken }
}

export async function verifyToken(token: string, jwtSecret: string) {
    try {
        const payload = await verify(token, jwtSecret)
        return payload
    } catch (err) {
        return null
    }
}

export async function getSessionByAccessToken(accessToken: string) {
    return Session.findOne({ token: accessToken })
}

export async function deleteSession(accessToken: string) {
    return Session.deleteOne({ token: accessToken })
}
