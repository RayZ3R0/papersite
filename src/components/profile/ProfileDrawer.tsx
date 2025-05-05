"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  SettingsIcon,
  LogoutIcon,
  ForumIcon,
} from "@/components/layout/icons";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { MiniExamCountdown } from "./MiniExamCountdown";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { user, logout, isLoading } = useAuth();
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out z-[9999]
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 sm:w-96 bg-surface
          border-l border-border shadow-xl
          transform transition-all duration-300 ease-out z-[10000]
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          ${isLoading ? "cursor-wait" : ""}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Profile menu"
        aria-busy={isLoading}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-border bg-background">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="flex items-start justify-between mb-4">
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

        {/* Menu Items */}
        <div className="p-4 overflow-y-auto flex-1">
          <nav className="space-y-2" role="menu">
            {[
              {
                href: "/profile",
                icon: UserIcon,
                label: "Your Profile",
                description: "View and edit your account details",
              },
              {
                href: "/forum",
                icon: ForumIcon,
                label: "Forum",
                description: "Join discussions and share knowledge",
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
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-surface-hover active:bg-surface-hover/80 transition-all group focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                onClick={onClose}
                role="menuitem"
              >
                <div className="p-2 rounded-lg bg-background group-hover:bg-surface-hover/90 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-0.5 text-text">{item.label}</h4>
                  <p className="text-sm text-text-muted">{item.description}</p>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer with Logout */}
        <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex w-full items-center gap-3 px-4 py-3 text-error rounded-xl hover:bg-error/5 active:bg-error/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-error disabled:opacity-50 disabled:cursor-not-allowed"
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
