# Registration System Testing Guide

## Phase 1 Testing

### Components to Test

1. Basic Info Form

   ```typescript
   test cases:
   - All fields empty -> show required errors
   - Invalid email format -> show email error
   - Password < 8 chars -> show length error
   - Passwords don't match -> show match error
   - Valid input -> allow submission
   ```

2. Password Strength Indicator

   ```typescript
   test cases:
   - Empty password -> no strength
   - Only lowercase -> very weak
   - Lower + Upper -> weak
   - Lower + Upper + Number -> fair
   - Lower + Upper + Number + Symbol -> strong
   - All + Length > 12 -> very strong
   ```

3. API Integration

   ```typescript
   test cases:
   - New valid user -> successful registration
   - Existing username -> show username taken error
   - Existing email -> show email taken error
   - Network error -> show connection error
   - Server error -> show generic error
   ```

4. UI/UX Flow
   ```typescript
   test cases:
   - Loading state visibility during submission
   - Error message display and styling
   - Success redirect to login
   - Success message on login page
   - Form field focus states
   - Password visibility toggle
   ```

### Test Steps

1. Form Validation

   - [ ] Open registration page
   - [ ] Submit empty form
   - [ ] Verify error messages for all fields
   - [ ] Enter invalid email
   - [ ] Verify email format error
   - [ ] Enter short password
   - [ ] Verify password length error
   - [ ] Enter mismatched passwords
   - [ ] Verify password match error

2. Success Flow

   - [ ] Enter valid username
   - [ ] Enter valid email
   - [ ] Enter valid password
   - [ ] Confirm password correctly
   - [ ] Submit form
   - [ ] Verify loading state
   - [ ] Verify redirect to login
   - [ ] Verify success message

3. Error Handling

   - [ ] Try registering existing username
   - [ ] Verify username taken error
   - [ ] Try registering existing email
   - [ ] Verify email taken error
   - [ ] Test offline state
   - [ ] Verify connection error message

4. Mobile Testing
   - [ ] Test on small screens
   - [ ] Verify responsive layout
   - [ ] Check input field usability
   - [ ] Verify error message visibility
   - [ ] Test touch interactions

### Known Issues

1. Current Limitations

   ```
   - No email verification yet
   - No password recovery flow
   - No social login options
   ```

2. Edge Cases to Consider
   ```
   - Browser back button behavior
   - Form state persistence
   - Multiple rapid submissions
   - Special characters in username
   ```

### Next Phase Requirements

Before moving to Phase 2:

- [ ] All Phase 1 tests passing
- [ ] Error handling complete
- [ ] Mobile testing complete
- [ ] Performance acceptable
- [ ] User feedback implemented

## Phase 2 Planning

(Subject selection implementation will start after Phase 1 is thoroughly tested)
