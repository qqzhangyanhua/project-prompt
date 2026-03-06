const { readFileSync } = require('fs')
const { join } = require('path')
const { Client } = require('pg')

const migrationFiles = [
  '20250805092127_rapid_prism.sql',
  '20250805093000_fix_foreign_keys.sql',
  '20260306211000_direct_postgres_auth.sql',
]

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
    for (const fileName of migrationFiles) {
      const sqlPath = join(__dirname, '..', 'supabase', 'migrations', fileName)
      const sql = readFileSync(sqlPath, 'utf8')
      console.log(`Running migration: ${fileName}`)
      await client.query(sql)
    }

    console.log('Migrations completed')
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
