"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { useTheme } from "@/hooks/useTheme";

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { saveCurrentPath } = useReturnTo();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isActive = (path: string) => pathname?.startsWith(path);
  
  // State for scroll-aware behavior
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const animationFrameId = useRef<number | null>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const bottomNavRef = useRef<HTMLDivElement>(null);
  
  // Throttled scroll handler with requestAnimationFrame for performance
  const handleScroll = useCallback(() => {
    if (animationFrameId.current) return;
    
    animationFrameId.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      
      // Don't respond to small scroll changes or rapid scrolling
      if (Math.abs(currentScrollY - lastScrollY.current) < 10 ||
          currentTime - lastScrollTime.current < 40) {
        animationFrameId.current = null;
        return;
      }
      
      // Detect scroll direction with some hysteresis to prevent flickering
      if (currentScrollY > lastScrollY.current + 20 && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5 || currentScrollY < 50) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
      animationFrameId.current = null;
    });
  }, []);
  
  // Setup scroll listener with passive option for better performance
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleScroll]);
  
  // Ensure nav is visible when active path changes
  useEffect(() => {
    setIsVisible(true);
  }, [pathname]);
  
  const handleNavLinkClick = () => {
    // On navigation, ensure drawer is closed
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
    }
    
    // Force nav to be visible after clicking a link
    setIsVisible(true);
  };

  return (
    <>
      {/* Top Navigation Bar with more solid styling */}
      <div 
        ref={topNavRef}
        className={`
          md:hidden fixed top-0 left-0 right-0 z-[9998] 
          h-14 border-b border-border 
          will-change-transform transition-all duration-300 ease-out
          bg-surface shadow-sm backdrop-blur-[2px]
          ${isVisible ? 'translate-y-0' : 'translate-y-[-100%]'}
        `}
        style={{
          transform: isVisible ? 'translate3d(0,0,0)' : 'translate3d(0,-100%,0)',
          backfaceVisibility: 'hidden',
          WebkitBackdropFilter: 'blur(2px)' // Subtle blur for Safari
        }}
      >
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Section */}
          <Link
            href="/"
            onClick={handleNavLinkClick}
            className={`
              p-2 -ml-2 flex items-center rounded-md
              transition-all active:scale-[0.97] 
              ${pathname === "/" 
                ? "text-primary font-medium" 
                : "text-text-muted hover:text-text"}
            `}
            aria-label="Home"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="ml-1.5 text-sm font-medium">Home</span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemePicker />
            {user ? (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-text-muted hover:text-text active:scale-[0.97] rounded-md"
                aria-label="Profile"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href={`/auth/login?returnTo=${encodeURIComponent(
                  saveCurrentPath()
                )}`}
                className="p-2 text-text-muted hover:text-text active:scale-[0.97] rounded-md"
                aria-label="Login"
                onClick={handleNavLinkClick}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Add padding for top navbar */}
      <div className="md:hidden h-14" aria-hidden="true" />

      {/* Bottom Navigation - with more solid styling */}
      <nav 
        ref={bottomNavRef}
        className={`
          md:hidden fixed bottom-0 left-0 right-0 z-[9997] 
          border-t border-border
          bg-surface shadow-sm backdrop-blur-[2px]
          will-change-transform transition-all duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-[100%]'}
        `}
        style={{
          transform: isVisible ? 'translate3d(0,0,0)' : 'translate3d(0,100%,0)',
          backfaceVisibility: 'hidden',
          WebkitBackdropFilter: 'blur(2px)', // Subtle blur for Safari
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex items-center justify-around h-16">
          <NavLink
            href="/books"
            icon={BookIcon}
            label="Books"
            active={isActive("/books")}
            onClick={handleNavLinkClick}
          />
          <NavLink
            href="/papers"
            icon={FileTextIcon}
            label="Papers"
            active={isActive("/papers")}
            onClick={handleNavLinkClick}
          />
          <NavLink
            href="/forum"
            icon={MessageCircleIcon}
            label="Forum"
            active={isActive("/forum")}
            onClick={handleNavLinkClick}
          />
          <NavLink
            href="/notes"
            icon={GridIcon}
            label="Notes"
            active={isActive("/notes")}
            onClick={handleNavLinkClick}
          />
          <NavLink
            href="/search"
            icon={SearchIcon}
            label="Search"
            active={isActive("/search")}
            onClick={handleNavLinkClick}
          />
        </div>
      </nav>

      {/* Add padding for bottom navigation plus safe area inset */}
      <div className="md:hidden h-16 pb-[env(safe-area-inset-bottom, 0px)]" aria-hidden="true" />

      {/* Profile Drawer - Over everything else */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

function NavLink({ 
  href, 
  icon: Icon, 
  label, 
  active, 
  onClick
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center
        min-w-[4rem] p-2 transition-all
        active:scale-[0.95] relative group
        ${active 
          ? "text-primary" 
          : "text-text-muted hover:text-text"}
      `}
      onClick={onClick}
    >
      {/* Active background indicator */}
      {active && (
        <span 
          className="absolute inset-x-1 -inset-y-0.5 rounded-md bg-primary/10 -z-10"
          aria-hidden="true"
        />
      )}
      
      <span className={`
        flex items-center justify-center w-6 h-6 mb-1
        transition-transform 
        ${active ? 'scale-110' : 'scale-100'}
      `}>
        <Icon className="w-[22px] h-[22px]" />
      </span>
      <span className={`
        text-xs transition-opacity
        ${active ? 'opacity-100 font-medium' : 'opacity-80'}
      `}>
        {label}
      </span>
      
      {/* Underline indicator for active state */}
      {active && (
        <span 
          className="absolute -bottom-0.5 w-8 h-0.5 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}

      {/* Hover effect - more subtle */}
      <span 
        className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 
          rounded-md transition-opacity" 
        aria-hidden="true"
      />
    </Link>
  );
}