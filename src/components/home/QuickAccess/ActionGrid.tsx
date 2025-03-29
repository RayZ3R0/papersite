'use client';

import ActionCard from './ActionCard';
import { quickActions } from '@/config/quickActions';

export default function ActionGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 -mt-16 pt-32 md:pt-40 pb-24 md:pb-32">
      {/* Section header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
          Quick Access
        </h2>
        <p className="text-text/60">
          Everything you need, one click away
        </p>
      </div>

      {/* Action grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map(action => (
          <div 
            key={action.id}
            className="group min-h-[180px]"
          >
            <ActionCard action={action} />
          </div>
        ))}
      </div>
    </section>
  );
}