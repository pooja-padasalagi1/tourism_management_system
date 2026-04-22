const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const hotelRoutes = require('./routes/hotels');
const tourRoutes = require('./routes/tours');
const tourPackageRoutes = require('./routes/tourPackages');
const bookingRoutes = require('./routes/bookings');

const app = express();
app.use(cors());
app.use(express.json());

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n⚠️  Please ensure:');
    console.error('   1. MySQL is running');
    console.error('   2. Database credentials in .env are correct');
    console.error('   3. Database "tms_db" exists');
    console.error('\n💡 Run: npm run setup-db to initialize the database\n');
    return false;
  }
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/tour-packages', tourPackageRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

const port = process.env.PORT || 4000;

// Start server and test database
testDatabaseConnection().then((connected) => {
  app.listen(port, () => {
    console.log(`\n🚀 Server running on port ${port}`);
    console.log(`📡 API: http://localhost:${port}/api`);
    console.log(`🏥 Health check: http://localhost:${port}/api/health\n`);
    
    if (!connected) {
      console.log('⚠️  Server started but database is not connected!');
      console.log('   The application will not work until database is configured.\n');
    }
  });
});

