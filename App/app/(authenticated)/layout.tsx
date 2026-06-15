import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Sidebar } from '@/components/layout/sidebar';
import { BrandColorProvider } from '@/components/layout/brand-color-provider';
import { AuthHydration } from '@/components/layout/auth-hydration';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHydration />
      <BrandColorProvider />
      <div className="flex min-h-screen bg-background">
        <Sidebar className="hidden shrink-0 md:flex" />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <MobileHeader />
          <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-background p-3 md:p-4 lg:p-5">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </>
  );
}
