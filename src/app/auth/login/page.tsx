"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import { useReturnTo } from "@/hooks/useReturnTo";
import { withSearchParams } from "@/components/providers/SearchParamsProvider";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getReturnUrl } = useReturnTo();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const registered = searchParams?.get("registered");
    if (registered) {
      setSuccessMessage("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  // Handle successful login
  const handleLoginSuccess = () => {
    router.replace(getReturnUrl());
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-surface dark:bg-surface-dark">
      <div className="max-w-md w-full space-y-8">
        {/* Success message */}
        {successMessage && (
          <div className="p-3 bg-success/10 border border-success rounded text-success text-sm text-center">
            {successMessage}
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href={`/auth/register${
                searchParams ? `?${searchParams.toString()}` : ""
              }`}
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <LoginForm onSuccess={handleLoginSuccess} returnTo={getReturnUrl()} />
      </div>
    </div>
  );
}

// Wrap with SearchParamsProvider
export default withSearchParams(LoginPage);
