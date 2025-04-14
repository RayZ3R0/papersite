"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/components/layout/icons";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { MiniExamCountdown } from "./MiniExamCountdown";

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

  const menuItems = [
    {
      href: "/profile",
      icon: UserIcon,
      label: "Your Profile",
      description: "View and edit your account details",
    },
    {
      href: "/exams",
      icon: () => (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: "Routine",
      description: "Check your exam schedule",
    },
    {
      href: "/profile/settings",
      icon: SettingsIcon,
      label: "Settings",
      description: "Manage your preferences",
    },
  ];

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-[9999]
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-surface/95 backdrop-blur-sm
          border-l border-border shadow-2xl
          transform transition-transform duration-300 ease-in-out z-[10000]
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-surface/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="lg" />
              <div>
                <h3 className="font-semibold text-lg">{user.username}</h3>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
              aria-label="Close drawer"
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

          {/* Exam Countdown in Header */}
          <MiniExamCountdown />
        </div>

        {/* Menu Items with Hover Cards */}
        <div className="p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-surface-hover transition-all group"
                onClick={onClose}
              >
                <div className="p-2 rounded-lg bg-surface-hover/50 group-hover:bg-surface-hover/80 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-0.5">{item.label}</h4>
                  <p className="text-sm text-text-muted">{item.description}</p>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer with Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-surface/50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-error rounded-xl hover:bg-error/5 transition-colors"
          >
            <div className="p-2 rounded-lg bg-error/5">
              <LogoutIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-medium">Logout</span>
              <p className="text-sm text-text-muted">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
