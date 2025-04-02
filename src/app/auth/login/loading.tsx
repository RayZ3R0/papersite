import { Loader2 } from 'lucide-react';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-text-muted">Loading...</p>
      </div>
    </div>
  );
}