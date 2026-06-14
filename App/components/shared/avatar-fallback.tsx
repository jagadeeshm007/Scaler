import { cn } from '@/lib/utils';

interface AvatarFallbackProps {
  name: string;
  className?: string;
}

export function AvatarFallback({ name, className }: AvatarFallbackProps) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-pink-600 text-sm font-medium text-foreground',
        className,
      )}
    >
      {initial}
    </div>
  );
}
