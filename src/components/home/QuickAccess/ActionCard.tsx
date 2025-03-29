'use client';

import { QuickAction } from '@/types/actions';
import Link from 'next/link';

interface ActionCardProps {
  action: QuickAction;
}

export default function ActionCard({ action }: ActionCardProps) {
  const { icon: Icon } = action;

  return (
    <Link 
      href={action.href}
      className="block h-full"
    >
      <div className={`
        relative h-full rounded-2xl p-6
        bg-surface border border-border/40
        transition-all duration-300 ease-out
        ${action.color.bg}
        hover:border-border/0
        hover:scale-[1.02] hover:shadow-lg
        active:scale-[0.98]
        overflow-hidden
      `}>
        {/* Gradient background that shows on hover */}
        <div 
          className={`
            absolute inset-0 opacity-0 
            transition-opacity duration-300
            ${action.color.hover}
            group-hover:opacity-100
          `}
          aria-hidden="true"
        />

        {/* Card content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Icon with background */}
          <div className={`
            w-12 h-12 mb-4
            rounded-xl
            flex items-center justify-center
            bg-white/5 backdrop-blur-sm
            transition-transform duration-300
            group-hover:-rotate-12
          `}>
            <Icon className={`
              w-6 h-6
              ${action.color.text}
            `} />
          </div>

          {/* Text content */}
          <div>
            <h3 className={`
              text-lg font-semibold mb-2
              ${action.color.text}
            `}>
              {action.label}
            </h3>
            <p className="text-sm text-text/80">
              {action.description}
            </p>
          </div>
        </div>
        
        {/* Bottom highlight effect */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}