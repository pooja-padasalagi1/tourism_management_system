const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Connect without database first
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    connection.connect((err) => {
      if (err) {
        console.error('✗ Connection failed:', err.message);
        process.exit(1);
      }
      console.log('✓ Connected to MySQL server');

      // Read schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      connection.query(schema, (error, results) => {
        if (error) {
          console.error('✗ Database initialization failed:', error.message);
          connection.end();
          process.exit(1);
        }
        console.log('✓ Database initialized successfully!');
        connection.end();
        process.exit(0);
      });
    });
  });
}

initializeDatabase();
