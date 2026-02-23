import { getDb } from "./client"
import { ObjectId } from "mongodb"

type Filter = { [k: string]: any }

class QueryBuilder {
  private collName: string
  private projection: any = null
  private filters: Filter = {}
  private sort: any = null
  private _limit: number | null = null
  private _action: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private _updateDoc: any = null
  private _insertDoc: any = null

  constructor(collName: string) {
    this.collName = collName
  }

  /** Normalize a raw MongoDB document: convert `_id` → string `id` */
  private normalizeDoc(doc: any): any {
    if (!doc || typeof doc !== 'object') return doc
    const { _id, ...rest } = doc
    return { ...rest, id: _id ? String(_id) : undefined }
  }

  /** Resolve `filters.id` → `filters._id` (single or $in pattern) and remove `id` key */
  private resolveIdFilter(filters: Filter) {
    if (filters.id === undefined) return
    const idFilter = filters.id
    if (typeof idFilter === 'object' && idFilter.$in && Array.isArray(idFilter.$in)) {
      filters._id = { $in: idFilter.$in.map((v: any) => this.toObjectId(v)) }
    } else {
      filters._id = this.toObjectId(idFilter)
    }
    delete filters.id
  }

  select(_projection?: any, opts?: any) {
    if (opts && opts.count === "exact") {
      ;(this as any)._count = true
    }
    return this
  }

  eq(key: string, value: any) {
    this.filters[key] = value
    return this
  }

  in(key: string, values: any[]) {
    this.filters[key] = { $in: values }
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
    const res = await this._run()
    const d = Array.isArray(res.data) ? res.data[0] ?? null : res.data ?? null
    return { data: d, error: null }
  }

  /** Mark this query as an insert. Chainable — execution deferred to await/then. */
  insert(doc: any) {
    this._action = 'insert'
    this._insertDoc = doc
    return this
  }

  /** Mark this query as a delete. Chainable — execution deferred to await/then. */
  delete() {
    this._action = 'delete'
    return this
  }

  /** Mark this query as an update. Chainable — execution deferred to await/then. */
  update(updateDoc: any) {
    this._action = 'update'
    this._updateDoc = updateDoc
    return this
  }

  private toObjectId(val: any) {
    try {
      return new ObjectId(val)
    } catch (e) {
      return val
    }
  }

  /** Core execution method that dispatches based on _action */
  private async _run(): Promise<any> {
    switch (this._action) {
      case 'insert':
        return this._execInsert()
      case 'update':
        return this._execUpdate()
      case 'delete':
        return this._execDelete()
      default:
        return this._execSelect()
    }
  }

  private async _execInsert() {
    return await this.execWithRetry(async () => {
      const db = await getDb()
      const coll = db.collection(this.collName)
      const r = await coll.insertOne(this._insertDoc)
      const data = await coll.findOne({ _id: r.insertedId })
      return { data: this.normalizeDoc(data), error: null }
    })
  }

  private async _execDelete() {
    return await this.execWithRetry(async () => {
      const db = await getDb()
      const coll = db.collection(this.collName)
      const filters = { ...this.filters }
      this.resolveIdFilter(filters)
      const r = await coll.deleteMany(filters)
      return { error: null, data: r }
    })
  }

  private async _execUpdate() {
    return await this.execWithRetry(async () => {
      const db = await getDb()
      const coll = db.collection(this.collName)
      const filters = { ...this.filters }
      this.resolveIdFilter(filters)
      // MongoDB driver v5.7+ returns the document directly (not wrapped in .value)
      const r = await coll.findOneAndUpdate(filters, { $set: this._updateDoc }, { returnDocument: 'after' })
      return { data: this.normalizeDoc(r), error: null }
    })
  }

  private async _execSelect() {
    return await this.execWithRetry(async () => {
      const db = await getDb()
      const coll = db.collection(this.collName)
      const filters = { ...this.filters }
      this.resolveIdFilter(filters)

      const cursor = coll.find(filters, this.projection ? { projection: this.projection } : undefined)
      if (this.sort) cursor.sort(this.sort)
      if (this._limit) cursor.limit(this._limit)
      const data = (await cursor.toArray()).map((d: any) => this.normalizeDoc(d))
      const out: any = { data }
      if ((this as any)._count) {
        out.count = await coll.countDocuments(filters)
      }
      return out
    })
  }

  private async execWithRetry<T>(fn: () => Promise<T>) {
    const maxAttempts = 2
    let attempt = 0
    while (true) {
      attempt++
      try {
        return await fn()
      } catch (err: any) {
        const message = String(err?.message || err)
        const isTransient = /MongoServerSelectionError|SSL routines|tlsv1 alert/i.test(message) || err?.reason
        console.error(`Mongo operation failed (attempt ${attempt}):`, err)
        if (attempt >= maxAttempts || !isTransient) throw err
        try {
          const { closeMongo } = await import("./client")
          await closeMongo()
        } catch (e) {
          // ignore
        }
        await new Promise((r) => setTimeout(r, 200 * attempt))
      }
    }
  }

  // Make the QueryBuilder thenable so `await builder` resolves via _run()
  then(resolve: any, reject: any) {
    this._run()
      .then((result) => {
        resolve({ data: result.data, error: null, count: (result as any).count })
      })
      .catch((err) => reject(err))
  }
}

export function from(collectionName: string) {
  return new QueryBuilder(collectionName)
}
