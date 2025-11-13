const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'idea-files'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function ensureBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = (buckets || []).some((b) => b.name === BUCKET)

    if (exists) {
      console.log(`Bucket '${BUCKET}' already exists.`)
      process.exit(0)
    }

    console.log(`Bucket '${BUCKET}' not found. Creating...`)
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) {
      console.error('Failed to create bucket:', error)
      process.exit(2)
    }

    console.log(`Bucket '${BUCKET}' created and set to public.`)
    process.exit(0)
  } catch (err) {
    console.error('Error ensuring bucket:', err)
    process.exit(3)
  }
}

ensureBucket()
