import { MongoClient, Db, MongoClientOptions } from "mongodb"

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error("Missing MONGODB_URI environment variable")

const tlsAllowInvalid = process.env.MONGODB_TLS_ALLOW_INVALID === 'true'

const mongoOptions: MongoClientOptions = {
  maxPoolSize: 20,
  // short timeouts to fail fast and allow retry logic to run
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
}

if (tlsAllowInvalid) {
  mongoOptions.tls = true
  ;(mongoOptions as any).tlsAllowInvalidCertificates = true
  ;(mongoOptions as any).ssl = true
  ;(mongoOptions as any).sslValidate = false
  ;(mongoOptions as any).checkServerIdentity = () => undefined
}

// If using SRV connection strings, also append the TLS query param so it is
// honored by DNS seedlist connections.
let connectionString = uri
if (tlsAllowInvalid) {
  const opt = 'tls=true&tlsAllowInvalidCertificates=true'
  connectionString = connectionString.includes('?')
    ? `${connectionString}&${opt}`
    : `${connectionString}?${opt}`
}

const mongoClient = new MongoClient(connectionString, mongoOptions)

let cachedDb: Db | null = null

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb
  // Ensure client is connected with retries for transient network/SSL errors
  const maxAttempts = 3
  let attempt = 0
  while (true) {
    attempt++
    try {
      if (!mongoClient.topology || (mongoClient.topology as any).isDestroyed()) {
        await mongoClient.connect()
      } else if (!(mongoClient as any).isConnected) {
        await mongoClient.connect()
      }
      break
    } catch (err) {
      console.error(`Mongo connect attempt ${attempt} failed:`, err)
      if (attempt >= maxAttempts) throw err
      // exponential backoff
      const wait = 300 * Math.pow(2, attempt)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  const dbName = process.env.MONGODB_DB || 'default'
  cachedDb = mongoClient.db(dbName)
  return cachedDb
}

export async function closeMongo() {
  await mongoClient.close()
  cachedDb = null
}

export { MongoClient }
