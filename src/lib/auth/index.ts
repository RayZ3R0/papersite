export * from './jwt';
export * from './cookies';
export * from './validation';
export * from '../authTypes';
export * from './tokens';

import { User } from '@/models/User';
import { AuthError, LoginCredentials, RegisterData } from '../authTypes';
import { signAccessToken, signRefreshToken, verifyToken } from './jwt';
import { AuthCookieManager } from './cookies';
import { validateLoginCredentials, validateRegisterData, verifyUserStatus } from './validation';
import { sendVerificationEmail } from './tokens';

export async function refreshUserToken(refreshToken: string) {
  try {
    // Verify the refresh token
    const payload = await verifyToken(refreshToken);
    if (!payload) {
      throw new AuthError('INVALID_TOKEN', 'Invalid refresh token');
    }

    // Find user by refresh token
    const user = await User.findOne({ 'refreshToken.token': refreshToken });
    if (!user) {
      throw new AuthError('INVALID_TOKEN', 'Invalid refresh token');
    }

    // Check token expiry
    if (!user.refreshToken?.expiresAt || user.refreshToken.expiresAt < new Date()) {
      throw new AuthError('INVALID_TOKEN', 'Refresh token expired');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const [accessToken, newRefreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    // Update refresh token
    user.refreshToken = {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    await user.save();

    // Set new cookies
    AuthCookieManager.setTokens(accessToken, newRefreshToken);

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
      }
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new AuthError('INVALID_TOKEN', 'Failed to refresh token');
  }
}

// Core authentication functions
export async function loginUser({ email, username, password, options }: LoginCredentials) {
  try {
    // Validate input
    validateLoginCredentials({ email, username, password });

    // Find user by email or username
    const query = email ? { email } : { username };
    const user = await User.findOne(query).select('+password');
    
    if (!user) {
      throw new AuthError('USER_NOT_FOUND', 'Invalid credentials');
    }

    await verifyUserStatus(user);

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    // Store refresh token with optional custom duration
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + (options?.sessionDuration || 24 * 60 * 60) // Default 24 hours
    );

    user.refreshToken = {
      token: refreshToken,
      expiresAt,
    };
    await user.save();

    // Set cookies with optional duration
    AuthCookieManager.setTokens(accessToken, refreshToken);

    // Update last login
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { lastLogin: new Date() },
        $inc: { loginCount: 1 }
      }
    );

    // Return user without sensitive data
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
      }
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Login error:', error);
    throw new AuthError('SERVER_ERROR', 'An error occurred during login');
  }
}

export async function registerUser(data: RegisterData) {
  try {
    // Validate input
    validateRegisterData(data);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: data.email },
        { username: data.username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AuthError('INVALID_CREDENTIALS', 'Email already in use');
      }
      throw new AuthError('INVALID_CREDENTIALS', 'Username already taken');
    }

    // Create user
    const user = new User(data);
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user._id.toString());
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error here, just log it - we still want to create the account
    }

    // Log user in
    return loginUser({
      email: data.email,
      password: data.password,
      options: { sessionDuration: 24 * 60 * 60 } // 24 hours for new registrations
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Registration error:', error);
    throw new AuthError('SERVER_ERROR', 'An error occurred during registration');
  }
}

export async function logoutUser() {
  try {
    const { refreshToken } = AuthCookieManager.getTokens();
    
    if (refreshToken) {
      // Find and update user
      await User.updateOne(
        { 'refreshToken.token': refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }

    // Clear cookies
    AuthCookieManager.clearTokens();
  } catch (error) {
    console.error('Logout error:', error);
    throw new AuthError('SERVER_ERROR', 'An error occurred during logout');
  }
}