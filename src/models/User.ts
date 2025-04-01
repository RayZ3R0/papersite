import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/lib/auth/jwt';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
  createdAt: Date;
  lastLogin?: Date;
  banned: boolean;
  verified: boolean;
  // Academic info
  subjects?: string[];
  session?: string;
  institution?: string;
  studyGoals?: string;
  // Preferences
  notifications?: boolean;
  studyReminders?: boolean;
  // Additional fields
  profilePicture?: string;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
  toSafeObject(): Partial<IUser>;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot be longer than 30 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores']
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user'
    },
    refreshToken: {
      type: String,
      select: false // Don't include refresh token in queries by default
    },
    lastLogin: {
      type: Date
    },
    banned: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    // Academic info
    subjects: {
      type: [String],
      default: []
    },
    session: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    studyGoals: {
      type: String,
      trim: true
    },
    // Preferences
    notifications: {
      type: Boolean,
      default: true
    },
    studyReminders: {
      type: Boolean,
      default: true
    },
    // Additional fields
    profilePicture: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update lastLogin
userSchema.methods.updateLastLogin = async function(): Promise<void> {
  this.lastLogin = new Date();
  await this.save();
};

// Instance method to generate safe user object (without sensitive data)
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  const safeObj = { ...obj };
  // Type-safe way to remove sensitive fields
  if ('password' in safeObj) delete (safeObj as any).password;
  if ('refreshToken' in safeObj) delete (safeObj as any).refreshToken;
  if ('__v' in safeObj) delete (safeObj as any).__v;
  return safeObj;
};

// Create indexes for non-unique fields
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's posts
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// Virtual for user's replies
userSchema.virtual('replies', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'author'
});

export const User = mongoose.models.User as UserModel || 
  mongoose.model<IUser, UserModel>('User', userSchema);