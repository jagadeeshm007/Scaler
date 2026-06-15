'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/routes';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <Card className="border-border bg-card p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <input
            id="email"
            name="email"
            placeholder="Email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          {state?.errors?.email && (
            <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <input
            id="password"
            name="password"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          {state?.errors?.password && (
            <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>
          )}
        </div>

        {state?.message && <p className="text-sm text-red-500">{state.message}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in...' : 'Login'}
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
