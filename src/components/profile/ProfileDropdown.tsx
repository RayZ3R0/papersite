"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import {
  UserIcon,
  ChevronDownIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/components/layout/icons";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useReturnTo } from "@/hooks/useReturnTo";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { saveCurrentPath } = useReturnTo();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (!user) {
    const returnPath = saveCurrentPath();
    return (
      <Link
        href={`/auth/login?returnTo=${encodeURIComponent(returnPath)}`}
        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
      >
        <UserIcon className="w-5 h-5" />
        <span>Login</span>
      </Link>
    );
  }

  const handleLogout = async () => {
    try {
      setIsOpen(false); // Close dropdown first
      await logout();
      // Stay on the same page after logout
      router.refresh(); // Refresh the page to update UI
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:text-primary transition-colors"
      >
        <UserAvatar user={user} size="sm" />
        <span className="text-sm font-medium">{user.username}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-2 z-50">
          {/* Profile Section */}
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-surface-hover"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="w-4 h-4" />
              <span>Your Profile</span>
            </Link>

            <Link
              href="/exams"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-surface-hover"
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Routine</span>
            </Link>

            <Link
              href="/profile/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-surface-hover"
              onClick={() => setIsOpen(false)}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error hover:bg-surface-hover"
            >
              <LogoutIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
