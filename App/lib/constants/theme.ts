export const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];

export const DEFAULT_BRAND_COLOR_LIGHT = '#111111';
export const DEFAULT_BRAND_COLOR_DARK = '#fafafa';

export const THEME_LABELS: Record<ThemeOption, string> = {
  system: 'System default',
  light: 'Light',
  dark: 'Dark',
};
