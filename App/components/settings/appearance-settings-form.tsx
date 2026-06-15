'use client';

import { useState, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { BrandColorField } from '@/components/settings/brand-color-field';
import { ThemeOptionCards } from '@/components/settings/theme-option-cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useUpdateSettings } from '@/hooks/mutations/use-settings-mutations';
import { useUserProfile } from '@/hooks/queries/use-user-profile';
import { DEFAULT_BRAND_NAME, normalizeHexColor } from '@/lib/brand-color';
import {
  DEFAULT_BRAND_COLOR_DARK,
  DEFAULT_BRAND_COLOR_LIGHT,
  type ThemeOption,
} from '@/lib/constants/theme';
import { useUIStore } from '@/store/ui.store';
import type { UserSettings } from '@/types';

function SettingsPanel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5 px-5 py-5">{children}</div>
      {action ? (
        <div className="flex justify-end border-t border-border px-5 py-4">{action}</div>
      ) : null}
    </section>
  );
}

function AppearanceSettingsFormInner({ settings }: { settings: UserSettings | null | undefined }) {
  const updateSettings = useUpdateSettings();
  const { setTheme } = useTheme();
  const setUITheme = useUIStore((state) => state.setTheme);

  const [dashboardTheme, setDashboardTheme] = useState<ThemeOption>(settings?.theme ?? 'system');
  const [brandColorsEnabled, setBrandColorsEnabled] = useState(
    settings?.brand_colors_enabled ?? false,
  );
  const [brandColorLight, setBrandColorLight] = useState(
    settings?.brand_color_light ?? DEFAULT_BRAND_COLOR_LIGHT,
  );
  const [brandColorDark, setBrandColorDark] = useState(
    settings?.brand_color_dark ?? DEFAULT_BRAND_COLOR_DARK,
  );
  const [brandName, setBrandName] = useState(settings?.brand_name ?? DEFAULT_BRAND_NAME);

  const handleDashboardThemeChange = (option: ThemeOption) => {
    setDashboardTheme(option);
    setTheme(option);
    setUITheme(option);
  };

  const handleDashboardThemeSave = () => {
    setTheme(dashboardTheme);
    setUITheme(dashboardTheme);
    updateSettings.mutate(
      { theme: dashboardTheme },
      {
        onSuccess: () => toast.success('Dashboard theme updated'),
      },
    );
  };

  const handleBrandColorsSave = () => {
    const light = normalizeHexColor(brandColorLight);
    const dark = normalizeHexColor(brandColorDark);

    if (!/^#[A-Fa-f0-9]{6}$/.test(light) || !/^#[A-Fa-f0-9]{6}$/.test(dark)) {
      toast.error('Enter valid 6-digit hex colors (e.g. #111111)');
      return;
    }

    updateSettings.mutate(
      {
        brand_colors_enabled: brandColorsEnabled,
        brand_color_light: light,
        brand_color_dark: dark,
      },
      {
        onSuccess: () => toast.success('Brand colors updated'),
      },
    );
  };

  const handleBrandNameSave = () => {
    if (!brandName.trim()) {
      toast.error('Brand name cannot be empty');
      return;
    }

    updateSettings.mutate(
      { brand_name: brandName.trim() },
      { onSuccess: () => toast.success('Brand name updated') },
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <SettingsPanel
        title="Dashboard theme"
        description="This only applies to your logged-in dashboard. System default follows your device light or dark mode."
        action={
          <Button
            type="button"
            onClick={handleDashboardThemeSave}
            disabled={updateSettings.isPending}
          >
            Update
          </Button>
        }
      >
        <ThemeOptionCards value={dashboardTheme} onChange={handleDashboardThemeChange} />
      </SettingsPanel>

      <SettingsPanel
        title="Custom brand name"
        description="Customize the brand name shown on your public booking pages and dashboard."
        action={
          <Button type="button" onClick={handleBrandNameSave} disabled={updateSettings.isPending}>
            Update
          </Button>
        }
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="brand-name" className="text-sm font-medium text-foreground">
            Brand Name
          </label>
          <Input
            id="brand-name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. eith.in"
          />
        </div>
      </SettingsPanel>

      <SettingsPanel
        title="Custom brand colors"
        description="Customize your brand color on your dashboard and public booking pages."
        action={
          <Button
            type="button"
            onClick={handleBrandColorsSave}
            disabled={updateSettings.isPending || !brandColorsEnabled}
          >
            Update
          </Button>
        }
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Enable custom brand colors</p>
            <p className="text-sm text-muted-foreground">
              Applies to buttons, links, and accents across your booking experience.
            </p>
          </div>
          <Switch checked={brandColorsEnabled} onCheckedChange={setBrandColorsEnabled} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <BrandColorField
            id="brand-color-light"
            label="Brand color (light theme)"
            value={brandColorLight}
            defaultValue={DEFAULT_BRAND_COLOR_LIGHT}
            onChange={setBrandColorLight}
            disabled={!brandColorsEnabled}
          />
          <BrandColorField
            id="brand-color-dark"
            label="Brand color (dark theme)"
            value={brandColorDark}
            defaultValue={DEFAULT_BRAND_COLOR_DARK}
            onChange={setBrandColorDark}
            disabled={!brandColorsEnabled}
          />
        </div>
      </SettingsPanel>
    </div>
  );
}

export function AppearanceSettingsForm() {
  const { data: user, isLoading } = useUserProfile();

  if (isLoading) {
    return <Skeleton className="h-80 w-full max-w-3xl rounded-xl" />;
  }

  const settingsKey = [
    user?.settings?.theme,
    user?.settings?.brand_colors_enabled,
    user?.settings?.brand_color_light,
    user?.settings?.brand_color_dark,
    user?.settings?.brand_name,
  ].join('-');

  return <AppearanceSettingsFormInner key={settingsKey} settings={user?.settings} />;
}
