"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { UserIcon, SettingsIcon, LogoutIcon } from "@/components/layout/icons";
import UserAvatar from "./UserAvatar";
import Link from "next/link";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-[9999]
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-surface border-l border-border
          transform transition-transform duration-200 ease-in-out z-[10000]
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="lg" />
              <div>
                <h3 className="font-medium">{user.username}</h3>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text p-1"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-6 py-3 text-sm hover:bg-surface-hover"
            onClick={onClose}
          >
            <UserIcon className="w-5 h-5" />
            <span>Your Profile</span>
          </Link>

          <Link
            href="/profile/academic"
            className="flex items-center gap-3 px-6 py-3 text-sm hover:bg-surface-hover"
            onClick={onClose}
          >
            <svg
              className="w-5 h-5"
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
            className="flex items-center gap-3 px-6 py-3 text-sm hover:bg-surface-hover"
            onClick={onClose}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-6 py-3 text-sm text-error hover:bg-surface-hover"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
