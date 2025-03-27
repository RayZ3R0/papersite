import { useState, useEffect } from 'react';

export interface ForumUser {
  name: string;
  id: string;
}

const STORAGE_KEY = 'forum_user';

export function useForumUser() {
  const [user, setUser] = useState<ForumUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage on mount
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const setUsername = (name: string) => {
    if (!name.trim()) return;

    const updatedUser: ForumUser = {
      name: name.trim(),
      // Keep existing ID if user exists, create new one if not
      id: user?.id || crypto.randomUUID()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return {
    user,
    isLoading,
    setUsername,
    clearUser,
    isAuthenticated: !!user,
  };
}

// Helper to enforce user authentication
export function requireUser(user: ForumUser | null): asserts user is ForumUser {
  if (!user) {
    throw new Error('User is required');
  }
}