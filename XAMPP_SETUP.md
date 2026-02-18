# 🔧 XAMPP Setup Guide

Quick guide to set up the Tourism Management System with XAMPP.

## Step 1: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache** (for phpMyAdmin)
3. Click **Start** next to **MySQL**
4. Wait until both show "Running" status

![XAMPP Control Panel](https://via.placeholder.com/600x200/4CAF50/FFFFFF?text=Start+Apache+and+MySQL)

## Step 2: Access phpMyAdmin

1. Open your browser
2. Go to: `http://localhost/phpmyadmin`
3. You should see the phpMyAdmin interface

## Step 3: Create Database

### Option A: Using phpMyAdmin (Easy)

1. In phpMyAdmin, click **"New"** in the left sidebar
2. Enter database name: `tms_db`
3. Click **"Create"**
4. Click on `tms_db` in the left sidebar
5. Click **"Import"** tab
6. Click **"Choose File"** and select `server/schema.sql`
7. Click **"Go"** at the bottom
8. Click **"Import"** again and select `server/seed.sql`
9. Click **"Go"**

### Option B: Using SQL Tab (Quick)

1. In phpMyAdmin, click **"SQL"** tab
2. Copy and paste the contents of `server/schema.sql`
3. Click **"Go"**
4. Click **"SQL"** tab again
5. Copy and paste the contents of `server/seed.sql`
6. Click **"Go"**

### Option C: Using Command Line (Automated)

```bash
cd server
npm run setup-db
```

## Step 4: Configure Database Connection

The default XAMPP MySQL settings should work. Your `server/.env` should have:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tms_db
JWT_SECRET=your_secret_key_here
PORT=4000
```

**Note:** XAMPP MySQL default password is empty (no password)

## Step 5: Verify Database Setup

1. In phpMyAdmin, click on `tms_db`
2. You should see 4 tables:
   - ✅ users
   - ✅ hotels
   - ✅ tours
   - ✅ bookings
3. Click on each table and verify it has data

## Step 6: Start the Application

### Terminal 1 - Backend Server:
```bash
cd server
npm install
npm start
```

You should see:
```
✅ Database connected successfully!
🚀 Server running on port 4000
```

### Terminal 2 - Frontend Client:
```bash
cd client
npm install
npm start
```

Browser will open at: `http://localhost:3000`

## Step 7: Login

Use these default credentials:

| Role    | Email                  | Password |
|---------|------------------------|----------|
| Admin   | admin@example.com      | password |
| Manager | manager@example.com    | password |
| User    | user@example.com       | password |

## Troubleshooting

### MySQL Won't Start in XAMPP

**Problem:** Port 3306 is already in use

**Solution:**
1. Open XAMPP Control Panel
2. Click **Config** next to MySQL
3. Click **my.ini**
4. Find line: `port=3306`
5. Change to: `port=3307`
6. Save and restart MySQL
7. Update `server/.env`: `DB_PORT=3307`

### Can't Access phpMyAdmin

**Problem:** Apache not running

**Solution:**
1. Make sure Apache is started in XAMPP
2. Check if port 80 is free
3. Try: `http://localhost:8080/phpmyadmin` (if using port 8080)

### Database Connection Failed

**Problem:** Wrong credentials

**Solution:**
1. Check XAMPP MySQL is running (green in control panel)
2. Verify `server/.env` has correct settings
3. Default XAMPP password is empty: `DB_PASSWORD=`

### Error: Access Denied

**Problem:** MySQL user doesn't have permissions

**Solution:**
1. In phpMyAdmin, go to **User accounts**
2. Find **root** user with **localhost**
3. Click **Edit privileges**
4. Make sure **"Grant all privileges"** is checked

## Quick Commands

```bash
# Check if database is set up
cd server
npm run test-db

# Reset database (start fresh)
# In phpMyAdmin: Drop database tms_db, then run setup again
npm run setup-db

# Check MySQL status
# Open XAMPP Control Panel and look at MySQL status
```

## XAMPP Default Locations

**Windows:**
- XAMPP: `C:\xampp`
- MySQL Data: `C:\xampp\mysql\data`
- phpMyAdmin: `C:\xampp\phpMyAdmin`
- Config: `C:\xampp\mysql\bin\my.ini`

**Mac:**
- XAMPP: `/Applications/XAMPP`
- MySQL Data: `/Applications/XAMPP/xamppfiles/var/mysql`

**Linux:**
- XAMPP: `/opt/lampp`
- MySQL Data: `/opt/lampp/var/mysql`

## Next Steps

After successful setup:

1. ✅ Explore the Dashboard
2. ✅ Add some hotels
3. ✅ Create tours
4. ✅ Make bookings
5. ✅ Manage users
6. ✅ View reports

## Need Help?

- Check XAMPP logs: Click **Logs** in XAMPP Control Panel
- MySQL Error Log: `xampp/mysql/data/mysql_error.log`
- Apache Error Log: `xampp/apache/logs/error.log`

---

**🎉 Enjoy your Tourism Management System with XAMPP!**
