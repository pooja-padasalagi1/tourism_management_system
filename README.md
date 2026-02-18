# 🌍 Tourism Management System

A beautiful, modern web application for managing tourism operations including hotels, tours, bookings, and users.

![Tourism Management System](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🏨 **Hotel Management** - Add, edit, and manage hotel listings with ratings and locations
- ✈️ **Tour Management** - Create and organize tours with pricing and descriptions
- 📅 **Booking System** - Handle reservations and booking statuses
- 👥 **User Management** - Manage users with role-based access (Admin, Manager, User)
- 📊 **Dashboard** - Beautiful overview with statistics and insights
- 📈 **Reports** - Generate detailed analytics and reports
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 🔐 **Authentication** - Secure JWT-based authentication
- 🎨 **Modern UI** - Beautiful gradient designs with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tourism-management-system
```

2. **Install dependencies**
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

3. **Setup Database**
```bash
cd server
npm run setup-db
```

4. **Start the application**

Terminal 1 (Backend):
```bash
cd server
npm start
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

5. **Access the application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

### Default Login Credentials

| Role    | Email                  | Password |
|---------|------------------------|----------|
| Admin   | admin@example.com      | password |
| Manager | manager@example.com    | password |
| User    | user@example.com       | password |

⚠️ **Change these passwords immediately in production!**

## 📁 Project Structure

```
tourism-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── api.js         # API client
│   │   ├── auth.js        # Authentication utilities
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   ├── db.js             # Database connection
│   ├── schema.sql        # Database schema
│   ├── seed.sql          # Seed data
│   └── package.json
├── DATABASE_SETUP.md      # Detailed database guide
├── QUICK_START.md         # Quick start guide
└── README.md             # This file
```

## 🎨 UI Features

### Beautiful Design Elements
- **Gradient Backgrounds** - Stunning multi-color gradients
- **Smooth Animations** - Floating, sliding, and scaling effects
- **Glassmorphism** - Modern frosted glass effects
- **Responsive Design** - Works on all screen sizes
- **Interactive Cards** - Hover effects and transitions
- **Color-Coded Roles** - Visual distinction for user roles
- **Status Badges** - Clear visual indicators for booking status

### Pages

1. **Dashboard** 📊
   - Overview statistics
   - Top rated hotels
   - Premium tours
   - Popular locations
   - Recent bookings

2. **Hotels** 🏨
   - Hotel listings with ratings
   - Location-based filtering
   - Sort by name, rating, location
   - Add/Edit/Delete hotels

3. **Tours** ✈️
   - Tour packages with pricing
   - Price category badges (Budget, Mid-Range, Luxury)
   - Search and filter options
   - Manage tour details

4. **Bookings** 📅
   - Booking management
   - Status tracking (Pending, Confirmed, Cancelled)
   - User and tour information
   - Quick status updates

5. **Users** 👥
   - User account management
   - Role-based access control
   - User statistics by role
   - Profile management

6. **Reports** 📈
   - Analytics and insights
   - Data visualization
   - Export capabilities

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tms_db

# JWT Configuration
JWT_SECRET=your_secret_key_here

# Server Configuration
PORT=4000
```

### Database Schema

The application uses MySQL with the following tables:
- `users` - User accounts and authentication
- `hotels` - Hotel listings
- `tours` - Tour packages
- `bookings` - Reservation records

See `DATABASE_SETUP.md` for detailed schema information.

## 🛠️ Development

### Available Scripts

**Server:**
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run setup-db   # Setup database
npm run test-db    # Test database connection
```

**Client:**
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation
- SQL injection prevention

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🌓 Theme Support

Toggle between light and dark themes with a single click. Theme preference is saved in localStorage.

## 🐛 Troubleshooting

### Database Connection Issues

1. Verify MySQL is running
2. Check credentials in `.env`
3. Run: `npm run test-db`

### Port Conflicts

Change the port in `server/.env`:
```env
PORT=5000
```

### Build Errors

Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create hotel
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/:id` - Get tour by ID
- `POST /api/tours` - Create tour
- `PUT /api/tours/:id` - Update tour
- `DELETE /api/tours/:id` - Delete tour

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for tourism management

## 🙏 Acknowledgments

- React.js for the frontend framework
- Express.js for the backend framework
- MySQL for the database
- All the amazing open-source libraries used in this project

---

**Happy Tourism Management! 🌍✨**

For detailed setup instructions, see:
- `QUICK_START.md` - Quick setup guide
- `DATABASE_SETUP.md` - Database configuration guide
