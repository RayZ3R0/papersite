'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { canPerformAction } from '@/lib/forumUtils';
import { useClickOutside } from '@/hooks/useClickOutside';

interface UserActionMenuProps {
  authorId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onLock?: () => void;
  isPinned?: boolean;
  isLocked?: boolean;
  type: 'post' | 'reply';
}

export default function UserActionMenu({
  authorId,
  onEdit,
  onDelete,
  onPin,
  onLock,
  isPinned,
  isLocked,
  type
}: UserActionMenuProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [positionTop, setPositionTop] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canEdit = canPerformAction('edit', user, authorId, type);
  const canDelete = canPerformAction('delete', user, authorId, type);
  const canPin = canPerformAction('pin', user, authorId, type);
  const canLock = canPerformAction('lock', user, authorId, type);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  useClickOutside(menuRef, closeMenu, isOpen);

  // Calculate if the menu should appear above or below based on available space
  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = dropdownRef.current.offsetHeight;
      const spaceAbove = buttonRect.top;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      
      // Use top positioning if there's not enough space below
      setPositionTop(spaceBelow < menuHeight && spaceAbove > menuHeight);
    }
  }, [isOpen]);

  // Don't render if user has no permissions
  if (!canEdit && !canDelete && !canPin && !canLock) {
    return null;
  }

  const handleAction = async (action: () => void | Promise<void>) => {
    try {
      setError('');
      await action();
      closeMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Action button with improved hover states */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all duration-200 transform ${
          isOpen 
            ? 'bg-surface-alt text-text scale-105' 
            : 'hover:bg-surface-alt/50 active:bg-surface-alt text-text-muted hover:text-text'
        }`}
        aria-label="Post actions"
        aria-expanded={isOpen}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-5 h-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {/* Dropdown menu positioned relative to button */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-[500] min-w-52 bg-surface rounded-lg shadow-lg border border-divider overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{
            ...(positionTop 
              ? { bottom: '100%', marginBottom: '0.5rem' } 
              : { top: '100%', marginTop: '0.5rem' }
            ),
            right: 0,
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.15)',
            maxWidth: 'calc(100vw - 24px)', // Prevent overflow on mobile
          }}
        >
          <div className="py-1">
            {canEdit && onEdit && (
              <button
                onClick={() => handleAction(onEdit)}
                className="w-full px-4 py-3 text-left text-text hover:bg-surface-alt/50 active:bg-surface-alt transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
            )}

            {canDelete && onDelete && (
              <button
                onClick={() => {
                  const confirm = window.confirm('Are you sure you want to delete this?');
                  if (confirm) {
                    handleAction(onDelete);
                  }
                }}
                className="w-full px-4 py-3 text-left text-error hover:bg-error/10 active:bg-error/20 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            )}

            {canPin && onPin && (
              <button
                onClick={() => handleAction(onPin)}
                className="w-full px-4 py-3 text-left text-text hover:bg-surface-alt/50 active:bg-surface-alt transition-colors flex items-center gap-3"
              >
                <svg className={`w-4 h-4 flex-shrink-0 ${isPinned ? 'text-primary' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{isPinned ? 'Unpin' : 'Pin'}</span>
              </button>
            )}

            {canLock && onLock && (
              <button
                onClick={() => handleAction(onLock)}
                className="w-full px-4 py-3 text-left text-text hover:bg-surface-alt/50 active:bg-surface-alt transition-colors flex items-center gap-3"
              >
                {isLocked ? (
                  <>
                    <svg className="w-4 h-4 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>Unlock</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Lock</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error message with animation */}
      {error && (
        <div 
          className="absolute right-0 mt-2 w-64 p-3 bg-error text-white text-sm rounded-lg z-[502] animate-in fade-in slide-in-from-top-1"
          style={{ 
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            maxWidth: 'calc(100vw - 24px)' // Prevent overflow on mobile
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}