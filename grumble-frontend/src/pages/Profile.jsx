import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import TelegramConnectionModal from '../components/common/TelegramConnectionModal';
import * as authService from '../services/authService';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handleConnectTelegram = async (chatId) => {
    try {
      await authService.connectTelegram(chatId);
      
      // Fetch fresh user data from server to get updated Telegram info
      const freshUser = await authService.fetchCurrentUser();
      if (freshUser) {
        setUser(freshUser);
      }
      
      setSuccessMessage('Telegram connected successfully! 🎉');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  const handleDisconnectTelegram = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram? You won\'t receive OTP or notifications.')) {
      return;
    }

    setIsDisconnecting(true);
    setError('');

    try {
      await authService.disconnectTelegram();
      
      // Fetch fresh user data from server to confirm disconnection
      const freshUser = await authService.fetchCurrentUser();
      if (freshUser) {
        setUser(freshUser);
      }
      
      setSuccessMessage('Telegram disconnected');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to disconnect. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isTelegramConnected = user?.telegramChatId;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {user && (
          <>
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Username</label>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone Number</label>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Member Since</label>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Telegram Integration */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Telegram Integration</h2>
              <p className="text-sm text-gray-600 mb-4">
                Connect your Telegram to receive OTP codes and chat notifications instantly
              </p>

              {isTelegramConnected ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">✅</div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">Telegram Connected</p>
                        {user.telegramUsername && (
                          <p className="text-sm text-green-700 mt-1">
                            Account: <span className="font-medium">{user.telegramUsername}</span>
                          </p>
                        )}
                        <p className="text-xs text-green-600 mt-1">
                          Connected on {new Date(user.telegramConnectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnectTelegram}
                    disabled={isDisconnecting}
                    className="w-full px-4 py-2.5 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect Telegram'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-900">Not Connected</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Connect Telegram to receive password reset codes and notifications
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowTelegramModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📱</span>
                    Connect Telegram
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      {/* Telegram Connection Modal */}
      <TelegramConnectionModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onConnect={handleConnectTelegram}
        botUsername="@grumble1122_bot"
      />
    </div>
  );
}