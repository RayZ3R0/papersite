# Testing the Authentication System

## Prerequisites

1. Set up environment variables in `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
NEXT_PUBLIC_URL=http://localhost:3000
```

## Setup Steps

1. **Start MongoDB**

   - Make sure your MongoDB instance is running
   - The connection string should point to a database where you want to store users

2. **Create First Admin User**

   - You can use the following API endpoint to create the first admin user:

   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"your_secure_password","role":"admin"}'
   ```

3. **Start the Development Server**
   ```bash
   pnpm dev
   ```

## Testing the System

1. Visit the test page at: `http://localhost:3000/auth-test`

2. Test the following flows:

   ### User Registration

   - Click "Login" button
   - Switch to "Create Account" tab
   - Fill in registration form
   - Submit and verify successful registration

   ### User Login

   - Click "Login" button
   - Enter credentials
   - Verify successful login
   - Check that user info is displayed
   - Test logout functionality

   ### Protected Content

   - When logged out:

     - Verify that protected content is hidden
     - Check that appropriate messages are shown

   - When logged in as regular user:

     - Verify access to user-level content
     - Verify no access to moderator/admin content

   - When logged in as admin:
     - Verify access to all content levels

   ### Token Refresh

   - Login and stay on the page
   - Wait for access token to expire (1 hour)
   - Perform an action
   - Verify that token refresh occurs automatically

## Expected Behavior

1. **Public Content**

   - Always visible to everyone

2. **User Content**

   - Visible only to logged-in users
   - Login prompt shown to anonymous users

3. **Moderator Content**

   - Visible to moderators and admins
   - Fallback message shown to regular users

4. **Admin Content**

   - Visible only to admins
   - Fallback message shown to all other users

5. **Authentication State**
   - Persists across page refreshes
   - Clears properly on logout
   - Refreshes automatically when needed

## Common Issues

1. **MongoDB Connection**

   - Verify MongoDB URI is correct
   - Check MongoDB service is running
   - Ensure network connectivity

2. **JWT Issues**

   - Verify JWT_SECRET is set
   - Check token expiration times
   - Clear cookies if testing changes

3. **CORS Issues**
   - Only relevant if testing across domains
   - API routes should work on same domain

## Next Steps

After verifying the authentication system works:

1. Integrate with Forum

   - Update forum posts to require auth
   - Add user info to posts
   - Implement moderation features

2. Add Notes Integration

   - Protect note saving
   - Add user-specific notes

3. Implement Annotations
   - Add auth to annotation storage
   - Enable personal annotations
