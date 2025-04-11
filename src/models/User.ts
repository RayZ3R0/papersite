import mongoose, { Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ExamSession } from '@/lib/data/subjects';

interface UserSubjectConfig {
  subjectCode: string;
  level: 'AS' | 'A2';
  units: {
    unitCode: string;
    planned: boolean;
    completed: boolean;
    targetGrade: 'A*' | 'A' | 'B' | 'C' | 'D' | 'E';
    examSession: string;
    actualGrade?: string;
  }[];
  overallTarget: 'A*' | 'A' | 'B' | 'C' | 'D' | 'E';
}

interface StudyPreferences {
  dailyStudyHours?: number;
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  notifications?: boolean;
}

export interface IUser {
  username: string;
  password: string;
  role: 'user' | 'moderator' | 'admin';
  banned: boolean;
  createdAt: Date;
  lastLogin: Date;
  
  // Auth tokens and expiry
  refreshToken?: {
    token: string;
    expiresAt: Date;
  };
  email?: string;
  verified: boolean;

  // Email verification
  verificationToken?: string;
  verificationTokenExpires?: Date;
  verificationSessionId?: string;
  verificationAttempts?: number;

  // Password reset
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  resetPasswordSessionId?: string;
  resetPasswordAttempts?: number;

  // Security tracking
  lastPasswordChange?: Date;
  passwordHistory?: string[];
  loginAttempts?: number;
  lockoutUntil?: Date;

  // User data
  subjects?: UserSubjectConfig[];
  currentSession?: ExamSession;
  studyPreferences?: StudyPreferences;
}

// Define methods interface
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
}

// Create model type
export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  // Basic info
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password by default
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  banned: {
    type: Boolean,
    default: false
  },

  // Email and verification
  email: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  verified: {
    type: Boolean,
    default: false
  },

  // Verification fields
  verificationToken: String,
  verificationTokenExpires: Date,
  verificationSessionId: String,
  verificationAttempts: {
    type: Number,
    default: 0
  },

  // Password reset fields
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date,
  resetPasswordSessionId: String,
  resetPasswordAttempts: {
    type: Number,
    default: 0
  },

  // Security tracking
  lastPasswordChange: Date,
  passwordHistory: [String],
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockoutUntil: Date,

  // Session management
  refreshToken: {
    token: String,
    expiresAt: Date
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },

  // Subject tracking fields
  subjects: [{
    subjectCode: String,
    level: {
      type: String,
      enum: ['AS', 'A2']
    },
    units: [{
      unitCode: String,
      planned: Boolean,
      completed: Boolean,
      targetGrade: {
        type: String,
        enum: ['A*', 'A', 'B', 'C', 'D', 'E']
      },
      examSession: String,
      actualGrade: String
    }],
    overallTarget: {
      type: String,
      enum: ['A*', 'A', 'B', 'C', 'D', 'E']
    }
  }],
  currentSession: String,
  studyPreferences: {
    dailyStudyHours: Number,
    preferredStudyTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    notifications: Boolean
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = async function(): Promise<void> {
  this.lastLogin = new Date();
  await this.save();
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

// Helper function to initialize model
const initializeModel = () => {
  try {
    return mongoose.models.User || mongoose.model<IUser, UserModel>('User', userSchema);
  } catch (error: any) { // Type assertion for mongoose error
    // If model compilation fails, return existing model
    if (error?.name === 'OverwriteModelError') {
      return mongoose.model<IUser, UserModel>('User');
    }
    throw error;
  }
};

// Create model
export const User = initializeModel() as UserModel;

// Ensure model is exported properly for Edge Runtime
export default User;