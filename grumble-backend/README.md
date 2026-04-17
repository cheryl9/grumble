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

## 5. Run the Migrations

This sets up the required tables and indexes:

```bash
# 1. Create food places table with PostGIS
psql -U postgres -d grumble -f migrations/001_create_food_places.sql

# 2. Create users and password_reset_otps tables
psql -U postgres -d grumble -f migrations/002_create_users.sql

# 3. Add Telegram integration fields to users table
psql -U postgres -d grumble -f migrations/003_add_telegram_fields.sql

# 4. Create admin tables
psql -U postgres -d grumble -f migrations/004_create_admin_tables.sql

# 5. Create saves table
psql -U postgres -d grumble -f migrations/005_create_saves.sql

# 6. Add food place enrichment fields
psql -U postgres -d grumble -f migrations/006_add_food_place_enrichment_fields.sql
```

Or run all migrations via npm script:

```bash
npm run migrate:all
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
PORT=5001
JWT_SECRET=your-secret-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
```

Replace:

- `yourpassword` with the password you set in Step 3
- `your-secret-key-here` with a random secret string (e.g., generated from `openssl rand -hex 32`)
- `your-telegram-bot-token-here` with your Telegram bot token from [@BotFather](https://t.me/BotFather)

**For Telegram setup**, see [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for detailed instructions.

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

or

```bash
npm run start
```

Server will run on http://localhost:5001

---

## 10. (Optional) Start Telegram Bot Helper

To help users get their Chat ID easily, run this script alongside the server:

```bash
node scripts/telegramBotHelper.js
```

This bot will auto-reply with the Chat ID when users send `/start` to your bot.

See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for full details.

---

## Useful npm Scripts

```bash
npm run dev              # Run server in watch mode
npm run start            # Start server normally
npm run migrate:all      # Run all migrations in order
npm run sync:osm         # Sync OSM food places into DB
npm run admin:create     # Create an admin user
npm run telegram:helper  # Run Telegram helper bot
```

---

## API Endpoints

### Food Places

| Method | Endpoint                                              | Description                   |
| ------ | ----------------------------------------------------- | ----------------------------- |
| GET    | /api/food-places                                      | Get all food places           |
| GET    | /api/food-places?category=cafe                        | Filter by category            |
| GET    | /api/food-places?cuisine=chinese                      | Filter by cuisine             |
| GET    | /api/food-places?category=restaurant&cuisine=japanese | Filter by both                |
| GET    | /api/food-places/:id                                  | Get a single food place by ID |

### Authentication

| Method | Endpoint                             | Description                                     |
| ------ | ------------------------------------ | ----------------------------------------------- |
| POST   | /api/auth/register                   | Register a new user (phone, username, password) |
| POST   | /api/auth/login                      | Login with phone and password                   |
| GET    | /api/auth/user                       | Get logged-in user details (requires JWT)       |
| POST   | /api/auth/forgot-password/send-otp   | Send password reset OTP via Telegram            |
| POST   | /api/auth/forgot-password/verify-otp | Verify OTP code                                 |
| POST   | /api/auth/forgot-password/reset      | Reset password with verified OTP                |
| POST   | /api/auth/telegram/connect           | Connect Telegram account (requires JWT)         |
| POST   | /api/auth/telegram/disconnect        | Disconnect Telegram account (requires JWT)      |

---

## Available Categories

- restaurant
- cafe
- fast_food
- food_court
- hawker_centre
