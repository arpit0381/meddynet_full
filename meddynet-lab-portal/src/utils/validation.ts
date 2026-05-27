
/**
 * MeddyNet Validation Rules
 */

export const validateFullName = (name: string): string => {
  // Letters, spaces, dots, hyphens only
  let sanitized = name.replace(/[^A-Za-z.\- ]/g, '');
  // Leading spaces removal
  sanitized = sanitized.replace(/^\s+/, '');
  // Double space to single space
  sanitized = sanitized.replace(/\s{2,}/g, ' ');
  return sanitized;
};

export const validatePhone = (phone: string): string => {
  // Numbers only
  let sanitized = phone.replace(/\D/g, '');
  // Max 10 digits
  if (sanitized.length > 10) {
    sanitized = sanitized.substring(0, 10);
  }
  return sanitized;
};

export const validateEmail = (email: string): string => {
  // No spaces and lowercase
  return email.replace(/\s/g, '').toLowerCase();
};

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Min 8 chars, 1 number, 1 uppercase, 1 lowercase, no spaces
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNoSpaces = !/\s/.test(password);
  
  return hasMinLength && hasNumber && hasUppercase && hasLowercase && hasNoSpaces;
};

export const getPasswordErrorMessage = (password: string): string | null => {
  if (password.length < 8) return "Min 8 characters required";
  if (!/\d/.test(password)) return "At least one number (0-9) required";
  if (!/[A-Z]/.test(password)) return "At least one uppercase (A-Z) required";
  if (!/[a-z]/.test(password)) return "At least one lowercase (a-z) required";
  if (/\s/.test(password)) return "Spaces are not allowed";
  return null;
};

export const validateDOB = (dob: string): boolean => {
  const date = new Date(dob);
  const today = new Date();
  const minDate = new Date('1900-01-01');
  
  return date >= minDate && date <= today;
};

export const validateOTP = (otp: string): string => {
  // Numbers only, max 6 digits
  let sanitized = otp.replace(/\D/g, '');
  if (sanitized.length > 6) {
    sanitized = sanitized.substring(0, 6);
  }
  return sanitized;
};

import api from "@/lib/api";

/**
 * Checks if the email is already registered.
 * Returns true if the email EXISTS in the database.
 */
export const isEmailRegistered = async (email: string): Promise<boolean | null> => {
  if (!isValidEmail(email)) return null;
  
  try {
    const res = await api.get(`/auth/check-unique?type=email&value=${encodeURIComponent(email)}`);
    return res.data.is_lab_staff; // Block only if already a lab account
  } catch (err) {
    console.error("Error checking email uniqueness:", err);
    return false; // Default to allow
  }
};

/**
 * Checks if the phone number is already registered as a lab account.
 */
export const isPhoneRegistered = async (phone: string): Promise<boolean | null> => {
  if (phone.length !== 10) return null;
  
  try {
    const res = await api.get(`/auth/check-unique?type=phone&value=${encodeURIComponent(phone)}`);
    return res.data.is_lab_staff; // Block only if already a lab account
  } catch (err) {
    console.error("Error checking phone uniqueness:", err);
    return false; // Default to allow
  }
};
