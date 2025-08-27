import mongoose from 'mongoose'
import 'dotenv/config'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zyphera'
if (!MONGO_URI) throw new Error('MONGO_URI must be defined')

const globalWithMongoose = global as typeof global & {
    mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

const cached = globalWithMongoose.mongooseConn || { conn: null, promise: null }

export async function connectDB() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }

        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            return mongoose
        })
    }

    try {
        cached.conn = await cached.promise
        console.log('MongoDB connected successfully')
    } catch (e) {
        cached.promise = null
        throw e
    }

    return cached.conn
}