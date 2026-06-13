'use client';

import { useEffect } from 'react';

import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useUpdateProfile } from '@/hooks/mutations/use-settings-mutations';
import { useUserProfile } from '@/hooks/queries/use-user-profile';
import { useTimezone } from '@/hooks/use-timezone';
import { useUIStore } from '@/store/ui.store';

export function GeneralSettingsForm() {
  const { data: user } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { timezone, setTimezone, resetTimezone } = useTimezone(user?.timezone);
  const { timeFormat, setTimeFormat } = useUIStore();

  useEffect(() => {
    if (user?.timezone) setTimezone(user.timezone);
  }, [user?.timezone, setTimezone]);

  const handleTimezoneBlur = () => {
    if (!user || timezone === user.timezone) return;
    updateProfile.mutate({ timezone });
  };

  return (
    <div className="max-w-lg space-y-8">
      <div className="space-y-3">
        <Label htmlFor="timezone">Timezone</Label>
        <input
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          onBlur={handleTimezoneBlur}
          className="flex h-9 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Asia/Kolkata"
        />
        <button
          type="button"
          onClick={resetTimezone}
          className="text-xs text-blue-500 hover:underline"
        >
          Detect from browser
        </button>
      </div>

      <div className="space-y-3">
        <Label>Time format</Label>
        <ToggleGroup
          type="single"
          value={timeFormat}
          onValueChange={(value) => {
            if (value) setTimeFormat(value as '12h' | '24h');
          }}
          variant="outline"
        >
          <ToggleGroupItem value="12h">12-hour (1:00pm)</ToggleGroupItem>
          <ToggleGroupItem value="24h">24-hour (13:00)</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-xs text-neutral-500">
          Controls how times are displayed across the dashboard and booking pages.
        </p>
      </div>
    </div>
  );
}
