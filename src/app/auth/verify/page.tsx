"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Verification token is missing");
          return;
        }

        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    }

    verifyEmail();
  }, [searchParams]);

  // Already logged in and verified
  if (user?.verified) {
    router.replace("/");
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full mx-4 p-8 bg-card rounded-lg shadow-lg">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">Email Verified!</h2>
            <p className="text-text-muted mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">Verification Failed</h2>
            <p className="text-text-muted mb-6">{message}</p>
            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Return to Login
              </Link>
              <button
                onClick={async () => {
                  if (!user?.email) return;

                  try {
                    const response = await fetch("/api/auth/verify", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: user.email }),
                    });

                    if (response.ok) {
                      setMessage("New verification email sent!");
                    } else {
                      const data = await response.json();
                      setMessage(
                        data.error || "Failed to send verification email"
                      );
                    }
                  } catch (error) {
                    console.error("Error sending verification email:", error);
                    setMessage("Failed to send verification email");
                  }
                }}
                className="block w-full px-6 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
