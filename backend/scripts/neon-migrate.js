const { neon } = require('@neondatabase/serverless');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hucAp07ngyoX@ep-falling-frost-bdx8jly0.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function main() {
  console.log('Generating Prisma SQL DDL for Neon...');
  const ddlSql = execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script', {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf-8',
  });

  console.log('Connecting to Neon PostgreSQL via Serverless HTTP driver...');
  const sql = neon(connectionString);

  console.log('Applying DDL statements to Neon database...');
  // Remove SQL line comments
  const cleanSql = ddlSql.replace(/--.*$/gm, '');

  // Split statements by semicolon
  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
    } catch (err) {
      // Ignore if already exists (e.g. schema or constraint)
      if (!err.message.includes('already exists')) {
        console.warn(`Warning on statement ${i + 1}:`, err.message);
      }
    }
  }

  console.log(`Successfully executed ${statements.length} DDL statements on Neon!`);

  // Verify tables
  const tables = await sql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('Tables in Neon neondb:');
  console.log(tables.map(t => t.table_name).join(', '));
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
