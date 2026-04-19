require('../config/loadEnv');
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

let lastUpdateId = 0;
let pollingInterval = null;

async function sendChatId(chatId, firstName) {
  const message = `👋 Hello ${firstName}!

Your Telegram Chat ID is: *${chatId}*

📋 To connect to Grumble:
1. Go to your Grumble Profile page
2. Click "Connect Telegram"
3. Enter this Chat ID: \`${chatId}\`
4. Click Connect

That's it! You'll now receive OTP codes here. 🎉`;

  await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  });

  console.log(`✅ Sent Chat ID to ${firstName} (${chatId})`);
}

async function pollUpdates() {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getUpdates`, {
      params: {
        offset: lastUpdateId + 1,
        timeout: 30
      }
    });

    const updates = response.data.result || [];

    for (const update of updates) {
      lastUpdateId = update.update_id;

      if (update.message?.text === '/start') {
        const chatId = update.message.chat.id;
        const firstName = update.message.from.first_name || 'User';
        console.log(`📱 New /start from ${firstName} (Chat ID: ${chatId})`);
        await sendChatId(chatId, firstName);
      }
    }
  } catch (error) {
    console.error('❌ Polling error:', error.message);
  }
}

// Start polling — call this from server.js
function startPolling(intervalMs = 30000) {
  if (!BOT_TOKEN || BOT_TOKEN === 'your_bot_token_here') {
    console.warn('⚠️ Telegram bot not configured, skipping polling');
    return;
  }

  console.log('🤖 Telegram bot polling started...');
  pollUpdates(); // Run immediately on start
  pollingInterval = setInterval(pollUpdates, intervalMs);
}

// Stop polling gracefully
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    console.log('🛑 Telegram polling stopped');
  }
}

module.exports = { startPolling, stopPolling };