"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, FileTextIcon, ForumIcon, NotesIcon } from "./icons";
import ThemePicker from "./ThemePicker";
import ProfileDropdown from "../profile/ProfileDropdown";
import NavSearch from "./NavSearch";
import QueryPreservingLink from "@/utils/QueryPreservingLink"; // Import the new component

export default function MainNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <QueryPreservingLink href="/" className="font-bold text-lg text-text">
            PaperVoid
          </QueryPreservingLink>

          {/* Main Navigation */}
          <div className="flex items-center gap-1">
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
              icon={ForumIcon}
              label="Forum"
              active={isActive("/forum")}
            />
            <NavLink
              href="/notes"
              icon={NotesIcon}
              label="Notes"
              active={isActive("/notes")}
            />
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 flex justify-center">
          <div className="w-[400px]">
            {/* Wrap NavSearch in Suspense */}
            <Suspense
              fallback={
                <div className="h-10 bg-surface-hover animate-pulse rounded-lg"></div>
              }
            >
              <NavSearch />
            </Suspense>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 pl-2">
          <ThemePicker />
          <div className="h-8 w-px bg-border/50"></div>
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <QueryPreservingLink
      href={href}
      prefetch={true}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-colors duration-150
        ${
          active
            ? "bg-primary/10 text-primary"
            : "text-text hover:bg-surface-hover"
        }
      `}
      scroll={false}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </QueryPreservingLink>
  );
}
