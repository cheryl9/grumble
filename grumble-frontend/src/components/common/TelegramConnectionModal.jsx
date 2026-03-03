import { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function TelegramConnectionModal({ isOpen, onClose, onConnect, botUsername }) {
  const [chatId, setChatId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate chat ID
    if (!chatId.trim()) {
      setError('Please enter your Telegram Chat ID');
      return;
    }

    if (!/^\d+$/.test(chatId.trim())) {
      setError('Chat ID must be numbers only');
      return;
    }

    setIsLoading(true);

    try {
      await onConnect(chatId.trim());
      setChatId('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBot = () => {
    const botLink = botUsername 
      ? `https://t.me/${botUsername.replace('@', '')}` 
      : 'https://t.me/';
    window.open(botLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Connect Telegram</h2>
              <p className="text-blue-100 text-sm">Get OTP and notifications instantly</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">📱</span>
                Follow these steps:
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 min-w-[20px]">1.</span>
                  <span>Open Telegram app on your phone or computer</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 min-w-[20px]">2.</span>
                  <div>
                    <span>Search for </span>
                    <button 
                      onClick={handleOpenBot}
                      className="font-bold text-blue-600 hover:text-blue-700 underline"
                    >
                      {botUsername || '@YourGrumbleBot'}
                    </button>
                    <span> or click the link above</span>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 min-w-[20px]">3.</span>
                  <span>Click <strong>START</strong> or send <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">/start</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 min-w-[20px]">4.</span>
                  <span>The bot will reply with your <strong>Chat ID</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 min-w-[20px]">5.</span>
                  <span>Copy the Chat ID and paste it below</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Chat ID Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Telegram Chat ID
              </label>
              <input
                type="text"
                placeholder="e.g., 123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !chatId.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Connect
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
