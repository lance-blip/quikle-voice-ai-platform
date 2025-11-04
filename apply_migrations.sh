#!/bin/bash

# Apply Migrations to Supabase
# This script pushes the PostgreSQL schema to your Supabase database

echo "================================================================================"
echo "APPLYING MIGRATIONS TO SUPABASE"
echo "================================================================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo ""
  echo "Please set it in your .env file:"
  echo "DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:[PORT]/postgres"
  echo ""
  exit 1
fi

echo "✓ DATABASE_URL is configured"
echo ""

# Option 1: Use drizzle-kit push (recommended for development)
echo "[Option 1] Using drizzle-kit push (recommended)..."
echo "This will sync your schema directly to the database"
echo ""

pnpm drizzle-kit push

if [ $? -eq 0 ]; then
  echo ""
  echo "================================================================================"
  echo "✓ MIGRATIONS APPLIED SUCCESSFULLY"
  echo "================================================================================"
  echo ""
  echo "Next steps:"
  echo "1. Test the connection: node test_db_connection.js"
  echo "2. Start the application: pnpm dev"
  echo ""
else
  echo ""
  echo "================================================================================"
  echo "❌ MIGRATION FAILED"
  echo "================================================================================"
  echo ""
  echo "Possible issues:"
  echo "1. Invalid database password"
  echo "2. Network connectivity problems"
  echo "3. Insufficient database permissions"
  echo ""
  echo "Get your password from:"
  echo "Supabase Dashboard > Settings > Database > Connection String"
  echo ""
  exit 1
fi
