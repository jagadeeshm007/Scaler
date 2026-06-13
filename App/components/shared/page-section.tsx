import { cn } from '@/lib/utils';

/** Cal.com dark theme surfaces — see docs/design-tokens.md */
export const SURFACE = {
  page: 'bg-neutral-950',
  section: 'bg-neutral-900',
  sectionBorder: 'border-neutral-800',
  input: 'bg-[#1a1a1a]',
  inputBorder: 'border-neutral-800',
  rowDivider: 'border-neutral-800/60',
  actionGroup: 'bg-[#1a1a1a] border-neutral-800',
} as const;

export const RADIUS = {
  section: 'rounded-xl',
  control: 'rounded-md',
  badge: 'rounded-full',
  pill: 'rounded-full',
} as const;

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

/** Inset rounded panel — ref: content card floating on page bg */
export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section
      className={cn(
        'overflow-hidden border shadow-sm',
        SURFACE.section,
        SURFACE.sectionBorder,
        RADIUS.section,
        className,
      )}
    >
      {children}
    </section>
  );
}
