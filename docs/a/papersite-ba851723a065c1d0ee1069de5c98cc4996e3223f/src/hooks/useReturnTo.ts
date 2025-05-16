'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useReturnTo() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getReturnUrl = () => {
    const returnTo = searchParams?.get('returnTo');
    if (returnTo && returnTo !== '/auth/login') {
      return returnTo;
    }
    return '/';
  };

  const saveCurrentPath = () => {
    if (pathname && !pathname.startsWith('/auth/')) {
      // Save the current path for post-login redirect
      const currentPath = pathname;
      // Add current search params if they exist
      if (searchParams?.toString()) {
        return `${currentPath}?${searchParams.toString()}`;
      }
      return currentPath;
    }
    return '/';
  };

  const redirectToLogin = () => {
    const returnPath = saveCurrentPath();
    router.push(`/auth/login?returnTo=${encodeURIComponent(returnPath)}`);
  };

  return {
    getReturnUrl,
    saveCurrentPath,
    redirectToLogin,
  };
}