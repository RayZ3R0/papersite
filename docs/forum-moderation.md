# Forum Moderation & Anti-Abuse System

## Overview

A lightweight moderation system combining IP tracking, user identity verification, and admin capabilities.

## Setup Instructions

### Admin Token

1. Set the `ADMIN_TOKEN` environment variable in your .env file:

```bash
ADMIN_TOKEN=your-secure-token-here
```

2. To enable admin controls in the browser, open the browser console and run:

```javascript
localStorage.setItem("forum_admin_token", "your-secure-token-here");
```

3. To disable admin access:

```javascript
localStorage.removeItem("forum_admin_token");
```

### Rate Limiting

The system includes built-in rate limiting:

- 5 posts per hour per IP
- 20 replies per hour per IP
- 15-minute window for self-deletion
- Cooldown period between posts (2 minutes)

## Security Features

### IP Tracking

- IP addresses are stored securely and never exposed to clients
- IP + username combination required for content modification
- Rate limiting based on IP addresses

### Content Moderation

- Basic profanity filter and content sanitization
- Link limiting
- Maximum content length enforcement
- Minimum content length requirement

### User Verification

- Users can only edit/delete their own content
- Must match original IP and username
- 15-minute edit/delete window
- Cannot create similar posts within 1 hour

## Admin Capabilities

### Content Management

- Delete any post or reply
- View moderation logs
- Override rate limits
- Access to IP information

### API Endpoints

- `DELETE /api/forum/admin?postId=[id]` - Delete a post
- `PATCH /api/forum/admin?replyId=[id]` - Delete a reply

### Security Headers

All admin requests must include:

```
X-Admin-Token: your-token-here
```

## User Self-Management

### Time Windows

- Posts can be deleted within 15 minutes of creation
- Replies can be deleted within 15 minutes of creation
- Rate limits reset hourly

### IP Verification

- Actions require matching IP address
- Username must match original poster
- Automatic cleanup of expired sessions

## Technical Implementation

### Models

Both Post and Reply models include:

- IP address (hidden from queries)
- Creation timestamp
- Edit history
- User verification data

### Middleware

- Rate limiting
- IP tracking
- Admin token verification
- Request sanitization

### Error Handling

- Clear user feedback
- Secure error messages
- Detailed admin logging
- Rate limit notifications

## Production Considerations

### Scaling

- Replace in-memory rate limiting with Redis
- Add request caching
- Implement database indexing

### Security

- Use secure environment variables
- Regularly rotate admin tokens
- Monitor for abuse patterns
- Implement IP ban system if needed

### Maintenance

- Regular cleanup of old data
- Monitor system performance
- Update security measures
- Maintain moderation logs
