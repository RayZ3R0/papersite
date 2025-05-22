import Link from "next/link";
import { setLatestPapersState } from "@/utils/latestPapersState";
import type { ReactNode } from "react";

interface LatestPapersLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function LatestPapersLink({ href, children, className }: LatestPapersLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        // Set the state before navigation
        setLatestPapersState();
      }}
    >
      {children}
    </Link>
  );
}