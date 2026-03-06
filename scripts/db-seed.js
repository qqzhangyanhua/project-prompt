const { readFileSync } = require('fs')
const { join } = require('path')
const { Client } = require('pg')

const seedFile = '20260306224000_seed_minimal_data.sql'

function ensureDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable')
  }
  return databaseUrl
}

async function run() {
  const client = new Client({
    connectionString: ensureDatabaseUrl(),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  await client.connect()

  try {
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', seedFile)
    const sql = readFileSync(sqlPath, 'utf8')
    console.log(`Running seed: ${seedFile}`)
    await client.query(sql)
    console.log('Seed completed')
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
