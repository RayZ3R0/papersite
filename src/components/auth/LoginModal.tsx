'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  returnTo?: string;
}

export default function LoginModal({ isOpen, onClose, message, returnTo }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-xl sm:rounded-xl shadow-lg transition-transform duration-300 ease-out transform translate-y-0">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-divider">
          <h2 className="text-xl font-semibold text-text">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-alt rounded-full transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-text-muted"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="p-4 bg-primary/10 border-b border-primary/20">
            <p className="text-sm text-primary">{message}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {isLogin ? (
            <LoginForm onSuccess={onClose} returnTo={returnTo} />
          ) : (
            <RegisterForm onSuccess={onClose} returnTo={returnTo} />
          )}

          {/* Toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}