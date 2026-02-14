const pool = require('../db');
const bcrypt = require('bcryptjs');

async function run() {
  const plain = '12345';
  const hash = await bcrypt.hash(plain, 10);
  const [result] = await pool.query('UPDATE users SET password = ?', [hash]);
  console.log('Updated rows:', result.affectedRows);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
