# Authentication Flow Improvements

## Overview

The current authentication system will be enhanced with:

1. Dedicated login/register pages replacing the modal
2. Multi-step registration with subject preferences
3. New user profile management
4. Improved forum integration

## Current Implementation

- Login/register via modal in forum page
- Basic fields: username, password (email optional)
- No subject preferences system
- No dedicated profile management

## Planned Improvements

### Phase 1: Forum Integration & Navigation

- Remove login modal from forum
- Add subtle login/register buttons in forum header
- Implement smooth navigation transition to auth pages
- Preserve return URL functionality

### Phase 2: Login Page Enhancement

- Create dedicated `/auth/login` page
  - Email field (now required)
  - Username field
  - Password field
  - Remember me option
  - Forgot password link
- Improved validation and error handling
- Modern, responsive design

### Phase 3: Multi-step Registration

1. Step 1: Basic Information

   - Username
   - Email (required)
   - Password
   - Confirm password

2. Step 2: Academic Preferences

   - Subject selection (multi-select)
   - Session/Year selection
   - Study level
   - Optional: Areas of interest

3. Step 3: Profile Setup
   - Optional display name
   - Avatar/profile picture
   - Bio/description
   - Social links

### Phase 4: Profile Management

- Dedicated profile page with sections:
  1. Personal Information
     - Name
     - Email
     - Username
     - Password change
  2. Academic Details
     - Selected subjects
     - Session/Year
     - Study preferences
  3. Profile Customization
     - Avatar
     - Bio
     - Social links
  4. Account Settings
     - Notification preferences
     - Privacy settings
     - Account deletion

### Phase 5: Database Updates

- User model extensions:
  ```typescript
  interface IUser {
    // Existing fields
    username: string;
    password: string;
    email: string;
    role: string;

    // New fields
    displayName?: string;
    avatar?: string;
    bio?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
    };
    academicPreferences?: {
      subjects: string[];
      session: string;
      studyLevel: string;
      interests?: string[];
    };
    settings?: {
      notifications: boolean;
      privacy: {
        showEmail: boolean;
        showSubjects: boolean;
      };
    };
  }
  ```

## Implementation Phases

### Phase 1: Forum Integration (1-2 days)

1. Remove login modal
2. Add header navigation
3. Test return URL functionality

### Phase 2: Login Page (2-3 days)

1. Create page layout
2. Implement form validation
3. Add email requirement
4. Test auth flow

### Phase 3: Registration Flow (3-4 days)

1. Create step 1 layout
2. Implement subject selection
3. Add profile setup
4. Test full flow

### Phase 4: Profile System (3-4 days)

1. Create profile layout
2. Implement settings
3. Add image upload
4. Test updates

### Phase 5: Database Migration (2-3 days)

1. Update schemas
2. Add migrations
3. Test data integrity

## Testing Checkpoints

Each phase should be tested independently:

1. Forum Integration

   - Header buttons visible
   - Navigation works
   - Return URL preserved

2. Login Page

   - Form validation
   - Error handling
   - Email requirement
   - Auth success

3. Registration

   - Step navigation
   - Data preservation
   - Subject selection
   - Profile creation

4. Profile Management

   - Data display
   - Updates work
   - Image upload
   - Settings save

5. Database
   - Migration success
   - Data integrity
   - Query performance

## Next Steps

1. Review this plan
2. Approve phases
3. Begin implementation with Phase 1
4. Test each component
5. Regular progress check
