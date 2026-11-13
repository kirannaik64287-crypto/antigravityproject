#!/usr/bin/env node
/**
 * AgriSahayak - Supabase Cloud PostgreSQL Migration Runner
 * Applies /supabase/migrations/001_initial_schema.sql to Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load packages from server/node_modules
const dotenv = require('../server/node_modules/dotenv');
const pg = require('../server/node_modules/pg');
const { createClient } = require('../server/node_modules/@supabase/supabase-js');

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;

const REQUIRED_TABLES = [
  'profiles',
  'farms',
  'crop_advisories',
  'soil_analyses',
  'fertilizer_advisories',
  'irrigation_advisories',
  'disease_analyses',
  'chat_conversations',
  'chat_messages',
  'farming_calendars',
  'calendar_tasks',
  'agronomic_crop_references'
];

async function runMigration() {
  console.log('\n======================================================');
  console.log('🌾 AgriSahayak - Supabase Migration Runner');
  console.log('======================================================\n');

  const migrationFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
  console.log(`📄 Loaded migration file: 001_initial_schema.sql (${sqlContent.length} bytes)`);

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Direct PostgreSQL Connection (Recommended for DDL / RLS)
  if (dbUrl) {
    console.log('\n🔗 Connecting to Supabase Cloud PostgreSQL via direct connection string...');
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL database successfully.');

      console.log('🚀 Executing migration SQL script...');
      await client.query(sqlContent);
      console.log('✅ Migration executed successfully!');

      // Verify created tables
      console.log('\n🔍 Verifying created tables in public schema:');
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      const existingTables = res.rows.map(r => r.table_name);
      REQUIRED_TABLES.forEach(table => {
        if (existingTables.includes(table)) {
          console.log(`   ✓ ${table}`);
        } else {
          console.warn(`   ⚠️ ${table} (not found)`);
        }
      });

      await client.end();
      console.log('\n🎉 Supabase Database Schema is completely initialized & ready!\n');
      return;
    } catch (err) {
      console.error('❌ Error executing SQL migration via PostgreSQL connection:', err.message);
      if (client) await client.end().catch(() => {});
    }
  }

  // 2. Supabase Service Role Key Approach
  if (supabaseUrl && serviceRoleKey) {
    console.log('\n🔗 Connecting using Supabase Service Role Key...');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
      // Test querying a table to see if schema exists
      const { data, error } = await supabase.from('farms').select('id').limit(1);
      if (!error) {
        console.log('✅ Supabase connected. Schema tables already exist and are accessible.');
        return;
      }

      console.log('ℹ️ Checking connection to Supabase instance...');
      console.log('\n💡 Note for Supabase Cloud:');
      console.log('To run DDL migrations that create tables & RLS policies:');
      console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql');
      console.log('2. Paste the contents of supabase/migrations/001_initial_schema.sql');
      console.log('3. Click "Run" to apply all tables, RLS policies, and seed data.');
      console.log('OR: Set DATABASE_URL in your .env with your Supabase Transaction Pooler connection string:');
      console.log('    DATABASE_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:6543/postgres\n');
    } catch (err) {
      console.error('❌ Supabase service connection error:', err.message);
    }
    return;
  }

  // If no credentials configured yet, display guide
  console.log('\n⚠️ No Supabase credentials detected in environment variables.');
  console.log('Please configure server/.env or root .env with either:');
  console.log('  1. DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"');
  console.log('  OR');
  console.log('  2. SUPABASE_URL="https://[ref].supabase.co"');
  console.log('     SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."');
  console.log('\nYou can also copy-paste /supabase/migrations/001_initial_schema.sql directly into the Supabase Dashboard SQL Editor.\n');
}

runMigration().catch(err => {
  console.error('Migration runner failed:', err);
  process.exit(1);
});
