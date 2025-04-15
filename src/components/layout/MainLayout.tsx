"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemePicker from "./ThemePicker";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      {/* Header - Desktop only */}
      <header className="hidden md:block sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-text hover:text-text-muted transition-colors"
            >
              Home
            </Link>
            <Link
              href="/papers"
              className="text-text hover:text-text-muted transition-colors"
            >
              Papers
            </Link>
            <Link
              href="/books"
              className="text-text hover:text-text-muted transition-colors"
            >
              Books
            </Link>
            <Link
              href="/notes"
              className="text-text hover:text-text-muted transition-colors"
            >
              Notes
            </Link>
            <Link
              href="/forum"
              className="text-text hover:text-text-muted transition-colors"
            >
              Forum
            </Link>
            <Link
              href="/search"
              className="text-text hover:text-text-muted transition-colors"
            >
              Search
            </Link>
          </nav>

          {/* Theme Picker - Show on desktop */}
          <div className="flex items-center">
            <ThemePicker />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;