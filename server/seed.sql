USE tms_db;

INSERT INTO users (name,email,password,role) VALUES
('Admin User','admin@example.com','$2a$10$u1sQXDW6g6v6sQq0z1bqAuPq1k6X/3tF7aYw1f2u1kq1N6B5w0Q12','admin'),
('Manager User','manager@example.com','$2a$10$u1sQXDW6g6v6sQq0z1bqAuPq1k6X/3tF7aYw1f2u1kq1N6B5w0Q12','manager'),
('Normal User','user@example.com','$2a$10$u1sQXDW6g6v6sQq0z1bqAuPq1k6X/3tF7aYw1f2u1kq1N6B5w0Q12','user');

-- Note: hashed password above is `password` (bcrypt)

INSERT INTO hotels (name,location,rating) VALUES
('Seaside Hotel','Beach City',5),
('Mountain Lodge','Highlands',4);

INSERT INTO tours (title,description,price) VALUES
('City Highlights','A short city highlights tour',49.99),
('Adventure Trek','A full-day mountain trek',129.99);

INSERT INTO bookings (user_id,tour_id,hotel_id,status) VALUES
(3,1,1,'confirmed'),
(3,2,2,'pending');
