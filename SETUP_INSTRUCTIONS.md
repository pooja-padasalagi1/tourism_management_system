# 🔧 Setup Instructions - Fix Database Connection Error

## Current Issue

You're getting a **500 Internal Server Error** because MySQL is not installed or not running on your system.

## Solution Options

### Option 1: Install MySQL (Recommended for Production)

#### Windows Installation:

1. **Download MySQL Installer**
   - Go to: https://dev.mysql.com/downloads/installer/
   - Download "mysql-installer-community" (Windows MSI Installer)

2. **Run the Installer**
   - Choose "Developer Default" setup type
   - Click "Next" through the installation
   - Set a root password (remember this!)
   - Complete the installation

3. **Start MySQL Service**
   ```bash
   net start MySQL80
   ```

4. **Configure the Application**
   - Edit `server/.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=tms_db
   ```

5. **Setup Database**
   ```bash
   cd server
   npm run setup-db
   ```

6. **Start the Server**
   ```bash
   npm start
   ```

#### Alternative: Using Chocolatey (Windows)

If you have Chocolatey installed:
```bash
choco install mysql
net start MySQL80
```

### Option 2: Use XAMPP (Easiest for Development)

1. **Download XAMPP**
   - Go to: https://www.apachefriends.org/
   - Download and install XAMPP

2. **Start MySQL**
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL

3. **Configure Application**
   - Edit `server/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=tms_db
   ```

4. **Setup Database**
   ```bash
   cd server
   npm run setup-db
   ```

5. **Start Server**
   ```bash
   npm start
   ```

### Option 3: Use Docker (For Advanced Users)

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop

2. **Run MySQL Container**
   ```bash
   docker run --name mysql-tms -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=tms_db -p 3306:3306 -d mysql:8.0
   ```

3. **Configure Application**
   - Edit `server/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=tms_db
   ```

4. **Setup Database**
   ```bash
   cd server
   npm run setup-db
   ```

## Verify Installation

After installing MySQL, run these commands to verify:

```bash
# Check if MySQL is installed
cd server
npm run check-mysql

# Test database connection
npm run test-db

# Setup database
npm run setup-db

# Start server
npm start
```

## Quick Test

Once MySQL is running, test the connection:

```bash
cd server
node -e "const mysql = require('mysql2/promise'); mysql.createConnection({host:'localhost',user:'root',password:''}).then(()=>console.log('✅ Connected!')).catch(e=>console.log('❌ Failed:',e.message))"
```

## Common Issues

### Issue: "Access denied for user 'root'"
**Solution:** Check your password in `.env` file

### Issue: "Can't connect to MySQL server"
**Solution:** Make sure MySQL service is running
```bash
net start MySQL80
```

### Issue: "Unknown database 'tms_db'"
**Solution:** Run the setup script
```bash
npm run setup-db
```

## After MySQL is Running

1. **Setup Database:**
   ```bash
   cd server
   npm run setup-db
   ```

2. **Start Backend:**
   ```bash
   npm start
   ```

3. **Start Frontend (new terminal):**
   ```bash
   cd client
   npm start
   ```

4. **Login:**
   - Go to: http://localhost:3000
   - Email: admin@example.com
   - Password: password

## Need Help?

If you're still having issues:

1. Check server console for error messages
2. Verify MySQL is running: `net start MySQL80`
3. Test connection: `npm run test-db`
4. Check `.env` file has correct credentials

---

**Recommended:** Use XAMPP for the easiest setup on Windows!
