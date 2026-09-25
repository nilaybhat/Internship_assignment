export function validateRequired(value, label = 'This field') {
  return value && value.trim() ? '' : `${label} is required`;
}

export function validateName(value) {
  if (!value || !value.trim()) return 'Name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  return '';
}

export function validateEmail(value) {
  if (!value || !value.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address';
  return '';
}

export function validatePassword(value, minLength = 6) {
  if (!value) return 'Password is required';
  if (value.length < minLength) return `Password must be at least ${minLength} characters`;
  return '';
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return '';
}

export function validateTaskTitle(value) {
  if (!value || !value.trim()) return 'Title is required';
  if (value.trim().length > 200) return 'Title cannot exceed 200 characters';
  return '';
}