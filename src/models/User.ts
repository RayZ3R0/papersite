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
  refreshToken?: {
    token: string;
    expiresAt: Date;
  };
  email?: string;
  verified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  // New fields for subject tracking
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
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
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
  },
  password: {
    type: String,
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  refreshToken: {
    token: String,
    expiresAt: Date
  },
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
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date
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

// Create model
export const User = (mongoose.models.User || mongoose.model<IUser, UserModel>('User', userSchema)) as UserModel;

export default User;