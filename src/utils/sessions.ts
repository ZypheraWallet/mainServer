import { Session } from '../models/Session.js'
import { sign, verify } from 'hono/jwt'

const accessTokenExpiresIn = 15 * 60
const refreshTokenExpiresIn = 30 * 24 * 60 * 60

export async function createSession(userId: string, jwtSecret: string) {

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


export async function refreshToken(oldRefreshToken: string, jwtSecret: string) {

    if (!jwtSecret) throw new Error('jwtSecret not defined')

    let payload: any
    try {
        payload = await verify(oldRefreshToken, jwtSecret)
        if (!payload || payload.type !== 'refresh') throw new Error('Invalid token')
    } catch (error) {
        throw new Error('Invalid refresh token')
    }

    const session = await Session.findOne({ refreshToken: oldRefreshToken })

    if (!session) throw new Error('Session not found')

    const userId = session.userId.toString()

    const accessToken = await sign({
        sub: userId,
        type: 'access',
        exp: Math.floor(Date.now() / 1000) + accessTokenExpiresIn,
    }, jwtSecret)

    const newRefreshToken = await sign({
        sub: userId,
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + refreshTokenExpiresIn,
    }, jwtSecret)

    session.refreshToken = newRefreshToken
    session.updatedAt = new Date()
    await session.save()

    return {
        accessToken,
        newRefreshToken,
    }
}