import { ReactNode } from 'react';
import { PageSection } from '@/components/shared/page-section';

export interface PageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  mobileHeader?: ReactNode;
}

export function PageShell({ title, description, actions, children, mobileHeader }: PageShellProps) {
  return (
    <PageSection className="flex min-h-full flex-1 flex-col pb-24 md:pb-6">
      {/* Desktop Header */}
      <div className="hidden shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-5 md:flex">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {/* Mobile Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 md:hidden">
        {mobileHeader ?? (
          <>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </>
        )}
      </div>

      {children}
    </PageSection>
  );
}
