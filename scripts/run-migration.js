const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量读取配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('请确保 .env.local 文件中包含 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250805094000_allow_anonymous_read.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('正在执行数据库迁移...')
    console.log('迁移内容:')
    console.log(migrationSQL)
    
    // 注意：这个方法可能需要服务端密钥，而不是匿名密钥
    // 如果失败，需要在Supabase控制台手动执行
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      console.error('迁移执行失败:', error)
      console.log('\n请手动在 Supabase 控制台的 SQL 编辑器中执行以下 SQL:')
      console.log('=' * 50)
      console.log(migrationSQL)
      console.log('=' * 50)
    } else {
      console.log('迁移执行成功!', data)
    }
  } catch (err) {
    console.error('执行迁移时出错:', err)
    console.log('\n请手动在 Supabase 控制台的 SQL 编辑器中执行以下 SQL:')
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250805094000_allow_anonymous_read.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('=' * 50)
    console.log(migrationSQL)
    console.log('=' * 50)
  }
}

runMigration()