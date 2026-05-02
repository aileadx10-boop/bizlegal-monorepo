#!/usr/bin/env node
// scripts/seed.js — Seed initial data for Forge Compliance Engine
// Run: node scripts/seed.js

require('dotenv').config({ path: './apps/web/.env' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function seed() {
  console.log('Seeding Forge database...\n')

  // ── Add a test executor (attorney) ─────────────────────────────────────────
  const { data: executor, error: execError } = await supabase
    .from('executors')
    .upsert(
      {
        name: 'Test Attorney',
        email: 'attorney@example.com',
        phone: '+1-555-000-0000',
        type: 'attorney',
        specialties: ['surplus_funds', 'probate', 'foreclosure'],
        states: ['FL', 'TX', 'GA'],
        active: true,
        notes: 'Test executor — replace with real attorney details',
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single()

  if (execError) {
    console.error('Failed to seed executor:', execError.message)
  } else {
    console.log('Executor seeded:', executor.id)
  }

  // ── Verify storage bucket exists ────────────────────────────────────────────
  const { data: buckets } = await supabase.storage.listBuckets()
  const hasReports = buckets?.some((b) => b.name === 'reports')

  if (!hasReports) {
    const { error: bucketError } = await supabase.storage.createBucket('reports', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
    })
    if (bucketError) {
      console.error('Failed to create reports bucket:', bucketError.message)
    } else {
      console.log('Storage bucket "reports" created.')
    }
  } else {
    console.log('Storage bucket "reports" already exists.')
  }

  // ── Verify tables ───────────────────────────────────────────────────────────
  const tables = ['passport_assessments', 'scans', 'qualified_cases', 'executors', 'leads']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      console.error(`Table "${table}" not accessible:`, error.message)
      console.log('  -> Did you run infra/schema.sql in your Supabase SQL editor?')
    } else {
      console.log(`Table "${table}" OK.`)
    }
  }

  console.log('\nSeed complete.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
