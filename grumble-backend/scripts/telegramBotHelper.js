require('../config/loadEnv');
const express = require('express');
const axios = require('axios');

/**
 * Simple Telegram Bot Helper
 * 
 * This script sets up a simple webhook to help users get their Chat ID
 * Run this temporarily to help users connect their Telegram
 * 
 * Usage:
 * 1. Make sure TELEGRAM_BOT_TOKEN is set in .env
 * 2. Run: node scripts/telegramBotHelper.js
 * 3. Users send /start to your bot
 * 4. Bot replies with their Chat ID
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.BOT_HELPER_PORT || 3001;

if (!BOT_TOKEN || BOT_TOKEN === 'your_bot_token_here') {
  console.error('❌ TELEGRAM_BOT_TOKEN not configured in .env');
  console.log('\n📝 To set up:');
  console.log('1. Open Telegram and search for @BotFather');
  console.log('2. Send /newbot and follow instructions');
  console.log('3. Copy the bot token to .env file\n');
  process.exit(1);
}

const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Simple polling to get updates
let lastUpdateId = 0;

// Send welcome message with Chat ID
async function sendChatId(chatId, firstName) {
  const message = 
`👋 Hello ${firstName}!

Your Telegram Chat ID is: *${chatId}*

📋 To connect to Grumble:
1. Go to your Grumble Profile page
2. Click "Connect Telegram"
3. Enter this Chat ID: \`${chatId}\`
4. Click Connect

That's it! You'll now receive OTP codes here. 🎉`;

  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    console.log(`✅ Sent Chat ID to ${firstName} (${chatId})`);
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
  }
}

// Poll for updates
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

      if (update.message && update.message.text === '/start') {
        const chatId = update.message.chat.id;
        const firstName = update.message.from.first_name || 'User';
        
        console.log(`\n📱 New /start from ${firstName} (Chat ID: ${chatId})`);
        await sendChatId(chatId, firstName);
      }
    }
  } catch (error) {
    console.error('❌ Error polling updates:', error.message);
  }
}

// Get bot information
async function getBotInfo() {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
    return response.data.result;
  } catch (error) {
    console.error('❌ Failed to get bot info');
    return null;
  }
}

// Start the helper
async function start() {
  console.log('\n🤖 Telegram Bot Helper Starting...\n');

  const botInfo = await getBotInfo();
  
  if (!botInfo) {
    console.error('❌ Could not connect to Telegram. Check your bot token.');
    process.exit(1);
  }

  console.log('✅ Bot connected successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 Bot Name: ${botInfo.first_name}`);
  console.log(`🔗 Username: @${botInfo.username}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📢 Instructions for Users:\n');
  console.log(`1. Open Telegram`);
  console.log(`2. Search for: @${botInfo.username}`);
  console.log(`3. Click START or send /start`);
  console.log(`4. Bot will reply with your Chat ID\n`);
  
  console.log('🔄 Listening for /start messages...\n');
  console.log('Press Ctrl+C to stop\n');

  // Poll every 1 second
  setInterval(pollUpdates, 1000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Bot helper stopped');
  process.exit(0);
});

// Start
start();
