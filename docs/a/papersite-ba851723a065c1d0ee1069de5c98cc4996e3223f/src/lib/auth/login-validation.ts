export interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    username?: string;
    password?: string;
    identifier?: string;
  };
}

export function validateLoginForm(data: LoginFormData): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // Identifier validation (email or username)
  if (!data.identifier) {
    errors.identifier = 'Email or username is required';
  } else if (data.identifier.includes('@') && !isValidEmail(data.identifier)) {
    errors.identifier = 'Please enter a valid email address';
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('credentials')) {
      return 'Invalid email/username or password';
    }
    if (error.message.includes('verify')) {
      return 'Please verify your email address';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}