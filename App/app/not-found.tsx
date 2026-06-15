import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild>
        <Link href={ROUTES.eventTypes}>Go to dashboard</Link>
      </Button>
    </div>
  );
}
