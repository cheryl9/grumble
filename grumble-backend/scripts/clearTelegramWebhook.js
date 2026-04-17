require('../config/loadEnv');
const axios = require('axios');

/**
 * Clear Telegram Webhook
 * Run this if you get 409 errors when polling
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN || BOT_TOKEN === 'your_bot_token_here') {
  console.error('❌ TELEGRAM_BOT_TOKEN not configured in .env');
  process.exit(1);
}

const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function clearWebhook() {
  console.log('🔄 Deleting webhook...\n');
  
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/deleteWebhook`, {
      drop_pending_updates: true
    });

    if (response.data.ok) {
      console.log('✅ Webhook deleted successfully!');
      console.log('✅ Pending updates cleared');
      console.log('\n✨ You can now run: node scripts/telegramBotHelper.js\n');
    } else {
      console.log('⚠️ Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearWebhook();
