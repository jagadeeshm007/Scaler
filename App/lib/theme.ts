import type { ThemeOption } from '@/lib/constants/theme';

export const THEME_STORAGE_KEY = 'theme';

export function isThemeOption(value: string | null | undefined): value is ThemeOption {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function resolveThemePreference(
  preference: ThemeOption | null | undefined,
  systemPrefersDark: boolean,
): 'light' | 'dark' {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return systemPrefersDark ? 'dark' : 'light';
}

export function formatThemeModeLabel(
  preference: string | undefined,
  resolvedTheme: string | undefined,
): string {
  const mode: ThemeOption = isThemeOption(preference) ? preference : 'system';

  if (mode === 'system') {
    const resolved = resolvedTheme === 'dark' ? 'dark' : 'light';
    return `System (${resolved})`;
  }

  return resolvedTheme === 'dark' ? 'dark' : 'light';
}

export function applyResolvedThemeClass(prefersDark: boolean): void {
  const root = document.documentElement;
  root.classList.toggle('dark', prefersDark);
  root.style.colorScheme = prefersDark ? 'dark' : 'light';
}

/** Runs before paint to avoid a flash and honor OS preference when theme is "system". */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k)||'system';var m=window.matchMedia('(prefers-color-scheme: dark)');var d=m.matches;var r=t==='system'?(d?'dark':'light'):t;var el=document.documentElement;if(r==='dark'){el.classList.add('dark');el.style.colorScheme='dark';}else{el.classList.remove('dark');el.style.colorScheme='light';}}catch(e){}})();`;
