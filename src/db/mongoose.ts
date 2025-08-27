import mongoose from 'mongoose'
import 'dotenv/config'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zyphera'

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('MongoDB connected')
    } catch (err) {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    }
}
