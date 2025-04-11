'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CatchAllProfileRoute() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main profile page
    router.replace('/profile');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}