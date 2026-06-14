import { GeneralSettingsForm } from '@/components/settings/general-settings-form';
import { SettingsNav } from '@/components/settings/settings-nav';

export default function GeneralSettingsPage() {
  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-6 py-8">
      <aside className="hidden w-48 shrink-0 md:block">
        <SettingsNav />
      </aside>
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">General</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Language, timezone, and time format preferences
          </p>
        </div>
        <GeneralSettingsForm />
      </div>
    </div>
  );
}
