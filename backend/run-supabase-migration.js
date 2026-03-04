const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'src/database/full_supabase_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running Supabase PostgreSQL migration...');
        await pool.query(sql);
        console.log('✅ Migration executed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        pool.end();
    }
}

runMigration();
