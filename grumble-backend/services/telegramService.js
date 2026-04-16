require('../config/loadEnv');
const axios = require('axios');

/**
 * Telegram Bot Service
 * Sends OTP and notifications via Telegram Bot API
 * 
 * Setup:
 * 1. Open Telegram and search for @BotFather
 * 2. Send /newbot and follow instructions
 * 3. Get your bot token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
 * 4. Add TELEGRAM_BOT_TOKEN to .env
 * 
 * No SDK needed - uses simple HTTP requests!
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Check if Telegram bot is configured
 */
const isTelegramConfigured = () => {
  return !!BOT_TOKEN && BOT_TOKEN !== 'your_bot_token_here';
};

/**
 * Send a text message via Telegram
 * @param {number} chatId - Telegram chat ID
 * @param {string} text - Message text
 * @param {object} options - Additional options (parse_mode, etc.)
 */
const sendMessage = async (chatId, text, options = {}) => {
  if (!isTelegramConfigured()) {
    console.warn('⚠️ Telegram bot not configured. Set TELEGRAM_BOT_TOKEN in .env');
    return null;
  }

  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: options.parse_mode || 'Markdown',
      ...options
    });

    return response.data;
  } catch (error) {
    console.error('❌ Telegram API error:', error.response?.data || error.message);
    throw new Error('Failed to send Telegram message');
  }
};

/**
 * Send OTP code via Telegram
 * @param {number} chatId - User's Telegram chat ID
 * @param {string} otpCode - 6-digit OTP code
 */
const sendOTP = async (chatId, otpCode) => {
  const message = 
`🔐 *Grumble Password Reset*

Your OTP code is: *${otpCode}*

This code will expire in *10 minutes*.

If you didn't request this, please ignore this message.`;

  try {
    await sendMessage(chatId, message);
    
    console.log(`✅ OTP sent via Telegram to chat_id: ${chatId}`);
    
    return {
      success: true,
      method: 'telegram',
      chatId: chatId
    };
  } catch (error) {
    console.error(`❌ Failed to send OTP to chat_id ${chatId}:`, error.message);
    throw error;
  }
};

/**
 * Send chat notification via Telegram
 * @param {number} chatId - User's Telegram chat ID
 * @param {object} notification - Notification details
 */
const sendChatNotification = async (chatId, notification) => {
  const { senderName, message, chatName } = notification;
  
  const text = 
`💬 *New message in ${chatName}*

*${senderName}:* ${message}

Open Grumble to reply`;

  try {
    await sendMessage(chatId, text);
    
    console.log(`✅ Chat notification sent to chat_id: ${chatId}`);
    
    return {
      success: true,
      method: 'telegram'
    };
  } catch (error) {
    console.error(`❌ Failed to send notification to chat_id ${chatId}:`, error.message);
    throw error;
  }
};

/**
 * Get bot information (for testing)
 */
const getBotInfo = async () => {
  if (!isTelegramConfigured()) {
    return null;
  }

  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
    return response.data.result;
  } catch (error) {
    console.error('❌ Failed to get bot info:', error.message);
    return null;
  }
};

/**
 * Development fallback: Log to console if Telegram not configured
 */
const logToConsole = (chatId, otpCode) => {
  console.log('\n=================================================');
  console.log('📱 TELEGRAM SERVICE - DEVELOPMENT MODE');
  console.log('=================================================');
  console.log(`Chat ID: ${chatId}`);
  console.log(`OTP Code: ${otpCode}`);
  console.log('=================================================');
  console.log('⚠️ To send real Telegram messages:');
  console.log('1. Create bot with @BotFather in Telegram');
  console.log('2. Add TELEGRAM_BOT_TOKEN to .env');
  console.log('3. User sends /start to your bot to get chat_id');
  console.log('=================================================\n');
};

/**
 * Get chat information from Telegram
 * @param {number} chatId - Telegram chat ID
 */
const getChatInfo = async (chatId) => {
  if (!isTelegramConfigured()) {
    return null;
  }

  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getChat`, {
      params: { chat_id: chatId }
    });
    
    return response.data.result;
  } catch (error) {
    console.error('❌ Failed to get chat info:', error.message);
    throw new Error('Could not retrieve chat information');
  }
};

module.exports = {
  sendMessage,
  sendOTP,
  sendChatNotification,
  getBotInfo,
  getChatInfo,
  isTelegramConfigured,
  logToConsole
};
