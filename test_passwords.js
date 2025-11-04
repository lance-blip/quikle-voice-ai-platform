import postgres from 'postgres';

const projectRef = 'tcnlysyacvrocshzzlgh';
const passwords = [
  'WorkSpace@2025',
  'Supabase@2025',
  'Supabase@940521',
  'SupaBase@940521'
];

async function testPassword(password) {
  // Try connection pooler first (port 6543)
  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  
  try {
    console.log(`\nTesting password: ${password.substring(0, 3)}***`);
    console.log(`Connection string: postgresql://postgres.${projectRef}:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres`);
    
    const sql = postgres(connectionString, {
      max: 1,
      connect_timeout: 10
    });
    
    // Try a simple query
    const result = await sql`SELECT 1 as test`;
    
    if (result && result.length > 0) {
      console.log('✅ SUCCESS! Connection established');
      console.log('Test query result:', result[0]);
      await sql.end();
      return password;
    }
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  // Try direct connection (port 5432) as fallback
  try {
    const directConnectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
    console.log('Trying direct connection (port 5432)...');
    
    const sql = postgres(directConnectionString, {
      max: 1,
      connect_timeout: 10
    });
    
    const result = await sql`SELECT 1 as test`;
    
    if (result && result.length > 0) {
      console.log('✅ SUCCESS! Direct connection established');
      console.log('Test query result:', result[0]);
      await sql.end();
      return password;
    }
  } catch (error) {
    console.log('❌ Direct connection also failed:', error.message);
  }
  
  return null;
}

async function main() {
  console.log('='.repeat(80));
  console.log('SUPABASE PASSWORD TESTING');
  console.log('='.repeat(80));
  
  for (const password of passwords) {
    const result = await testPassword(password);
    if (result) {
      console.log('\n' + '='.repeat(80));
      console.log('✅ WORKING PASSWORD FOUND!');
      console.log('='.repeat(80));
      console.log(`Password: ${result}`);
      console.log('\nConnection string format:');
      console.log(`postgresql://postgres.${projectRef}:${encodeURIComponent(result)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`);
      process.exit(0);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('❌ NO WORKING PASSWORD FOUND');
  console.log('='.repeat(80));
  console.log('All provided passwords failed to connect.');
  console.log('You will need to retrieve the password from:');
  console.log('Supabase Dashboard > Settings > Database > Connection String');
  process.exit(1);
}

main();
