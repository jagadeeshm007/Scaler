'use client';

import { registerSchema } from '@scaler/types';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/store/auth.store';
import type { AuthPayload, RegisterInput } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema.shape.body),
    defaultValues: { email: '', password: '', username: '', full_name: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const data = await api.post<AuthPayload>(ENDPOINTS.auth.register, values);
    setAuth(data.user, data.accessToken);
    router.push(ROUTES.eventTypes);
  });

  return (
    <Card className="border-neutral-800 bg-neutral-900 p-6">
      <h1 className="text-xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input placeholder="Full name" className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm" {...form.register('full_name')} />
        <input placeholder="Username" className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm" {...form.register('username')} />
        <input placeholder="Email" type="email" className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm" {...form.register('email')} />
        <input placeholder="Password" type="password" className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm" {...form.register('password')} />
        <Button type="submit" className="w-full">Sign up</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link href={ROUTES.login} className="text-white underline">Login</Link>
      </p>
    </Card>
  );
}
