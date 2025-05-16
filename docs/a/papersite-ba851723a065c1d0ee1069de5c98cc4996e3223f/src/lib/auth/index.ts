import { User } from '@/models/User';
import { AuthError, LoginCredentials, RegisterData, UserRole, UserWithoutPassword, JWTPayload } from '../authTypes';
import { signAccessToken, signRefreshToken, verifyToken } from './jwt';
import { AuthCookieManager } from './cookies';
import { validateLoginCredentials, validateRegisterData, verifyUserStatus } from './validation';
import { sendVerificationEmail } from './tokens';
import { clearAuthTokens } from './edge';

// Re-export for backward compatibility
export * from './jwt';
export * from './cookies';
export * from './validation';
export * from '../authTypes';
export * from './tokens';
export * from './edge';

/**
 * Handle user token refresh
 */
export async function refreshUserToken(refreshToken?: string, forceRefresh: boolean = false) {
  try {
    // Get tokens from cookies
    const tokens = AuthCookieManager.getTokens();
    const currentRefreshToken = refreshToken || tokens.refreshToken;
    const currentAccessToken = tokens.accessToken;
      
    // If no refresh token, we can't continue
    if (!currentRefreshToken) {
      throw new AuthError('INVALID_TOKEN', 'No refresh token available');
    }

    let payload: JWTPayload;

    // Check access token if available and not forcing refresh
    if (currentAccessToken && !forceRefresh) {
      try {
        const tokenData = await verifyToken(currentAccessToken);
        // Check if token is still valid and not close to expiry
        const expiryThreshold = Date.now() + 5 * 60 * 1000; // 5 minutes
        if (tokenData.exp && tokenData.exp * 1000 > expiryThreshold) {
          // Token is still valid and not close to expiry
          return { user: await getUserFromToken(tokenData) };
        }
      } catch (error) {
        // Access token is invalid or expired, continue with refresh
      }
    }

    // At this point, either access token is invalid or we're forcing refresh
    if (!currentRefreshToken) {
      throw new AuthError('INVALID_TOKEN', 'No refresh token available');
    }

    try {
      payload = await verifyToken(currentRefreshToken);
    } catch (error) {
      throw new AuthError('INVALID_TOKEN', 'Invalid or expired refresh token');
    }

    if (!payload) {
      throw new AuthError('INVALID_TOKEN', 'Invalid refresh token');
    }

    // Find user by refresh token or user ID (more robust)
    const user = await User.findOne({
      $or: [
        { 'refreshToken.token': refreshToken },
        { _id: payload.userId }  // This helps if the token in DB doesn't match exactly
      ]
    });
    
    if (!user) {
      throw new AuthError('INVALID_TOKEN', 'Invalid refresh token');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    // Update refresh token with MUCH longer expiry
    user.refreshToken = {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
    await user.save();

    // Set new cookies with remember me always true for better persistence
    AuthCookieManager.setTokens(newAccessToken, newRefreshToken, true);

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

/**
 * Handle user login
 */
export async function loginUser({ email, username, password, options }: LoginCredentials) {
  try {
    // Clear any existing session first
    AuthCookieManager.clearTokens();

    // Validate input
    validateLoginCredentials({ email, username, password });

    // Find user by email or username
    const query = email ? { email } : { username };
    const user = await User.findOne(query).select('+password');
    
    if (!user) {
      throw new AuthError('USER_NOT_FOUND', 'Invalid credentials');
    }

    await verifyUserStatus(user);

    // Clear any existing refresh tokens for this user
    await User.updateOne(
      { _id: user._id },
      { $unset: { refreshToken: 1 } }
    );

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

    // Store refresh token with much longer duration by default
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + (options?.sessionDuration || 30 * 24 * 60 * 60) // Default 30 days
    );

    user.refreshToken = {
      token: refreshToken,
      expiresAt,
    };
    await user.save();

    // Always set cookies with remember me enabled for better persistence
    AuthCookieManager.setTokens(accessToken, refreshToken, true);

    // Update last login
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { lastLogin: new Date() },
        $inc: { loginCount: 1 }
      }
    );

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

/**
 * Handle user registration
 */
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

    // Log user in with 30 day session
    return loginUser({
      email: data.email,
      password: data.password,
      options: { sessionDuration: 30 * 24 * 60 * 60 } // 30 days
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Registration error:', error);
    throw new AuthError('SERVER_ERROR', 'An error occurred during registration');
  }
}

/**
 * Handle user token verification and data fetch
 */
async function getUserFromToken(tokenData: JWTPayload): Promise<UserWithoutPassword> {
  const user = await User.findById(tokenData.userId);
  if (!user) {
    throw new AuthError('USER_NOT_FOUND', 'User not found');
  }
  
  // Handle type conversions for MongoDB types
  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email || '', // Provide default empty string for optional email
    role: user.role,
    verified: user.verified,
    createdAt: user.createdAt.toISOString() // Convert Date to ISO string
  };
}

/**
 * Handle user logout
 * Split into Edge-compatible cookie clearing and optional DB cleanup
 */
export async function logoutUser() {
  // First clear cookies (Edge-compatible)
  clearAuthTokens();
  
  try {
    // If we can access the database, clean up refresh tokens
    const { refreshToken } = AuthCookieManager.getTokens();
    
    if (refreshToken) {
      await User.updateMany(
        { 'refreshToken.token': refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }
  } catch (error) {
    // Log but don't fail if DB cleanup fails
    console.error('DB cleanup error during logout:', error);
  }
}