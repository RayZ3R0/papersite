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
import { MiniExamCountdown } from "./MiniExamCountdown";

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
        className="flex items-center gap-2.5 text-sm font-medium px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
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

  const menuItems = [
    {
      href: "/profile",
      icon: UserIcon,
      label: "Your Profile",
    },
    {
      href: "/exams",
      icon: () => (
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
      ),
      label: "Routine",
    },
    {
      href: "/profile/settings",
      icon: SettingsIcon,
      label: "Settings",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-all duration-150"
      >
        <UserAvatar user={user} size="sm" />
        <span className="text-sm font-medium hidden sm:block">{user.username}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-surface rounded-xl border border-border shadow-lg py-2 z-50 overflow-hidden">
            {/* Header - User Info */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">{user.username}</h3>
                  <p className="text-sm text-text-muted truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Exam Countdown */}
            <MiniExamCountdown />

            {/* Navigation Links */}
            <div className="px-2 py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4 text-text-muted" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout Section */}
            <div className="px-2 pt-2 pb-1">
              <div className="border-t border-border -mx-2 my-1" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-error rounded-lg hover:bg-error/5 transition-colors"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
