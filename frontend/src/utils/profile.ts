/**
 * Validate phone number format
 * Accepts international format with optional + prefix
 * Must start with 1-9 and contain 1-16 digits
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Check password security requirements
 * Returns object with secure flag and optional error message
 */
export function checkPasswordSecurity(currentPwd: string, newPwd: string): { secure: boolean; message?: string } {
  if (currentPwd === newPwd) {
    return { secure: false, message: 'The new password should be different from the old password.' };
  }
  if (newPwd.length < 8) {
    return { secure: false, message: 'The new password must be at least 8 characters long.' };
  }
  if (!/(?=.*[a-z])/.test(newPwd)) {
    return { secure: false, message: 'The new password must contain at least one lowercase letter.' };
  }
  if (!/(?=.*[A-Z])/.test(newPwd)) {
    return { secure: false, message: 'The new password must contain at least one uppercase letter.' };
  }
  if (!/(?=.*\d)/.test(newPwd)) {
    return { secure: false, message: 'The new password must contain at least one number.' };
  }
  return { secure: true };
}
