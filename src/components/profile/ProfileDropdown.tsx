"use client";

import { useState } from "react";
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
import { useRef } from "react";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
      >
        <UserIcon className="w-5 h-5" />
        <span>Login</span>
      </Link>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
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
              href="/profile/academic"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Academic Progress</span>
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
