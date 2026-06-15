import { NextResponse } from 'next/server';

import { refreshAuthSession } from '@/lib/dal';

export async function POST(): Promise<NextResponse> {
  const session = await refreshAuthSession();

  if (!session) {
    return NextResponse.json({ message: 'Session expired' }, { status: 401 });
  }

  return NextResponse.json({ accessToken: session.accessToken });
}
