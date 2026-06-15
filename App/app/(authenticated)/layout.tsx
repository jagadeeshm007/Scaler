import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Sidebar } from '@/components/layout/sidebar';
import { BrandColorProvider } from '@/components/layout/brand-color-provider';
import { AuthTokenBridge } from '@/components/auth/auth-token-bridge';
import { verifySession } from '@/lib/dal';
import { toUserDTO } from '@/lib/dto';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = await verifySession();
  const userDTO = toUserDTO(user);
  const queryClient = new QueryClient();

  queryClient.setQueryData(queryKeys.user.me(), user);

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BrandColorProvider />
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
