import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import logo from '../../assets/logo.png';
import { validatePhoneNumber, validatePassword } from '../../utils/validation';
import { ROUTES } from '../../utils/constants';
import * as authService from '../../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  const [step, setStep] = useState(resetToken ? 'reset' : 'request');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.forgotPassword(phoneNumber);
      setSuccessMessage('If this phone number is registered, you will receive a password reset link in the console (development mode).');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors({ newPassword: passwordError });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(resetToken, newPassword);
      setSuccessMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Invalid or expired token.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div
        className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ maxWidth: '480px' }}
      >
        <div style={{ padding: '40px 48px' }}>
          <img src={logo} alt="Grumble Logo" className="w-16 h-16 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {step === 'request'
              ? 'Enter your phone number to receive a reset link'
              : 'Enter your new password'}
          </p>

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="flex flex-col gap-5">
              <Input
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) setErrors({});
                }}
                error={errors.phoneNumber}
                placeholder="81234567"
                required
              />

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({});
                }}
                error={errors.newPassword}
                placeholder="Enter new password"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({});
                }}
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
                required
              />

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-primary font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}