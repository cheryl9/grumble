import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import logo from '../../assets/logo.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login(formData.username, formData.password);
      // Navigate to admin dashboard on successful login
      navigate('/admin');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials or account is inactive. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div
        className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxWidth: '480px' }}
      >
        {/* Inner content with padding */}
        <div style={{ padding: '40px 48px' }}>
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Grumble Logo" className="w-16 h-16 mb-4" />
            <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
              ADMIN PANEL
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Administrator Login</h1>
          <p className="text-gray-600 text-center mb-8">Access the Grumble admin dashboard</p>

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Admin Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Enter admin username"
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Logging in...' : 'Login to Admin Panel'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔒 Admin access only. All login attempts are logged.
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Not an admin? <a href="/login" className="text-[#F78660] hover:underline">User login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
