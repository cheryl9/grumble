export const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return 'Password must include uppercase, lowercase, number, and special character';
  }
  
  return null;
};

export const validatePhoneNumber = (phone) => {
  // Singapore phone format: 8 digits starting with 8 or 9
  const sgPhoneRegex = /^[89]\d{7}$/;
  return sgPhoneRegex.test(phone) ? null : 'Invalid Singapore phone number';
};

export const validateUsername = (username) => {
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};