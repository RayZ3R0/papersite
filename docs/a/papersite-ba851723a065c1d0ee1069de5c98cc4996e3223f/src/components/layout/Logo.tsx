'use client';

import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="block">
      <div className="w-8 h-8 md:w-10 md:h-10 transition-transform hover:scale-110">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <rect
            x="6"
            y="4"
            width="20"
            height="24"
            rx="2"
            className="fill-current opacity-20"
          />
          <path
            d="M8 4h16a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
            className="stroke-current"
            strokeWidth="2"
          />
          <path
            d="M9 4v24"
            className="stroke-current"
            strokeWidth="2"
          />
          <path
            d="M12 8h12M12 12h8M12 16h10"
            className="stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </Link>
  );
}