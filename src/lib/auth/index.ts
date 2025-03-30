export * from './jwt';
export * from './cookies';
export * from './validation';
export * from '../authTypes';

import { User, IUser } from '@/models/User';
import { AuthError, LoginCredentials, RegisterData } from '../authTypes';
import { signAccessToken, signRefreshToken } from './jwt';
import { AuthCookieManager } from './cookies';
import { validateLoginCredentials, validateRegisterData, verifyUserStatus } from './validation';

// Core authentication functions
export async function loginUser({ username, password }: LoginCredentials) {
  try {
    // Validate input
    validateLoginCredentials({ username, password });

    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid username or password');
    }

    await verifyUserStatus(user);

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid username or password');
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

    // Store refresh token
    user.refreshToken = {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    await user.save();

    // Set cookies
    AuthCookieManager.setTokens(accessToken, refreshToken);

    // Update last login
    await user.updateLastLogin();

    return { user: user.toJSON() };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('SERVER_ERROR', 'An error occurred during login');
  }
}

export async function registerUser(data: RegisterData) {
  try {
    // Validate input
    validateRegisterData(data);

    // Create user
    const user = new User(data);
    await user.save();

    // Log user in
    return loginUser(data);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
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
    throw new AuthError('SERVER_ERROR', 'An error occurred during logout');
  }
}

export async function refreshUserToken(oldRefreshToken: string) {
  try {
    // Find user by refresh token
    const user = await User.findOne({ 'refreshToken.token': oldRefreshToken });
    
    if (!user) {
      throw new AuthError('INVALID_TOKEN', 'Invalid refresh token');
    }

    await verifyUserStatus(user);

    if (!user.refreshToken || user.refreshToken.expiresAt < new Date()) {
      throw new AuthError('INVALID_TOKEN', 'Refresh token expired');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    // Update refresh token
    user.refreshToken = {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    await user.save();

    // Set new cookies
    AuthCookieManager.setTokens(accessToken, refreshToken);

    return { user: user.toJSON() };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('SERVER_ERROR', 'An error occurred while refreshing token');
  }
}

// Helper to create admin user
export async function createAdminUser(adminData: {
  username: string;
  password: string;
  email?: string;
}) {
  const user = new User({
    ...adminData,
    role: 'admin',
    verified: true,
  });
  await user.save();
  return user;
}