import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/session';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Create an account' };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string; type?: string }> }) {
  const { next, type } = await searchParams;
  if (await getCurrentUser()) redirect('/dashboard');
  const initialType = type === 'BROKER' || type === 'SELLER' ? type : undefined;
  return (
    <AuthShell>
      <RegisterForm next={next} initialType={initialType} />
    </AuthShell>
  );
}
