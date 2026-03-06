import 'server-only'
import { Pool, type QueryResult, type QueryResultRow } from 'pg'

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool
}

function getDbPool(): Pool {
  if (globalForDb.pgPool) {
    return globalForDb.pgPool
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL environment variable')
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.pgPool = pool
  }

  return pool
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: ReadonlyArray<string | number | boolean | null | ReadonlyArray<string>> = []
): Promise<QueryResult<T>> {
  return getDbPool().query<T>(text, [...values])
}
