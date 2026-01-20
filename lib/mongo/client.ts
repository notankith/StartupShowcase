import { MongoClient, Db } from "mongodb"

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error("Missing MONGODB_URI environment variable")

const mongoClient = new MongoClient(uri, {
  maxPoolSize: 20,
})

let cachedDb: Db | null = null

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb
  if (!mongoClient.topology || mongoClient.topology.isDestroyed()) {
    await mongoClient.connect()
  } else if (!mongoClient.isConnected) {
    await mongoClient.connect()
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
