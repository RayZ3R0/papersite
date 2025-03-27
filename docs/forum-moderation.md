# Forum Moderation & Anti-Abuse System

## Overview

A lightweight moderation system combining IP tracking, user identity verification, and admin capabilities.

## User Identity Components

### IP Tracking

- Store IP address with each post and reply
- Use IP + username combination for edit/delete verification
- Rate limiting based on IP address

### User Identity Storage

```typescript
interface UserIdentity {
  name: string;
  id: string;
  ip: string;
  lastAction: Date;
}
```

## Admin System

### Admin Authentication

- Environment variable `ADMIN_TOKEN` for admin access
- Admin header `X-Admin-Token` for API requests
- Keep token secure in Vercel environment variables

### Admin Capabilities

- Delete any post or reply
- View IP addresses
- Ban IPs/usernames
- Override rate limits

## Anti-Abuse Measures

### Rate Limiting

- 5 posts per hour per IP
- 20 replies per hour per IP
- Cooldown period between posts (2 minutes)

### Content Filtering

- Basic profanity filter
- Link limiting (max 3 per post)
- Maximum content length enforcement
- Minimum content length requirement

### User Restrictions

- User can only edit/delete their own content
- Must match original IP and username
- 15-minute edit window for posts/replies
- Cannot create similar posts within 1 hour

## Implementation Details

### Database Updates

```typescript
// Post Schema Addition
{
  ip: String,
  editedAt: Date,
  editCount: Number,
  lastEditWindow: Date
}

// Reply Schema Addition
{
  ip: String,
  editedAt: Date
}
```

### API Routes

```typescript
// Admin routes
DELETE /api/forum/admin/posts/:id
DELETE /api/forum/admin/replies/:id
POST /api/forum/admin/ban

// User routes with verification
PUT /api/forum/posts/:id    // Edit post
DELETE /api/forum/posts/:id  // Delete post
PUT /api/forum/replies/:id   // Edit reply
DELETE /api/forum/replies/:id // Delete reply
```

### Rate Limiting Implementation

1. Use Redis or similar for rate limit tracking
2. Fallback to in-memory storage for simpler setup
3. Track limits by IP + action type
4. Reset counters on fixed intervals

### Security Considerations

- Store IP addresses securely
- Don't expose IP addresses to clients
- Validate all user input
- Sanitize content before storage
- Log all moderation actions

## Usage Examples

### Admin Deletion

```typescript
// Admin API call
const response = await fetch(`/api/forum/posts/${postId}`, {
  method: "DELETE",
  headers: {
    "X-Admin-Token": process.env.ADMIN_TOKEN,
  },
});
```

### User Edit Verification

```typescript
// Check user permissions
const canEdit =
  post.authorId === userId &&
  post.authorName === userName &&
  post.ip === userIp &&
  isWithinEditWindow(post.createdAt);
```
