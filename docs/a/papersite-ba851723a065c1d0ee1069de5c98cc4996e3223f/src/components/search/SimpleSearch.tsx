"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SearchBox from "./SearchBox";

export default function SimpleSearch() {
  const router = useRouter();

  const handleSearch = (text: string) => {
    if (text.trim()) {
      // Navigate to search page with query and focus flag
      router.push(`/search?q=${encodeURIComponent(text)}&focus=true`);
    }
  };

  return (
    <div className="relative mb-8">
      <SearchBox
        value=""
        onChange={handleSearch}
        onClear={() => {}}
        placeholder="Search past papers..."
        className="!shadow-md hover:!shadow-lg transition-shadow"
      />
      {/* Advanced Search Link */}
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => router.push("/search?focus=true")}
          className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light
            transition-colors"
        >
          Advanced Search →
        </button>
      </div>
    </div>
  );
}
