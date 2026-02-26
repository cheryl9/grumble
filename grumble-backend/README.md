# Grumble Backend

## Prerequisites
- Node.js
- npm

## 1. Install PostgreSQL

### Mac
```bash
brew install postgresql@17
brew services start postgresql@17
brew link postgresql@17 --force --overwrite
```

### Windows
Download and run the installer from https://www.postgresql.org/download/windows/
Follow the installer steps and take note of the password you set.

---

## 2. Install PostGIS

### Mac
```bash
brew install postgis
```

### Windows
During the PostgreSQL installation, use the included Stack Builder tool to install PostGIS.

---

## 3. Create a PostgreSQL Role

Connect to PostgreSQL:

### Mac
```bash
psql -d postgres
```

### Windows / Linux
```bash
psql -U postgres
```

Then run:
```sql
CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'yourpassword';
-- password up to you, here the role name is postgres. You will use this to access the db in the system
\q
```

---

## 4. Create the Database

Connect to PostgreSQL:
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE grumble;
\q
```

---

## 5. Run the Migration

This sets up the required tables and indexes:
```bash
psql -U postgres -d grumble -f migrations/001_create_food_places.sql
```

---

## 6. Install Dependencies
```bash
npm install
```

---

## 7. Set Up Environment Variables

Create a `.env` file in the backend root based on `.env.example`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/grumble
PORT=3000
```

Replace `yourpassword` with the password you set in Step 3.

---

## 8. Sync Food Places from OpenStreetMap

This fetches all food places in Singapore and stores them in your database.
Note: This may take a few minutes.
```bash
node scripts/syncOSM.js
```

---

## 9. Start the Server
```bash
node server.js
```

Server will run on http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/food-places | Get all food places |
| GET | /api/food-places?category=cafe | Filter by category |
| GET | /api/food-places?cuisine=chinese | Filter by cuisine |
| GET | /api/food-places?category=restaurant&cuisine=japanese | Filter by both |
| GET | /api/food-places/:id | Get a single food place by ID |

---

## Available Categories
- restaurant
- cafe
- fast_food
- food_court
- hawker_centre