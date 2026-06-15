import { verifySession } from '@/lib/dal';
import { AppearanceSettingsForm } from '@/components/settings/appearance-settings-form';
import { SettingsNav } from '@/components/settings/settings-nav';

export default async function AppearanceSettingsPage() {
  await verifySession();

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-6 py-8">
      <aside className="hidden w-48 shrink-0 md:block">
        <SettingsNav />
      </aside>
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Appearance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage settings for your dashboard and booking appearance
          </p>
        </div>
        <AppearanceSettingsForm />
      </div>
    </div>
  );
}
