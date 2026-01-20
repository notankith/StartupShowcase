import { getDb } from "./client"
import { ObjectId } from "mongodb"

type Filter = { [k: string]: any }

class QueryBuilder {
  private collName: string
  private projection: any = null
  private filters: Filter = {}
  private sort: any = null
  private _limit: number | null = null

  constructor(collName: string) {
    this.collName = collName
  }

  select(_projection?: any, opts?: any) {
    // Supabase sometimes passes a string or fields; we ignore and return full docs by default
    if (opts && opts.count === "exact") {
      ;(this as any)._count = true
    }
    return this
  }

  eq(key: string, value: any) {
    this.filters[key] = value
    return this
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this.sort = { [field]: opts?.ascending ? 1 : -1 }
    return this
  }

  limit(n: number) {
    this._limit = n
    return this
  }

  async single() {
    const res = await this.execute()
    return { data: res.data?.[0] ?? null, error: null }
  }

  async insert(doc: any) {
    const db = await getDb()
    const coll = db.collection(this.collName)
    const r = await coll.insertOne(doc)
    const data = await coll.findOne({ _id: r.insertedId })
    return { data, error: null }
  }

  async delete() {
    const db = await getDb()
    const coll = db.collection(this.collName)
    if (this.filters.id) this.filters._id = this.toObjectId(this.filters.id)
    const r = await coll.deleteMany(this.filters)
    return { error: null, data: r }
  }

  async update(updateDoc: any) {
    const db = await getDb()
    const coll = db.collection(this.collName)
    if (this.filters.id) this.filters._id = this.toObjectId(this.filters.id)
    const r = await coll.findOneAndUpdate(this.filters, { $set: updateDoc }, { returnDocument: 'after' })
    return { data: r.value, error: null }
  }

  private toObjectId(val: any) {
    try {
      return new ObjectId(val)
    } catch (e) {
      return val
    }
  }

  async execute() {
    const db = await getDb()
    const coll = db.collection(this.collName)
    const filters = { ...this.filters }
    if (filters.id) filters._id = this.toObjectId(filters.id)
    delete filters.id

    const cursor = coll.find(filters, this.projection ? { projection: this.projection } : undefined)
    if (this.sort) cursor.sort(this.sort)
    if (this._limit) cursor.limit(this._limit)
    const data = await cursor.toArray()
    const out: any = { data }
    if ((this as any)._count) {
      out.count = await coll.countDocuments(filters)
    }
    return out
  }

  // Make the QueryBuilder thenable so `await builder` returns a supabase-like
  // `{ data, error }` shape
  then(resolve: any, reject: any) {
    this.execute()
      .then((result) => resolve({ data: result.data, error: null, count: (result as any).count }))
      .catch((err) => reject(err))
  }
}

export function from(collectionName: string) {
  return new QueryBuilder(collectionName)
}
