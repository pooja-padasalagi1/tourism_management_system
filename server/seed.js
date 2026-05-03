const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tms_db'
  });

  const sql = fs.readFileSync('seed.sql', 'utf8');
  const statements = sql.split(';').filter(s => s.trim());

  for (const stmt of statements) {
    if (stmt.trim()) {
      console.log('Running:', stmt.substring(0,50) + '...');
      await conn.query(stmt);
    }
  }

  console.log('Seeded successfully');
  conn.end();
}

seed().catch(console.error);