# PaperSite Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [Component Structure](#component-structure)
5. [Data Flow](#data-flow)
6. [Authentication System](#authentication-system)
7. [Theme System](#theme-system)
8. [Search System](#search-system)
9. [Forum System](#forum-system)
10. [Profile System](#profile-system)
11. [API Reference](#api-reference)
12. [Database Schema](#database-schema)
13. [Development Guidelines](#development-guidelines)

## Project Overview

PaperSite is a Next.js-based web application for managing and accessing educational resources. It provides features for:

- Past paper management and search
- Subject-based organization
- Forum discussions
- PDF annotation
- User profiles and preferences

### Tech Stack

- Frontend: Next.js 13+ (App Router)
- Backend: Next.js API Routes
- Database: MongoDB
- Authentication: JWT
- Styling: Tailwind CSS
- State Management: React Context + Custom Hooks

## Core Features

### Papers System

- Advanced search with filters
- Subject and unit categorization
- Paper code generation
- PDF viewing with annotations
- Version tracking
- Download management

### Books Section

- Digital library system
- Subject categorization
- Preview generation
- Download tracking
- Reading progress
- Bookmarking system

### Forum System

- Threaded discussions
- Rich text editing
- File attachments
- Moderation tools
- User reputation
- Topic categorization
- Search functionality
- Real-time updates

### Profile System

- User preferences
- Academic tracking
- Progress monitoring
- Study planning
- Unit configuration
- Achievement system

## Technical Architecture

### Frontend Architecture

- App Router based routing
- Server and Client Components
- Dynamic imports for code splitting
- React Server Components for static content
- Client Components for interactivity

### State Management

- Global auth state via Context
- Local component state with useState
- Complex state with useReducer
- Custom hooks for reusable logic
- Server state caching

### Performance Optimizations

- Image optimization
- Route prefetching
- Component lazy loading
- Optimistic updates
- Debounced searches
- Cached API responses

### Security Measures

- JWT token rotation
- CSRF protection
- Rate limiting
- Input sanitization
- Role-based access
- API route protection

## Component Structure

### Layout System

- Responsive grid system
- Theme-aware components
- Mobile-first approach
- Dynamic navigation
- Context providers

### Common Components

```typescript
// Button component example
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost";
  size: "sm" | "md" | "lg";
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Component Organization

```
components/
  ├── layout/           # Layout components
  ├── auth/            # Authentication UI
  ├── profile/         # Profile components
  ├── forum/           # Forum components
  ├── search/          # Search components
  ├── ui/              # Common UI components
  └── [feature]/       # Feature-specific components
```

## Data Flow

### Search Implementation

```typescript
// Search flow example
const searchFlow = {
  input: "User types query",
  debounce: "Wait 300ms",
  transition: "Start loading state",
  navigation: "Navigate to search page",
  results: "Display filtered results",
  filters: "Apply additional filters",
};
```

### State Updates

```typescript
// Example state update flow
interface StateUpdate<T> {
  optimistic: boolean;
  data: T;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

## Authentication System

### JWT Implementation

```typescript
interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### Auth Flow

1. User submits credentials
2. Server validates and generates tokens
3. Tokens stored in secure cookies
4. Client includes tokens in requests
5. Auto-refresh on expiration
6. Secure logout process

## Theme System

### Theme Configuration

```typescript
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    [key: string]: string;
  };
  spacing: Record<string, string>;
  typography: Typography;
}
```

### Theme Features

- Multiple theme support
- Real-time preview
- Custom theme creation
- CSS variable system
- Dark mode support
- Theme persistence

## Search System

### Search Components

```typescript
interface SearchProps {
  initialQuery?: string;
  filters?: SearchFilters;
  onResultsChange?: (results: SearchResult[]) => void;
}
```

### Search Features

- Auto-complete suggestions
- Advanced filtering
- Search history
- Recent searches
- Popular searches
- Search analytics

## Development Guidelines

### Component Creation

1. Create component file
2. Define TypeScript interfaces
3. Implement component logic
4. Add proper documentation
5. Include unit tests
6. Update component index

### Code Style

```typescript
// Component template
import { type FC } from "react";

interface Props {
  // Props interface
}

export const Component: FC<Props> = ({ prop1, prop2 }) => {
  // Implementation
};
```

### Testing Requirements

- Unit tests for utilities
- Component testing
- Integration tests
- E2E testing
- Coverage requirements
- Performance testing

## API Reference

### Authentication Endpoints

```typescript
interface AuthEndpoints {
  login: "/api/auth/login";
  register: "/api/auth/register";
  refresh: "/api/auth/refresh";
  logout: "/api/auth/logout";
}
```

### Profile Endpoints

```typescript
interface ProfileEndpoints {
  get: "/api/profile";
  update: "/api/profile";
  preferences: "/api/profile/preferences";
  subjects: "/api/profile/subjects";
}
```

## Database Schema

### Extended User Model

```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  role: "user" | "admin" | "moderator";
  subjects: Subject[];
  preferences: UserPreferences;
  stats: UserStats;
  achievements: Achievement[];
  createdAt: Date;
  lastActive: Date;
}
```

### Environment Setup

```bash
# Required environment variables
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
NEXT_PUBLIC_API_URL=http://...
```

## Deployment

### Production Checklist

- Environment variables
- Database indexing
- API route protection
- Error monitoring
- Performance monitoring
- Analytics setup
- Backup strategy
