import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - PaperVoid",
  description: "Sign in or create an account to access PaperVoid features",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo/Branding */}
      <header className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <a href="/" className="text-2xl font-bold text-text">
              PaperVoid
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-text-muted">
            <p>
              &copy; {new Date().getFullYear()} PaperVoid. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
