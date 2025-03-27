# Forum Implementation Plan

## Overview

A lightweight forum system using MongoDB Atlas, with local storage for user identity and tag-based organization.

## 1. Database Setup (MongoDB Atlas)

### 1.1. Initial Setup

- Create MongoDB Atlas account
- Create free tier cluster
- Set up network access (IP whitelist)
- Create database user
- Get connection string
- Add connection string to Vercel environment variables

### 1.2. Data Models

```typescript
// Post Schema
interface ForumPost {
  _id: ObjectId;
  title: string;
  content: string;
  authorName: string;
  authorId: string; // Stored in localStorage
  tags: string[]; // Subject/unit tags
  replyCount: number; // For quick access
  createdAt: Date;
  updatedAt: Date;
}

// Reply Schema
interface PostReply {
  _id: ObjectId;
  postId: ObjectId; // Reference to parent post
  content: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
}
```

## 2. Project Structure

```
src/
├── app/
│   └── forum/
│       ├── page.tsx              # Main forum page
│       ├── [postId]/
│       │   └── page.tsx         # Single post view
│       └── new/
│           └── page.tsx         # New post page
├── components/
│   └── forum/
│       ├── PostCard.tsx         # Post preview card
│       ├── PostList.tsx         # List of posts
│       ├── PostForm.tsx         # New post form
│       ├── ReplyList.tsx        # List of replies
│       ├── ReplyForm.tsx        # New reply form
│       └── TagSelector.tsx      # Tag selection component
├── lib/
│   ├── mongodb.ts              # Database connection
│   └── forum/
│       ├── posts.ts            # Post-related functions
│       └── replies.ts          # Reply-related functions
├── types/
│   └── forum.d.ts             # Type definitions
└── hooks/
    └── useForumIdentity.ts    # User identity management
```

## 3. Implementation Steps

### 3.1. Database Connection (First)

1. Install dependencies:

   ```bash
   pnpm add mongoose
   ```

2. Create MongoDB connection utility:

   ```typescript
   // src/lib/mongodb.ts
   import mongoose from "mongoose";

   const MONGODB_URI = process.env.MONGODB_URI!;
   let cached = global.mongoose;

   if (!cached) {
     cached = global.mongoose = { conn: null, promise: null };
   }

   export async function connectToDatabase() {
     if (cached.conn) return cached.conn;
     cached.promise = mongoose.connect(MONGODB_URI);
     cached.conn = await cached.promise;
     return cached.conn;
   }
   ```

### 3.2. Schema Definitions

Create the Mongoose schemas in `src/models/`:

```typescript
// src/models/Post.ts
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorId: { type: String, required: true },
  tags: [String],
  replyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

// src/models/Reply.ts
const ReplySchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Reply =
  mongoose.models.Reply || mongoose.model("Reply", ReplySchema);
```

### 3.3. API Implementation

1. Create API routes with rate limiting:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Only apply to forum API routes
  if (!request.nextUrl.pathname.startsWith("/api/forum")) {
    return NextResponse.next();
  }

  const ip = request.ip || "127.0.0.1";
  const limitKey = `ratelimit:${ip}`;

  // Implement rate limiting here
  // Add proper implementation later

  return NextResponse.next();
}

export const config = {
  matcher: "/api/forum/:path*",
};
```

2. Create API endpoints:

```typescript
// src/app/api/forum/posts/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const posts = await Post.find().sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const post = await Post.create(body);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
```

### 3.4. UI Components (Start after API)

1. User Identity Hook:

```typescript
// src/hooks/useForumIdentity.ts
import { useState, useEffect } from "react";

export function useForumIdentity() {
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("forum_username");
    const storedId = localStorage.getItem("forum_userid");

    if (storedName) setUserName(storedName);
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("forum_userid", newId);
      setUserId(newId);
    }
  }, []);

  const updateUserName = (name: string) => {
    localStorage.setItem("forum_username", name);
    setUserName(name);
  };

  return { userName, userId, updateUserName };
}
```

2. Forum Components:

```typescript
// src/components/forum/PostCard.tsx
// src/components/forum/PostList.tsx
// src/components/forum/PostForm.tsx
// Implement these next
```

## 4. Implementation Order

1. Database Setup

   - Set up MongoDB Atlas
   - Create connection utility
   - Define schemas

2. API Layer

   - Create API routes
   - Implement rate limiting
   - Add basic error handling

3. Core Components

   - User identity management
   - Post list and creation
   - Reply functionality

4. Enhancement Features

   - Tag system
   - Anti-abuse measures
   - Rich text support

5. Polish & Optimization
   - Loading states
   - Error handling
   - Performance optimization

## 5. Post-Implementation TODOs

- Add proper error handling
- Implement caching
- Add pagination
- Enhance security measures
- Add moderation tools
- Consider backup strategy
