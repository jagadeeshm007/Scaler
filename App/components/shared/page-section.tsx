import { cn } from '@/lib/utils';

/** Cal.com dark theme surfaces — see docs/design-tokens.md */
export const SURFACE = {
  page: 'bg-background',
  section: 'bg-card',
  innerList: 'bg-card',
  sectionBorder: 'border-border',
  input: 'bg-muted',
  inputBorder: 'border-border',
  rowDivider: 'border-border',
  actionGroup: 'bg-muted border-border',
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
        'w-full min-w-0 overflow-hidden border shadow-sm',
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
