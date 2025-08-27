import mongoose from 'mongoose'
import 'dotenv/config'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zyphera'
if (!MONGO_URI) throw new Error('MONGO_URI must be defined')

const globalAny = global as any
globalAny.mongooseConn = globalAny.mongooseConn || { conn: null, promise: null }

export async function connectDB() {
    if (globalAny.mongooseConn.conn) return globalAny.mongooseConn.conn

    if (!globalAny.mongooseConn.promise) {
        globalAny.mongooseConn.promise = mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        })
    }

    globalAny.mongooseConn.conn = await globalAny.mongooseConn.promise
    console.log('MongoDB connected')
    return globalAny.mongooseConn.conn
}
