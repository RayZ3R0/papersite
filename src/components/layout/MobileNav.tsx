"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  FileTextIcon,
  GridIcon,
  MessageCircleIcon,
  SearchIcon,
  UserIcon,
  HomeIcon,
} from "./icons";
import { useAuth } from "@/components/auth/AuthContext";
import { useReturnTo } from "@/hooks/useReturnTo";
import ProfileDrawer from "../profile/ProfileDrawer";
import ThemePicker from "./ThemePicker";

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { saveCurrentPath } = useReturnTo();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Top Navigation Bar - Always visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[9998] bg-surface border-b border-border h-12">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left Section */}
          <Link
            href="/"
            className={`p-2 -ml-2 transition-colors ${
              pathname === "/"
                ? "text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            <HomeIcon className="w-5 h-5" />
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-1">
            <ThemePicker />
            {user ? (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-text-muted hover:text-text"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href={`/auth/login?returnTo=${encodeURIComponent(
                  saveCurrentPath()
                )}`}
                className="p-2 text-text-muted hover:text-text"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Add padding for top navbar */}
      <div className="md:hidden h-12" aria-hidden="true" />

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9997] bg-surface border-t border-border">
        <div className="flex items-center justify-around h-16">
          <NavLink
            href="/books"
            icon={BookIcon}
            label="Books"
            active={isActive("/books")}
          />
          <NavLink
            href="/papers"
            icon={FileTextIcon}
            label="Papers"
            active={isActive("/papers")}
          />
          <NavLink
            href="/forum"
            icon={MessageCircleIcon}
            label="Forum"
            active={isActive("/forum")}
          />
          <NavLink
            href="/notes"
            icon={GridIcon}
            label="Notes"
            active={isActive("/notes")}
          />
          <NavLink
            href="/search"
            icon={SearchIcon}
            label="Search"
            active={isActive("/search")}
          />
        </div>
      </nav>

      {/* Profile Drawer - Over everything else */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center
        min-w-[4rem] py-1 rounded-lg transition-colors
        ${active ? "text-primary" : "text-text-muted hover:text-text"}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-0.5">{label}</span>
    </Link>
  );
}
