export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
  };
}

export function validateLoginForm(data: LoginFormData): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle specific error types or messages
    if (error.message.includes('credentials')) {
      return 'Invalid email or password';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}