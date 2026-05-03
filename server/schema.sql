-- Schema for Tourism Management System (minimal)
CREATE DATABASE IF NOT EXISTS tms_db;
USE tms_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200),
  location VARCHAR(200),
  rating INT DEFAULT 0,
  description TEXT,
  amenities TEXT,
  price_range VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  price DECIMAL(10,2),
  duration_days INT DEFAULT 1,
  difficulty VARCHAR(50) DEFAULT 'Easy',
  max_participants INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tour_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duration_days INT,
  price DECIMAL(10,2),
  destination VARCHAR(200),
  included_activities TEXT,
  max_participants INT,
  difficulty_level VARCHAR(50),
  rating INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  tour_id INT,
  hotel_id INT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE SET NULL,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author VARCHAR(150) DEFAULT 'Anonymous',
  category VARCHAR(50) DEFAULT 'hotel',
  rating INT DEFAULT 0,
  comment TEXT,
  helpful INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tour_guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(100),
  bio TEXT,
  languages VARCHAR(255),
  rating DECIMAL(3,1) DEFAULT 0,
  tours INT DEFAULT 0,
  available TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(200),
  pickup VARCHAR(255),
  dropoff VARCHAR(255),
  type VARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0,
  vehicles TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  user_name VARCHAR(150),
  amount DECIMAL(10,2) DEFAULT 0,
  method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
