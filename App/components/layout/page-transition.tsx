'use client';

import { LazyMotion, domAnimation, m, useReducedMotion, type HTMLMotionProps } from 'motion/react';

import { cn } from '@/lib/utils';

interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export function PageTransition({
  children,
  className,
  initial,
  animate,
  exit,
  transition,
  ...props
}: PageTransitionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={cn(className)}
        initial={reducedMotion ? false : (initial ?? { opacity: 0, y: 8 })}
        animate={reducedMotion ? undefined : (animate ?? { opacity: 1, y: 0 })}
        exit={reducedMotion ? undefined : exit}
        transition={reducedMotion ? undefined : (transition ?? { duration: 0.2, ease: 'easeOut' })}
        {...props}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
