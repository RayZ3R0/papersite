"use client";

import ProtectedContent from "@/components/auth/ProtectedContent";
import Link from "next/link";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedContent
      roles={["user", "moderator", "admin"]}
      message="Please sign in to view your profile"
      fallback={
        <>
          <div className="container mx-auto p-4">
            <div className="bg-surface p-6 rounded-lg shadow-sm text-center">
              <h2 className="text-xl font-semibold mb-2">
                Profile Access Required
              </h2>
              <p className="text-text-muted">
                Please sign in to view and manage your profile
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
            >
              Create account
            </Link>
          </div>
        </>
      }
    >
      <div className="container mx-auto p-4">
        <div className="max-w-5xl mx-auto">{children}</div>
      </div>
    </ProtectedContent>
  );
}
