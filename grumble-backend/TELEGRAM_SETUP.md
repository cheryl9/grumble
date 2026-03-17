# Telegram Bot Setup for Grumble

## Quick Start Guide

### Step 1: Create Your Telegram Bot

1. **Open Telegram** on your phone or computer
2. **Search for** `@BotFather` (official Telegram bot for creating bots)
3. **Send** `/newbot` to BotFather
4. **Follow the instructions:**
   - Choose a name for your bot (e.g., "Grumble OTP Bot")
   - Choose a username (must end with 'bot', e.g., "GrumbleOTPBot")
5. **Copy the bot token** you receive (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. **Add the token to your `.env` file:**
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Step 2: Get Your Chat ID

#### Method 1: Using the Bot (Manual)

1. Search for your bot in Telegram (e.g., `@GrumbleOTPBot`)
2. Click **START** or send `/start`
3. The bot will reply with your Chat ID

#### Method 2: Using Telegram API

1. Send `/start` to your bot
2. Visit this URL in your browser:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   Replace `<YOUR_BOT_TOKEN>` with your actual bot token
3. Look for `"chat":{"id":123456789` in the response
4. Copy the number (e.g., `123456789`)

### Step 3: Connect in Grumble App

1. **Login** to Grumble
2. Go to **Profile** page
3. Click **"Connect Telegram"** button
4. Follow the instructions in the modal
5. **Paste your Chat ID** and click Connect

---

## Features

Once connected, you will:

- ✅ Receive password reset OTP via Telegram
- ✅ Get instant chat notifications (coming soon)
- ✅ No need for SMS or email verification

---

## Troubleshooting

### "Failed to connect"

- Make sure you sent `/start` to your bot first
- Verify the Chat ID is correct (numbers only)
- Check that your bot token is correct in `.env`

### "Not receiving OTP"

- Verify Telegram is connected in Profile page
- Check that you sent `/start` to the bot
- Restart the backend server after adding bot token

### "Bot not responding"

- Make sure `TELEGRAM_BOT_TOKEN` is set in `.env`
- Restart the backend server
- Check backend console for errors

---

## For Developers

### Test Telegram Connection

```javascript
// Check if bot is configured
const telegramService = require("./services/telegramService");
const botInfo = await telegramService.getBotInfo();
console.log(botInfo); // Should show your bot details
```

### Manual Database Connection

```sql
-- Connect a test user
UPDATE users
SET telegram_chat_id = 123456789,
    telegram_username = '@testuser',
    telegram_first_name = 'Test',
    telegram_connected_at = NOW()
WHERE phone_number = '91234567';
```

---

## Security Notes

- ⚠️ **Never commit** your `.env` file with bot token to git
- ⚠️ Bot token gives full access to your bot - keep it secret
- ✅ Users can only connect their own Chat ID
- ✅ Each Chat ID can only be connected to one account

---

## Bot Commands to Implement (Future)

You can enhance your bot by implementing these commands:

```javascript
/start - Get your Chat ID and connect to Grumble
/help - Show help message
/disconnect - Disconnect from Grumble
/status - Check connection status
```

---

Need help? Check the [Telegram Bot API docs](https://core.telegram.org/bots/api)
