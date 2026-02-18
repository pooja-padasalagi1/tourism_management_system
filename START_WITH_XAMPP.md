# 🚀 Quick Start with XAMPP

## Prerequisites
- ✅ XAMPP installed
- ✅ Node.js installed

## 5-Minute Setup

### 1️⃣ Start XAMPP (30 seconds)
Open XAMPP Control Panel and start:
- ✅ **Apache** (for phpMyAdmin)
- ✅ **MySQL** (for database)

### 2️⃣ Create Database (2 minutes)

**Option A - Automated (Recommended):**
```bash
cd server
npm install
npm run setup-db
```

**Option B - Manual:**
1. Go to: `http://localhost/phpmyadmin`
2. Click **"SQL"** tab
3. Copy contents from `server/schema.sql` and paste
4. Click **"Go"**
5. Copy contents from `server/seed.sql` and paste
6. Click **"Go"**

### 3️⃣ Start Backend (1 minute)
```bash
cd server
npm start
```

Wait for: `✅ Database connected successfully!`

### 4️⃣ Start Frontend (1 minute)
Open a new terminal:
```bash
cd client
npm install
npm start
```

### 5️⃣ Login (30 seconds)
Browser opens at `http://localhost:3000`

Login with:
- **Email:** `admin@example.com`
- **Password:** `password`

## 🎉 Done!

You should now see the beautiful dashboard with:
- 👥 Users statistics
- 🏨 Top hotels
- ✈️ Premium tours
- 📍 Popular locations
- 📅 Recent bookings

## Troubleshooting

### ❌ Database connection failed?
1. Check XAMPP MySQL is running (green)
2. Verify in phpMyAdmin: `http://localhost/phpmyadmin`
3. Make sure database `tms_db` exists

### ❌ Port 4000 already in use?
Change port in `server/.env`:
```env
PORT=5000
```

### ❌ Can't login?
1. Make sure backend shows: `✅ Database connected`
2. Check browser console for errors
3. Verify database has users: Check in phpMyAdmin

## Default Accounts

| Role    | Email                  | Password | Access Level |
|---------|------------------------|----------|--------------|
| 👑 Admin   | admin@example.com   | password | Full access  |
| 📋 Manager | manager@example.com | password | Manage data  |
| 👤 User    | user@example.com    | password | View & book  |

## What's Next?

Explore the features:
1. 🏨 Add hotels with ratings
2. ✈️ Create tour packages
3. 📅 Make bookings
4. 👥 Manage users
5. 📊 View dashboard analytics
6. 🌓 Try dark mode!

---

**Need detailed help?** Check `XAMPP_SETUP.md`
