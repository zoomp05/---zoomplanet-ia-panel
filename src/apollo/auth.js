// Re-export auth mutations from the module for compatibility
export {
  LOGIN,
  REGISTER,
  CONFIRM_EMAIL,
  RESEND_CONFIRMATION,
  SOCIAL_LOGIN,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  CHANGE_PASSWORD,
  LOGOUT,
  ME,
  VALIDATE_TOKEN
} from '../modules/auth/apollo/auth';
