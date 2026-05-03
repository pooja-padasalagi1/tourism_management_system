USE tms_db;

INSERT INTO users (name,email,password,role) VALUES
('Admin User','admin@example.com','$2a$10$u1sQXDW6g6v6sQq0z1bqAuPq1k6X/3tF7aYw1f2u1kq1N6B5w0Q12','admin'),
('Manager User','manager@example.com','$2a$10$u1sQXDW6g6v6sQq0z1bqAuPq1k6X/3tF7aYw1f2u1kq1N6B5w0Q12','manager'),
('Normal User','user@example.com','$2a$10$u1sQXDW6g6v6sQq0z1bqAuPq1k6X/3tF7aYw1f2u1kq1N6B5w0Q12','user');

INSERT INTO hotels (name,location,rating,description,amenities,price_range) VALUES
('Seaside Hotel','Beach City',5,'A luxurious beachfront hotel with stunning ocean views.','WiFi, Pool, Spa, Restaurant','200-500'),
('Mountain Lodge','Highlands',4,'Cozy mountain retreat perfect for nature lovers.','Fireplace, Hiking Trails, Restaurant','150-400'),
('City Center Inn','Downtown',3,'Convenient urban hotel near all attractions.','WiFi, Gym, Breakfast','100-250'),
('Desert Oasis Resort','Desert Valley',5,'Luxury desert resort with traditional architecture.','Pool, Spa, Camel Rides, Restaurant','300-800');

INSERT INTO tours (title,description,price,duration_days,difficulty,max_participants) VALUES
('City Highlights','A short city highlights tour with guided walking',49.99,1,'Easy',20),
('Adventure Trek','A full-day mountain trek with professional guides',129.99,1,'Moderate',15),
('Desert Safari','Experience the desert with camel rides and traditional meals',89.99,2,'Easy',12),
('Cultural Immersion','Learn about local traditions and visit historical sites',79.99,3,'Easy',25),
('Extreme Adventure','High-altitude trekking and adventure sports',299.99,5,'Hard',8);

INSERT INTO bookings (user_id,tour_id,hotel_id,status) VALUES
(3,1,1,'confirmed'),
(3,2,2,'pending'),
(2,3,4,'completed'),
(1,4,3,'confirmed'),
(3,5,2,'cancelled');

INSERT INTO payments (booking_id,user_name,amount,method,status,transaction_id) VALUES
(1,'Normal User',49.99,'Credit Card','completed','TXN-2024-001'),
(2,'Normal User',129.99,'PayPal','completed','TXN-2024-002'),
(3,'Manager User',89.99,'Bank Transfer','pending','TXN-2024-003'),
(4,'Admin User',79.99,'Credit Card','completed','TXN-2024-004'),
(5,'Normal User',299.99,'PayPal','refunded','TXN-2024-005');

INSERT INTO reviews (author,category,rating,comment,helpful) VALUES
('John Doe','hotel',5,'Amazing beachfront location and excellent service!',12),
('Jane Smith','tour',4,'Great adventure trek, highly recommend!',8),
('Bob Wilson','hotel',3,'Decent hotel but could use some maintenance',3),
('Alice Brown','tour',5,'Cultural immersion was eye-opening, wonderful experience',15),
('Charlie Davis','hotel',4,'Mountain lodge was cozy and peaceful',6);

INSERT INTO tour_guides (name,phone,bio,languages,rating,tours,available) VALUES
('Ahmed Hassan','+1-555-0101','Experienced desert guide with 10 years of experience','Arabic, English, French',4.8,45,1),
('Maria Garcia','+1-555-0102','Mountain trekking expert and nature photographer','Spanish, English',4.9,32,1),
('David Chen','+1-555-0103','Cultural historian specializing in local traditions','English, Mandarin, Japanese',4.7,28,0),
('Sarah Johnson','+1-555-0104','Adventure sports instructor and safety expert','English, German',4.6,41,1),
('Omar Al-Rashid','+1-555-0105','Camel caravan leader and traditional storyteller','Arabic, English',4.5,38,1);

INSERT INTO enquiries (name,email,subject,message,status) VALUES
('Mike Thompson','mike@example.com','Tour Inquiry','Interested in the desert safari package for next month','new'),
('Lisa Wong','lisa@example.com','Hotel Booking','Looking for accommodation in Beach City for 3 nights','in-progress'),
('Robert Kim','robert@example.com','Group Booking','Planning a group tour for 12 people','new'),
('Emma Davis','emma@example.com','Payment Question','Need help with payment options for international transfers','resolved'),
('Carlos Rodriguez','carlos@example.com','Cancellation Policy','What is the cancellation policy for tours?','new');

INSERT INTO transfers (provider,pickup,dropoff,type,price,vehicles) VALUES
('Desert Express','Airport Terminal 1','Seaside Hotel','Private Car',45.00,'Sedan, SUV'),
('Mountain Transit','Bus Station','Mountain Lodge','Shared Van',25.00,'Minivan (up to 8 people)'),
('City Shuttle','Train Station','City Center Inn','Taxi',15.00,'Sedan'),
('Luxury Transfers','Airport VIP','Desert Oasis Resort','Luxury SUV',85.00,'Premium SUV with driver'),
('Group Transport','Hotel Zone','Adventure Park','Bus',60.00,'Tour Bus (up to 30 people)');
