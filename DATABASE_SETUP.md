# 🗄️ Database Setup Guide

This guide will help you set up the MySQL database for the Tourism Management System.

## Prerequisites

- MySQL Server installed (version 5.7 or higher)
- Node.js installed
- npm or yarn package manager

## Quick Setup

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
cd server
npm run setup-db
```

This will:
- Create the database
- Create all tables
- Seed initial data
- Verify the setup

### Option 2: Manual Setup

#### Step 1: Start MySQL

Make sure MySQL is running:

**Windows:**
```bash
# Check if MySQL is running
net start MySQL80

# Or start it
net start MySQL80
```

**Mac/Linux:**
```bash
# Check status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

#### Step 2: Configure Database Credentials

Edit `server/.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=tms_db
JWT_SECRET=your_secret_key_here
PORT=4000
```

#### Step 3: Create Database and Tables

**Option A: Using the setup script**
```bash
cd server
node setupDatabase.js
```

**Option B: Using MySQL CLI**
```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source server/schema.sql

# Run the seed data
source server/seed.sql

# Exit
exit
```

**Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open `server/schema.sql` and execute it
4. Open `server/seed.sql` and execute it

## Verify Setup

### Check Database Connection

Run the test connection script:

```bash
cd server
node testConnection.js
```

### Check Tables

Login to MySQL and verify:

```sql
USE tms_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM hotels;
SELECT COUNT(*) FROM tours;
SELECT COUNT(*) FROM bookings;
```

## Default Login Credentials

After setup, you can login with these accounts:

| Role    | Email                  | Password |
|---------|------------------------|----------|
| Admin   | admin@example.com      | password |
| Manager | manager@example.com    | password |
| User    | user@example.com       | password |

**⚠️ Important:** Change these passwords in production!

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `role` - User role (admin, manager, user)
- `created_at` - Timestamp

### Hotels Table
- `id` - Primary key
- `name` - Hotel name
- `location` - Hotel location
- `rating` - Rating (1-5)
- `created_at` - Timestamp

### Tours Table
- `id` - Primary key
- `title` - Tour title
- `description` - Tour description
- `price` - Tour price (decimal)
- `created_at` - Timestamp

### Bookings Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `tour_id` - Foreign key to tours
- `hotel_id` - Foreign key to hotels
- `status` - Booking status (pending, confirmed, cancelled)
- `created_at` - Timestamp

## Troubleshooting

### Error: Access denied for user

**Solution:** Check your MySQL credentials in `.env` file

```bash
# Test MySQL connection
mysql -u root -p
```

### Error: Can't connect to MySQL server

**Solution:** Make sure MySQL is running

**Windows:**
```bash
net start MySQL80
```

**Mac/Linux:**
```bash
sudo systemctl start mysql
```

### Error: Database already exists

**Solution:** This is normal. The script will use the existing database.

### Error: Table already exists

**Solution:** This is normal. The script uses `CREATE TABLE IF NOT EXISTS`.

### Reset Database

If you want to start fresh:

```sql
DROP DATABASE tms_db;
```

Then run the setup script again.

## NPM Scripts

Add these to your `server/package.json`:

```json
{
  "scripts": {
    "setup-db": "node setupDatabase.js",
    "test-db": "node testConnection.js",
    "reset-db": "node resetDatabase.js"
  }
}
```

## Production Considerations

1. **Change default passwords** - Never use default credentials in production
2. **Use environment variables** - Keep credentials secure
3. **Enable SSL** - Use encrypted connections
4. **Regular backups** - Schedule automated backups
5. **Monitor performance** - Use MySQL monitoring tools
6. **Optimize queries** - Add indexes where needed

## Support

If you encounter issues:

1. Check MySQL error logs
2. Verify MySQL version compatibility
3. Ensure proper permissions for MySQL user
4. Check firewall settings
5. Review `.env` configuration

## Next Steps

After database setup:

1. Start the server: `npm start`
2. Start the client: `cd client && npm start`
3. Access the application: `http://localhost:3000`
4. Login with default credentials
5. Change admin password immediately

---

**Need Help?** Check the main README.md or create an issue on GitHub.
