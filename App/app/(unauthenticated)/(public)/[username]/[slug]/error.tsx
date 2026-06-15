'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

export default function BookingPageError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted-foreground">This booking page could not be found.</p>
      <Button render={<Link href={ROUTES.eventTypes} />}>Go home</Button>
    </div>
  );
}
