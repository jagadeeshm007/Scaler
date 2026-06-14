'use client';

import { useTheme } from 'next-themes';
import { useUIStore } from '@/store/ui.store';
import { useUpdateSettings } from '@/hooks/mutations/use-settings-mutations';

export type ThemeTransitionType =
  | 'CIRCLE'
  | 'DIAMOND'
  | 'SWIPE'
  | 'SWIPE_UP'
  | 'SPLIT_HORIZONTAL'
  | 'SPLIT_VERTICAL'
  | 'BOX_OUT';

interface UseThemeTransitionOptions {
  animationType?: ThemeTransitionType;
  duration?: number;
}

export function useThemeTransition(options: UseThemeTransitionOptions = {}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const updateSettings = useUpdateSettings();
  const uiStore = useUIStore();

  const animationType = options.animationType ?? 'CIRCLE';
  const duration = options.duration ?? 700;

  const toggleTheme = async (
    event?: React.MouseEvent<HTMLElement> | HTMLElement | { clientX: number; clientY: number },
  ) => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

    // Type definition for Document.startViewTransition
    const doc = document as unknown as {
      startViewTransition?: (callback: () => Promise<void> | void) => {
        ready: Promise<void>;
        finished: Promise<void>;
        updateCallbackDone: Promise<void>;
      };
    };

    // If View Transitions API is not supported, fallback to simple toggle
    if (!doc.startViewTransition) {
      setTheme(nextTheme);
      uiStore.setTheme(nextTheme);
      updateSettings.mutate({ theme: nextTheme });
      return;
    }

    // 1. Calculate X and Y coordinates
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (event) {
      if ('clientX' in event && 'clientY' in event) {
        x = event.clientX;
        y = event.clientY;
      } else if (event instanceof HTMLElement) {
        const rect = event.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else {
        const ev = event as any;
        if (ev && 'currentTarget' in ev && ev.currentTarget instanceof HTMLElement) {
          const rect = ev.currentTarget.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
      }
    }

    // 2. Calculate the target radius to fully cover the viewport
    const distToTopLeft = Math.hypot(x, y);
    const distToTopRight = Math.hypot(window.innerWidth - x, y);
    const distToBottomLeft = Math.hypot(x, window.innerHeight - y);
    const distToBottomRight = Math.hypot(window.innerWidth - x, window.innerHeight - y);
    const endRadius = Math.max(distToTopLeft, distToTopRight, distToBottomLeft, distToBottomRight);

    // 3. Mark html element as transitioning to suspend default animations
    document.documentElement.classList.add('theme-transitioning');

    // 4. Start view transition
    const transition = doc.startViewTransition(async () => {
      const wasDark = document.documentElement.classList.contains('dark');
      setTheme(nextTheme);
      uiStore.setTheme(nextTheme);
      updateSettings.mutate({ theme: nextTheme });

      // Wait for next-themes to actually write the class update to <html>
      await new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          const isDarkNow = document.documentElement.classList.contains('dark');
          if (isDarkNow !== wasDark) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });

        // 500ms safety timeout fallback
        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 500);
      });
    });

    try {
      await transition.ready;

      // 5. Build dynamic clipPath keyframes based on transition type
      let keyframes: Keyframe[] = [];

      if (animationType === 'CIRCLE') {
        keyframes = [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
        ];
      } else if (animationType === 'DIAMOND') {
        keyframes = [
          {
            clipPath: `polygon(${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px)`,
          },
          {
            clipPath: `polygon(${x}px ${y - endRadius}px, ${x + endRadius}px ${y}px, ${x}px ${y + endRadius}px, ${x - endRadius}px ${y}px)`,
          },
        ];
      } else if (animationType === 'SWIPE') {
        keyframes = [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }];
      } else if (animationType === 'SWIPE_UP') {
        keyframes = [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }];
      } else if (animationType === 'BOX_OUT') {
        keyframes = [
          {
            clipPath: `inset(${y}px ${window.innerWidth - x}px ${window.innerHeight - y}px ${x}px)`,
          },
          { clipPath: 'inset(0 0 0 0)' },
        ];
      } else if (animationType === 'SPLIT_HORIZONTAL') {
        keyframes = [
          { clipPath: `inset(0 ${window.innerWidth - x}px 0 ${x}px)` },
          { clipPath: 'inset(0 0 0 0)' },
        ];
      } else if (animationType === 'SPLIT_VERTICAL') {
        keyframes = [
          { clipPath: `inset(${y}px 0 ${window.innerHeight - y}px 0)` },
          { clipPath: 'inset(0 0 0 0)' },
        ];
      }

      // 6. Execute animation
      document.documentElement.animate(keyframes, {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      });

      // Clean up only after the entire view transition has finished and pseudo-elements are destroyed
      transition.finished.finally(() => {
        document.documentElement.classList.remove('theme-transitioning');
      });
    } catch {
      // Fallback clean-up if anything fails
      document.documentElement.classList.remove('theme-transitioning');
    }
  };

  return {
    toggleTheme,
    theme,
    resolvedTheme,
  };
}
