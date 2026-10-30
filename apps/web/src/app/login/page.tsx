import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/session';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
  return (
    <AuthShell>
      <LoginForm next={next} demoMode={process.env.NEXT_PUBLIC_DEMO_MODE === 'true'} />
    </AuthShell>
  );
}
