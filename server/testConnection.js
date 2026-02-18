const pool = require('./db');

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully!');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Test query executed:', rows);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
