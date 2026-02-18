const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('\n🔧 Starting Database Setup...\n');
    
    // Step 1: Connect to MySQL server (without database)
    console.log('📡 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });
    console.log('✅ Connected to MySQL server successfully!\n');

    // Step 2: Create database if it doesn't exist
    console.log('🗄️  Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'tms_db'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'tms_db'}' created/verified!\n`);

    // Step 3: Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'tms_db'}`);

    // Step 4: Create tables
    console.log('📋 Creating tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove CREATE DATABASE and USE statements as we already did that
    const cleanSchema = schema
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
      .replace(/USE.*?;/gi, '')
      .trim();
    
    await connection.query(cleanSchema);
    console.log('✅ Tables created successfully!\n');

    // Step 5: Check if data already exists
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [hotels] = await connection.query('SELECT COUNT(*) as count FROM hotels');
    const [tours] = await connection.query('SELECT COUNT(*) as count FROM tours');
    
    if (users[0].count === 0 && hotels[0].count === 0 && tours[0].count === 0) {
      console.log('🌱 Seeding initial data...');
      const seedPath = path.join(__dirname, 'seed.sql');
      const seedData = fs.readFileSync(seedPath, 'utf8');
      
      // Remove USE statement from seed data
      const cleanSeedData = seedData.replace(/USE.*?;/gi, '').trim();
      
      await connection.query(cleanSeedData);
      console.log('✅ Initial data seeded successfully!\n');
    } else {
      console.log('ℹ️  Database already contains data. Skipping seed.\n');
    }

    // Step 6: Verify setup
    console.log('🔍 Verifying database setup...');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [hotelCount] = await connection.query('SELECT COUNT(*) as count FROM hotels');
    const [tourCount] = await connection.query('SELECT COUNT(*) as count FROM tours');
    const [bookingCount] = await connection.query('SELECT COUNT(*) as count FROM bookings');

    console.log('📊 Database Statistics:');
    console.log(`   👥 Users: ${userCount[0].count}`);
    console.log(`   🏨 Hotels: ${hotelCount[0].count}`);
    console.log(`   ✈️  Tours: ${tourCount[0].count}`);
    console.log(`   📅 Bookings: ${bookingCount[0].count}\n`);

    console.log('✨ Database setup completed successfully!\n');
    console.log('🔐 Default Login Credentials:');
    console.log('   Admin:   admin@example.com / password');
    console.log('   Manager: manager@example.com / password');
    console.log('   User:    user@example.com / password\n');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n💡 Troubleshooting Tips:');
    console.error('   1. Make sure MySQL is running');
    console.error('   2. Check your .env file for correct credentials');
    console.error('   3. Verify MySQL user has proper permissions');
    console.error('   4. Try: mysql -u root -p (to test MySQL connection)\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase();
