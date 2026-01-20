/*
Migration script: exports rows from Postgres and imports into MongoDB.

Usage:
  node scripts/migrate_postgres_to_mongo.js

Required env vars:
  POSTGRES_URL - postgres connection string (Supabase DB)
  MONGODB_URI - MongoDB connection string
  MONGODB_DB - MongoDB database name

This script copies: profiles, ideas, idea_files, contact_requests, events
It preserves original UUIDs by writing them into `_id` as strings.
*/

import { MongoClient } from 'mongodb'
import pg from 'pg'
import assert from 'assert'

const { Client } = pg

async function main() {
  const pgUrl = process.env.POSTGRES_URL
  const mongoUri = process.env.MONGODB_URI
  const mongoDbName = process.env.MONGODB_DB || 'test'

  assert(pgUrl, 'Missing POSTGRES_URL')
  assert(mongoUri, 'Missing MONGODB_URI')

  const pgClient = new Client({ connectionString: pgUrl })
  await pgClient.connect()

  const mongoClient = new MongoClient(mongoUri)
  await mongoClient.connect()
  const db = mongoClient.db(mongoDbName)

  try {
    console.log('Starting migration...')

    // Profiles
    console.log('Migrating profiles...')
    const profilesRes = await pgClient.query('SELECT id, email, full_name, role, created_at, updated_at FROM public.profiles')
    const profiles = profilesRes.rows.map(r => ({
      _id: r.id,
      email: r.email,
      full_name: r.full_name,
      role: r.role,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))
    if (profiles.length) {
      await db.collection('profiles').deleteMany({})
      await db.collection('profiles').insertMany(profiles)
    }

    // Ideas
    console.log('Migrating ideas...')
    const ideasRes = await pgClient.query('SELECT id, user_id, title, problem_statement, solution, market_opportunity, team_description, category, tags, status, is_featured, created_at, updated_at FROM public.ideas')
    const ideas = ideasRes.rows.map(r => ({
      _id: r.id,
      user_id: r.user_id,
      title: r.title,
      problem_statement: r.problem_statement,
      solution: r.solution,
      market_opportunity: r.market_opportunity,
      team_description: r.team_description,
      category: r.category,
      tags: r.tags || [],
      status: r.status,
      is_featured: r.is_featured,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))
    if (ideas.length) {
      await db.collection('ideas').deleteMany({})
      await db.collection('ideas').insertMany(ideas)
    }

    // Idea files
    console.log('Migrating idea_files...')
    const filesRes = await pgClient.query('SELECT id, idea_id, file_name, file_type, file_size, file_url, created_at FROM public.idea_files')
    const files = filesRes.rows.map(r => ({
      _id: r.id,
      idea_id: r.idea_id,
      file_name: r.file_name,
      file_type: r.file_type,
      file_size: r.file_size,
      file_url: r.file_url,
      created_at: r.created_at,
    }))
    if (files.length) {
      await db.collection('idea_files').deleteMany({})
      await db.collection('idea_files').insertMany(files)
    }

    // Contact requests
    console.log('Migrating contact_requests...')
    const cRes = await pgClient.query('SELECT id, idea_id, sender_name, sender_email, message, created_at FROM public.contact_requests')
    const contacts = cRes.rows.map(r => ({
      _id: r.id,
      idea_id: r.idea_id,
      sender_name: r.sender_name,
      sender_email: r.sender_email,
      message: r.message,
      created_at: r.created_at,
    }))
    if (contacts.length) {
      await db.collection('contact_requests').deleteMany({})
      await db.collection('contact_requests').insertMany(contacts)
    }

    // Events if present
    try {
      const evRes = await pgClient.query('SELECT * FROM public.events')
      if (evRes.rows.length) {
        console.log('Migrating events...')
        const events = evRes.rows.map(r => ({ ...r, _id: r.id || undefined }))
        await db.collection('events').deleteMany({})
        await db.collection('events').insertMany(events)
      }
    } catch (e) {
      console.log('No events table found or error reading events, skipping')
    }

    console.log('Migration complete')
  } finally {
    await pgClient.end()
    await mongoClient.close()
  }
}

main().catch(err => {
  console.error('Migration failed', err)
  process.exit(1)
})
