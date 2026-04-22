# 🚀 Quick Start Guide

Get your Tourism Management System up and running in minutes!

## Step 1: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Setup Database

### Make sure MySQL is running first!

**Windows:**
```bash
net start MySQL80
```

**Mac/Linux:**
```bash
sudo systemctl start mysql
```

### Run the automated setup:

```bash
cd server
npm run setup-db
```

This will create the database, tables, and seed initial data.

## Step 3: Configure Environment

The default `.env` file should work if you're using:
- MySQL on localhost
- Port 3306
- User: root
- No password

If your setup is different, edit `server/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tms_db
JWT_SECRET=change_this_secret
PORT=4000
```

## Step 4: Start the Application

### Terminal 1 - Start Backend Server:
```bash
cd server
npm start
```

Server will run on: `http://localhost:4000`

### Terminal 2 - Start Frontend Client:
```bash
cd client
npm start
```

Client will run on: `http://localhost:3000`

## Step 5: Login

Open your browser to `http://localhost:3000` and login with:

**Admin Account:**
- Email: `admin@example.com`
- Password: `password`

**Manager Account:**
- Email: `manager@example.com`
- Password: `password`

**User Account:**
- Email: `user@example.com`
- Password: `password`

## 🎉 You're All Set!

Explore the features:
- 🏨 **Hotels** - Manage hotel listings
- ✈️ **Tours** - Create and manage tours
- 📅 **Bookings** - Handle reservations
- 👥 **Users** - Manage user accounts
- 📊 **Dashboard** - View statistics and insights
- 📈 **Reports** - Generate reports

## Troubleshooting

### Database Connection Failed?

1. Check if MySQL is running
2. Verify credentials in `server/.env`
3. Run: `cd server && npm run test-db`

### Port Already in Use?

Change the port in `server/.env`:
```env
PORT=5000
```

### Can't Login?

1. Make sure the database is seeded
2. Check browser console for errors
3. Verify server is running on port 4000

## Need Help?

Check the detailed guides:
- `DATABASE_SETUP.md` - Database setup instructions
- `README.md` - Full documentation

---

**Enjoy building with Tourism Management System! 🌍✨**
