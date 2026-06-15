'use client';

import { loginSchema } from '@scaler/types';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import type { AuthPayload, LoginInput } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema.shape.body),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const data = await api.post<AuthPayload>(ENDPOINTS.auth.login, values);
    setAuth(data.user, data.accessToken);
    router.push(ROUTES.eventTypes);
  });

  const handleBypass = async () => {
    try {
      const data = await api.post<AuthPayload>(ENDPOINTS.auth.bypass, {});
      setAuth(data.user, data.accessToken);
      router.push(ROUTES.eventTypes);
    } catch (err) {
      console.error('Bypass failed:', err);
    }
  };

  return (
    <Card className="border-border bg-card p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          placeholder="Email"
          type="email"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          {...form.register('email')}
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          {...form.register('password')}
        />
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-border bg-card text-foreground hover:bg-accent"
          onClick={handleBypass}
        >
          Bypass Login
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href={ROUTES.signup} className="text-foreground underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
