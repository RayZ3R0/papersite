"use client";

import { SearchParamsProvider } from "./SearchParamsProvider";
import { Suspense } from "react";

export function withSearchParams<P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ReactNode = null
) {
  return function WithSearchParamsWrapper(props: P) {
    return (
      <SearchParamsProvider fallback={LoadingComponent}>
        <Component {...props} />
      </SearchParamsProvider>
    );
  };
}
