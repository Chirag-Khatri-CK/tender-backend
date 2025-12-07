import bcrypt from 'bcryptjs';

export const generateOtp = (): string => {
  return ('' + Math.floor(100000 + Math.random() * 900000));
};

export const hashOtp = async (otp: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

export const verifyOtpHash = async (otp: string, otpHash: string) => {
  return bcrypt.compare(otp, otpHash);
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

// password validator: 8-32 chars, no spaces, at least one lower, one upper, one number
export const passwordIsValid = (password: string): { success: boolean, reason?: string } => {
  if (!password) return { success: false, reason: 'Password required' };
  if (password.length < 8 || password.length > 32) return { success: false, reason: 'Password must be 8-32 characters' };
  if (password.includes(' ')) return { success: false, reason: 'Password must not contain spaces' };
  if (!/[a-z]/.test(password)) return { success: false, reason: 'Password must include a lowercase letter' };
  if (!/[A-Z]/.test(password)) return { success: false, reason: 'Password must include an uppercase letter' };
  if (!/[0-9]/.test(password)) return { success: false, reason: 'Password must include a number' };
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return { success: false, reason: 'Password must include a special character' };
  return { success: true };
};
