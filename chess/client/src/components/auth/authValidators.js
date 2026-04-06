const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_-]{3,32}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export function validateLoginForm({ username, password }) {
  const errors = {};

  if (!username.trim()) {
    errors.username = 'Username is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateRegistrationForm({ username, email, password, confirmPassword }) {
  const errors = {};

  if (!USERNAME_RE.test(username.trim())) {
    errors.username = 'Username must be 3-32 characters and use only letters, numbers, underscores, or hyphens.';
  }

  if (!EMAIL_RE.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!PASSWORD_RE.test(password)) {
    errors.password = 'Password must be 8-72 characters and include uppercase, lowercase, and a number.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function getPasswordStrength(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[@$!%*?&]/.test(password);
  const isLongEnough = password.length >= 8;

  if (isLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars) {
    return { label: 'Strong', tone: 'strong' };
  }

  if (isLongEnough && (hasUpperCase || hasLowerCase) && (hasNumbers || hasSpecialChars)) {
    return { label: 'Moderate', tone: 'moderate' };
  }

  return { label: 'Weak', tone: 'weak' };
}