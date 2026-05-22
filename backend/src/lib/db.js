import mongoose from 'mongoose'

function parseMongoHost(uri) {
  try {
    const url = new URL(uri)
    return url.hostname
  } catch {
    return uri
  }
}

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required')
  }

  mongoose.set('strictQuery', true)
  const options = {
    autoIndex: false,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    family: 4,
  }

  try {
    await mongoose.connect(uri, options)
    console.log('Connected to MongoDB')
    return
  } catch (error) {
    const host = parseMongoHost(uri)
    console.error(`MongoDB connection failed for ${host}:`, error.message || error)

    const fallbackUri = process.env.MONGODB_FALLBACK_URI || 'mongodb://127.0.0.1:27017/assets'
    if (fallbackUri && fallbackUri !== uri) {
      console.log(`Attempting fallback MongoDB connection: ${fallbackUri}`)
      try {
        await mongoose.connect(fallbackUri, options)
        console.log('Connected to fallback MongoDB')
        return
      } catch (fallbackError) {
        console.error('Fallback MongoDB connection failed:', fallbackError.message || fallbackError)
      }
    }

    throw new Error(
      `Unable to connect to MongoDB. ` +
      `Check that your primary URI is valid and reachable, or set MONGODB_FALLBACK_URI to a local MongoDB instance for development.`
    )
  }
}
