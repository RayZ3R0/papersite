# Forum Moderation System

## Role-Based Access Control

The forum uses a three-tier role system:

1. **User** (Basic)

   - Can create posts and replies
   - Can edit/delete their own content
   - Cannot moderate other users' content

2. **Moderator**

   - All user permissions
   - Can lock/unlock posts
   - Can edit any post or reply
   - Can delete inappropriate replies
   - Cannot delete posts (admin only)

3. **Admin**
   - All moderator permissions
   - Can pin/unpin posts
   - Can delete any post or reply
   - Can manage user roles

## Moderation Features

### Post Management

- **Pinning**: Admin-only feature to pin important posts to the top
- **Locking**: Moderators and admins can lock posts to prevent new replies
- **Deletion**: Admins can delete posts, users can delete their own

### Reply Management

- **Editing**: Users can edit their own replies, moderators can edit any reply
- **Deletion**: Users can delete their own replies, moderators and admins can delete any reply

### User Content Controls

- Post authors can edit/delete their own posts
- Reply authors can edit/delete their own replies
- Content history tracks edits with timestamps

## Implementation Details

### Auth Integration

```typescript
// Check user permissions
canPerformAction("pin", user, authorId, "post"); // Admin only
canPerformAction("lock", user, authorId, "post"); // Mod and Admin
canPerformAction("delete", user, authorId, "post"); // Author and Admin
```

### UI Components

- `UserActionMenu`: Context menu for post/reply actions
- `AdminControls`: Dedicated moderation controls
- `PostContent`: Displays post with moderation status
- `ReplyContent`: Displays reply with moderation options

### Protected Routes

All moderation actions are protected at both UI and API levels:

```typescript
// UI Protection
<ProtectedContent roles={["moderator", "admin"]}>
  <ModeratorControls />
</ProtectedContent>;

// API Protection
await requireRole(["admin"]); // Admin-only endpoints
await requireRole(["moderator", "admin"]); // Mod+ endpoints
```

## Usage Examples

### Pinning a Post (Admin)

```typescript
await fetch(`/api/forum/posts/${postId}`, {
  method: "PATCH",
  body: JSON.stringify({ isPinned: true }),
});
```

### Locking a Post (Moderator)

```typescript
await fetch(`/api/forum/posts/${postId}`, {
  method: "PATCH",
  body: JSON.stringify({ isLocked: true }),
});
```

### Deleting Content

```typescript
// Delete post (Admin or author)
await fetch(`/api/forum/posts/${postId}`, {
  method: "DELETE",
});

// Delete reply (Admin, moderator, or author)
await fetch(`/api/forum/replies/${replyId}`, {
  method: "DELETE",
});
```

## Best Practices

1. **Deletion Policy**

   - Soft delete for user content when possible
   - Hard delete for spam or harmful content
   - Maintain deletion logs

2. **Lock vs Delete**

   - Lock posts for archival or cooling down discussions
   - Delete only for serious violations

3. **Moderation Actions**
   - Log all moderation actions
   - Provide reason for moderation when possible
   - Use consistent enforcement of rules

## Future Improvements

1. **Reporting System**

   - User content reporting
   - Report management interface
   - Automated content flagging

2. **Enhanced Moderation Tools**

   - Batch moderation actions
   - Temporary post/user suspension
   - Moderation action history

3. **User Management**
   - Warning system
   - Temporary bans
   - User reputation system
