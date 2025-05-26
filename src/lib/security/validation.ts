import { AuthError } from '@/lib/authTypes';
import { RegisterData, LoginCredentials } from '@/lib/authTypes';
import { UserProfile, Grade, SubjectLevel } from '@/types/profile';

// Request schemas for validation
interface SchemaProperty {
  type: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  enum?: string[];
  required?: boolean;
  items?: ValidationSchema;
  properties?: Record<string, SchemaProperty>;
  minimum?: number;
}

interface ValidationSchema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

// Validation schemas for different requests
const schemas = {
  register: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 30,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 100
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 100
      }
    },
    required: ['username', 'email', 'password']
  } as ValidationSchema,

  login: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
      },
      username: {
        type: 'string',
      },
      password: {
        type: 'string',
        minLength: 8
      }
    },
    required: ['password']
  } as ValidationSchema,

  profile: {
    type: 'object',
    properties: {
      subjects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            subjectCode: { type: 'string' },
            level: { type: 'string', enum: ['AS', 'A2'] },
            overallTarget: { type: 'string', enum: ['A*', 'A', 'B', 'C', 'D', 'E'] },
            units: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  unitCode: { type: 'string' },
                  planned: { type: 'boolean' },
                  completed: { type: 'boolean' },
                  targetGrade: { type: 'string', enum: ['A*', 'A', 'B', 'C', 'D', 'E'] },
                  examSession: { type: 'string' }
                }
              }
            }
          }
        }
      },
      studyPreferences: {
        type: 'object',
        properties: {
          dailyStudyHours: { type: 'number', minimum: 0 },
          preferredStudyTime: { type: 'string', enum: ['morning', 'afternoon', 'evening', 'night'] },
          notifications: { type: 'boolean' }
        }
      }
    }
  } as ValidationSchema
};

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate string field
 */
function validateStringField(
  value: string,
  field: string,
  rules: SchemaProperty
): void {
  if (rules.minLength && value.length < rules.minLength) {
    throw new AuthError('INVALID_CREDENTIALS', `${field} must be at least ${rules.minLength} characters`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    throw new AuthError('INVALID_CREDENTIALS', `${field} must be no more than ${rules.maxLength} characters`);
  }

  if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
    throw new AuthError('INVALID_CREDENTIALS', `Invalid ${field} format`);
  }

  if (rules.format === 'email' && !validateEmail(value)) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email format');
  }

  if (rules.enum && !rules.enum.includes(value)) {
    throw new AuthError('INVALID_CREDENTIALS', `${field} must be one of: ${rules.enum.join(', ')}`);
  }
}

/**
 * Validate registration data
 */
export function validateRegister(data: RegisterData): void {
  const schema = schemas.register;

  // Check required fields
  for (const field of schema.required || []) {
    if (!data[field as keyof RegisterData]) {
      throw new AuthError('INVALID_CREDENTIALS', `Missing required field: ${field}`);
    }
  }

  // Validate each field
  for (const [field, rules] of Object.entries(schema.properties)) {
    const value = data[field as keyof RegisterData];
    if (typeof value === 'string') {
      validateStringField(value, field, rules);
    }
  }
}

/**
 * Validate login credentials
 */
export function validateLogin(data: LoginCredentials): void {
  const schema = schemas.login;

  // Check required fields
  if (!data.password) {
    throw new AuthError('INVALID_CREDENTIALS', 'Password is required');
  }

  if (!data.email && !data.username) {
    throw new AuthError('INVALID_CREDENTIALS', 'Email or username is required');
  }

  // Validate each field
  for (const [field, rules] of Object.entries(schema.properties)) {
    const value = data[field as keyof LoginCredentials];
    if (typeof value === 'string') {
      validateStringField(value, field, rules);
    }
  }
}

/**
 * Validate profile data
 */
export function validateProfile(data: Partial<UserProfile>): void {
  if (data.subjects) {
    // Validate subjects
    for (const subject of data.subjects) {
      if (!subject.subjectCode) {
        throw new AuthError('INVALID_CREDENTIALS', 'Subject code is required');
      }

      if (!['AS', 'A2'].includes(subject.level)) {
        throw new AuthError('INVALID_CREDENTIALS', 'Invalid subject level');
      }

      if (subject.units) {
        // Validate units
        for (const unit of subject.units) {
          if (!unit.unitCode) {
            throw new AuthError('INVALID_CREDENTIALS', 'Unit code is required');
          }

          if (typeof unit.planned !== 'boolean' || typeof unit.completed !== 'boolean') {
            throw new AuthError('INVALID_CREDENTIALS', 'Invalid unit status');
          }

          if (!['A*', 'A', 'B', 'C', 'D', 'E'].includes(unit.targetGrade)) {
            throw new AuthError('INVALID_CREDENTIALS', 'Invalid target grade');
          }
        }
      }
    }
  }

  if (data.studyPreferences) {
    const prefs = data.studyPreferences;
    
    if (prefs.dailyStudyHours !== undefined && 
        (typeof prefs.dailyStudyHours !== 'number' || prefs.dailyStudyHours < 0)) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid daily study hours');
    }

    if (prefs.preferredStudyTime &&
        !['morning', 'afternoon', 'evening', 'night'].includes(prefs.preferredStudyTime)) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid preferred study time');
    }

    if (prefs.notifications !== undefined && typeof prefs.notifications !== 'boolean') {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid notifications setting');
    }
  }
}

/**
 * Generic request validation
 */
export function validateRequest(
  data: any,
  schema: ValidationSchema,
  path: string = ''
): void {
  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined) {
        throw new AuthError(
          'INVALID_CREDENTIALS',
          `Missing required field: ${path ? `${path}.${field}` : field}`
        );
      }
    }
  }

  for (const [field, rules] of Object.entries(schema.properties)) {
    const value = data[field];
    const fieldPath = path ? `${path}.${field}` : field;

    if (value === undefined) continue;

    if (rules.type === 'string') {
      validateStringField(value, fieldPath, rules);
    } else if (rules.type === 'array' && rules.items) {
      if (!Array.isArray(value)) {
        throw new AuthError('INVALID_CREDENTIALS', `${fieldPath} must be an array`);
      }
      value.forEach((item, index) => {
        validateRequest(item, rules.items!, `${fieldPath}[${index}]`);
      });
    } else if (rules.type === 'object' && rules.properties) {
      validateRequest(value, { type: 'object', properties: rules.properties }, fieldPath);
    }
  }
}