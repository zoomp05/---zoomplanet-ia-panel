// src/utils/passwordValidator.js
export const passwordConfigs = {
  low: {
    minLength: 8,
    regex: /^.{8,}$/,
    message: 'Password must be at least 8 characters long'
  },
  medium: {
    minLength: 10,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/,
    message: 'Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
  },
  high: {
    minLength: 12,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    message: 'Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  }
};

export const validatePassword = (password, level = 'low') => {
  const config = passwordConfigs[level] || passwordConfigs.low;
  
  if (!password.match(config.regex)) {
    throw new Error(config.message);
  }
  
  return true;
};