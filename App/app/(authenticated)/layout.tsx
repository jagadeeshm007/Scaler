import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Sidebar } from '@/components/layout/sidebar';
import { BrandColorProvider, ThemeHydrator } from '@/components/layout/brand-color-provider';
import { AuthTokenBridge } from '@/components/auth/auth-token-bridge';
import { fetchUserProfileServer } from '@/lib/api/users.server';
import { verifySession } from '@/lib/dal';
import { toUserDTO } from '@/lib/dto';
import type { ThemeOption } from '@/lib/constants/theme';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, user: sessionUser } = await verifySession();
  const queryClient = new QueryClient();

  let initialTheme: ThemeOption = 'system';
  let userProfile;

  try {
    userProfile = await fetchUserProfileServer(accessToken);
    queryClient.setQueryData(queryKeys.user.me(), userProfile);
    initialTheme = userProfile.settings?.theme ?? 'system';
  } catch {
    queryClient.setQueryData(queryKeys.user.me(), { ...sessionUser, settings: null });
  }

  const userDTO = toUserDTO(userProfile ?? sessionUser);

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BrandColorProvider />
        <ThemeHydrator initialTheme={initialTheme} />
        <AuthTokenBridge accessToken={accessToken} />
        <div className="flex min-h-screen bg-background">
          <Sidebar className="hidden shrink-0 md:flex" user={userDTO} />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
            <MobileHeader user={userDTO} />
            <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-background p-3 md:p-4 lg:p-5">
              {children}
            </main>
            <MobileBottomNav />
          </div>
        </div>
      </HydrationBoundary>
    </>
  );
}
