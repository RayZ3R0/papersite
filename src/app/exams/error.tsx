"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <ErrorMessage
          title="Something went wrong!"
          message={error.message || "Failed to load exam schedule"}
          action={
            <button
              onClick={reset}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          }
        />
      </div>
    </div>
  );
}
