# Tourism Management System (TMS)

This repository contains a minimal, full-stack Tourism Management System (TMS) scaffold using React (frontend), Node/Express (backend) and MySQL (database).

Contents:
- `server/` — Express API, authentication (JWT), MySQL connection, routes and controllers.
- `client/` — React app with pages, header/footer, and example API integration.
- `server/schema.sql` and `server/seed.sql` — database schema and seed data.

Quick start (two terminals):

1. Backend

```bash
cd server
npm install
cp .env.sample .env  # edit DB and JWT vars
npm run dev          # requires nodemon or use `npm start`
```

2. Frontend

```bash
cd client
npm install
npm start
```

Then open http://localhost:3000 and use the seeded accounts (see `server/seed.sql`).

This scaffold is minimal and intended as a starting point. It includes modules: Users (with roles), Hotels, Tours, Bookings, and Reports with dummy data and pages.