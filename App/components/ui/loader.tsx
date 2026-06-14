import * as React from 'react';
import { cn } from '@/lib/utils';

type LoaderProps = {
  className?: string;
  variant?: 'dots' | 'grid';
};

export function Loader({ className = '', variant = 'grid' }: LoaderProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-3 gap-1 size-6', className)}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current animate-pulse"
          style={{
            animationDelay: `${(i % 3) * 0.15 + Math.floor(i / 3) * 0.15}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
}
