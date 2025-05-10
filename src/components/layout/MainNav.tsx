"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  FileTextIcon,
  ForumIcon,
  NotesIcon,
  ToolsIcon,
} from "./icons";
import ThemePicker from "./ThemePicker";
import ProfileDropdown from "../profile/ProfileDropdown";
import NavSearch from "./NavSearch";
import QueryPreservingLink from "@/utils/QueryPreservingLink";

export default function MainNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname?.startsWith(path);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside for tools menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showToolsMenu &&
        toolsMenuRef.current &&
        toolsButtonRef.current &&
        !toolsMenuRef.current.contains(event.target as Node) &&
        !toolsButtonRef.current.contains(event.target as Node)
      ) {
        setShowToolsMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showToolsMenu]);

  // Close menu on navigation
  useEffect(() => {
    setShowToolsMenu(false);
  }, [pathname]);

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50">
      <div className="h-full flex items-center px-4 max-w-7xl mx-auto">
        {/* LEFT SIDE - Logo and Navigation */}
        <div className="flex-shrink-0 flex items-center">
          {/* Logo */}
          <QueryPreservingLink
            href="/"
            className="font-bold text-lg text-text mr-4"
          >
            PaperNexus
          </QueryPreservingLink>
        </div>

        <div className="flex flex-shrink-0 items-center space-x-1">
          {/* Navigation Links */}
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

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              ref={toolsButtonRef}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${
                  isActive("/tools")
                    ? "bg-primary/10 text-primary"
                    : "text-text hover:bg-surface-hover"
                }
              `}
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              aria-expanded={showToolsMenu}
              aria-haspopup="true"
            >
              <ToolsIcon className="w-5 h-5" />
              <span>Tools</span>
              <svg
                className={`h-4 w-4 ml-1 transition-transform ${showToolsMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showToolsMenu && (
              <div
                ref={toolsMenuRef}
                className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-surface border border-border py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                role="menu"
                aria-orientation="vertical"
              >
                <QueryPreservingLink
                  href="/tools/raw-to-ums"
                  className="block px-4 py-2 text-sm text-text hover:bg-surface-hover"
                  role="menuitem"
                  onClick={() => setShowToolsMenu(false)}
                >
                  Raw to UMS Converter
                </QueryPreservingLink>
                <QueryPreservingLink
                  href="/tools/ums-chart"
                  className="block px-4 py-2 text-sm text-text hover:bg-surface-hover"
                  role="menuitem"
                  onClick={() => setShowToolsMenu(false)}
                >
                  UMS Grade Predictor
                </QueryPreservingLink>
              </div>
            )}
          </div>
        </div>

        {/* SPACER */}
        <div className="flex-grow"></div>

        {/* RIGHT SIDE - Search, Theme Picker, Profile */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Search */}
          <div className="w-[260px] lg:w-[300px] xl:w-[320px]">
            <Suspense
              fallback={
                <div className="h-10 bg-surface-hover animate-pulse rounded-lg"></div>
              }
            >
              <NavSearch />
            </Suspense>
          </div>

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
