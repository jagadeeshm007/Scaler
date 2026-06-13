'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TransitionLink({ href, children, className, onClick }: TransitionLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!('startViewTransition' in document)) return;
    e.preventDefault();
    document.startViewTransition(() => {
      startTransition(() => router.push(href));
    });
  };

  return (
    <Link href={href} className={className} onClick={handleClick} data-pending={isPending}>
      {children}
    </Link>
  );
}
