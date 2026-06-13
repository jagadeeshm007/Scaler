import { Globe, Palette, User } from 'lucide-react';

import { SettingsCard } from '@/components/settings/settings-card';
import { ROUTES } from '@/lib/routes';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Personal settings
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SettingsCard
              href={ROUTES.settingsProfile}
              icon={User}
              title="Profile"
              description="Manage your name, avatar, and public profile"
            />
            <SettingsCard
              href={ROUTES.settingsGeneral}
              icon={Globe}
              title="General"
              description="Language, timezone, and time format preferences"
            />
            <SettingsCard
              href={ROUTES.settingsGeneral}
              icon={Palette}
              title="Appearance"
              description="Customize how Scaler looks on your device"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
