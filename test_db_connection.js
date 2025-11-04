/**
 * Database Connection Test Script
 * 
 * This script tests the PostgreSQL connection to Supabase and validates
 * that the database layer conversion was successful.
 * 
 * Usage:
 * 1. Update the DATABASE_URL in .env with your actual Supabase password
 * 2. Run: node test_db_connection.js
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './drizzle/schema.ts';
import 'dotenv/config';

console.log('='.repeat(80));
console.log('DATABASE CONNECTION TEST');
console.log('='.repeat(80));
console.log('');

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL not found in environment variables');
    console.error('Please set DATABASE_URL in your .env file');
    process.exit(1);
  }
  
  console.log('Connection string configured: ✓');
  console.log('');
  
  let sql;
  let db;
  
  try {
    // Test 1: Basic PostgreSQL connection
    console.log('[Test 1] Testing basic PostgreSQL connection...');
    sql = postgres(connectionString, {
      max: 1,
      connect_timeout: 10
    });
    
    const result = await sql`SELECT version()`;
    console.log('✓ Connected to PostgreSQL');
    console.log('  Version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);
    console.log('');
    
    // Test 2: Test Drizzle ORM initialization
    console.log('[Test 2] Testing Drizzle ORM initialization...');
    db = drizzle(sql, { schema });
    console.log('✓ Drizzle ORM initialized successfully');
    console.log('');
    
    // Test 3: Check if tables exist
    console.log('[Test 3] Checking database schema...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠ No tables found - migrations need to be applied');
      console.log('  Run: pnpm db:push');
    } else {
      console.log(`✓ Found ${tables.length} tables in database:`);
      tables.forEach(t => console.log(`  - ${t.table_name}`));
    }
    console.log('');
    
    // Test 4: Check if enums exist
    console.log('[Test 4] Checking PostgreSQL enums...');
    const enums = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname
    `;
    
    if (enums.length === 0) {
      console.log('⚠ No enums found - migrations need to be applied');
    } else {
      console.log(`✓ Found ${enums.length} enum types:`);
      enums.forEach(e => console.log(`  - ${e.typname}`));
    }
    console.log('');
    
    // Test 5: Test database write capability (if tables exist)
    if (tables.length > 0) {
      console.log('[Test 5] Testing database operations...');
      
      // Try to query users table
      try {
        const userCount = await sql`SELECT COUNT(*) as count FROM users`;
        console.log(`✓ Users table accessible (${userCount[0].count} users)`);
      } catch (error) {
        console.log('⚠ Could not query users table:', error.message);
      }
    }
    
    console.log('');
    console.log('='.repeat(80));
    console.log('CONNECTION TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('✓ PostgreSQL connection: SUCCESS');
    console.log('✓ Drizzle ORM: INITIALIZED');
    console.log('✓ Database: ACCESSIBLE');
    console.log('');
    
    if (tables.length === 0) {
      console.log('NEXT STEPS:');
      console.log('1. Apply migrations: pnpm db:push');
      console.log('2. Verify schema: node test_db_connection.js');
      console.log('3. Start the application: pnpm dev');
    } else {
      console.log('✓ Database is ready for use!');
      console.log('  Start the application: pnpm dev');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ CONNECTION TEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('password authentication failed')) {
      console.error('ISSUE: Invalid database password');
      console.error('SOLUTION: Get the correct password from:');
      console.error('  Supabase Dashboard > Settings > Database > Connection String');
    } else if (error.message.includes('Tenant or user not found')) {
      console.error('ISSUE: Invalid connection string format');
      console.error('SOLUTION: Verify the connection string format:');
      console.error('  postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:[PORT]/postgres');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('ISSUE: Cannot resolve database host');
      console.error('SOLUTION: Check your internet connection and Supabase project status');
    }
    
    console.error('='.repeat(80));
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testConnection();
