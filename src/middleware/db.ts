import { connectDB } from '../db/mongoose.js'

export async function dbMiddleware(c: any, next: any) {
    await connectDB()
    return next()
}
