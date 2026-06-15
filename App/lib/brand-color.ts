import type { UserSettings } from '@bolt/types';

import { DEFAULT_BRAND_COLOR_DARK, DEFAULT_BRAND_COLOR_LIGHT } from '@/lib/constants/theme';

export interface BrandColorInput {
  brand_colors_enabled?: boolean;
  brand_color_light?: string;
  brand_color_dark?: string;
}

export const DEFAULT_BRAND_NAME = 'eith.com';

const BRAND_CSS_PROPERTIES = ['--primary', '--primary-foreground', '--ring', '--accent'] as const;

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (/^#[A-Fa-f0-9]{6}$/.test(trimmed)) return trimmed;
  if (/^#[A-Fa-f0-9]{3}$/.test(trimmed)) {
    const hex = trimmed.slice(1);
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  return trimmed;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function getContrastForeground(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111111' : '#fafafa';
}

function deriveBrandTokens(hex: string) {
  return {
    primary: hex,
    primaryForeground: getContrastForeground(hex),
    ring: hex,
    accent: `color-mix(in oklab, ${hex} 16%, var(--background))`,
  };
}

export function clearBrandColors(root: HTMLElement): void {
  delete root.dataset.brandColors;
  for (const property of BRAND_CSS_PROPERTIES) {
    root.style.removeProperty(property);
  }
}

export function applyBrandColors(
  root: HTMLElement,
  settings: BrandColorInput | UserSettings | null | undefined,
  resolvedTheme: string | undefined,
): void {
  if (!settings?.brand_colors_enabled) {
    clearBrandColors(root);
    return;
  }

  const light = settings.brand_color_light || DEFAULT_BRAND_COLOR_LIGHT;
  const dark = settings.brand_color_dark || DEFAULT_BRAND_COLOR_DARK;
  const color = resolvedTheme === 'dark' ? dark : light;
  const tokens = deriveBrandTokens(normalizeHexColor(color));

  root.dataset.brandColors = 'true';
  root.style.setProperty('--primary', tokens.primary);
  root.style.setProperty('--primary-foreground', tokens.primaryForeground);
  root.style.setProperty('--ring', tokens.ring);
  root.style.setProperty('--accent', tokens.accent);
}
