"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface SearchParamsProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SearchParamsProvider({
  children,
  fallback = (
    <div className="flex justify-center p-4">
      <LoadingSpinner size="sm" />
    </div>
  ),
}: SearchParamsProviderProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Re-export withSearchParams for convenience
export { withSearchParams } from "./withSearchParams";
