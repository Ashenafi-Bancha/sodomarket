import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/session';
import { getAdminData } from '@/lib/server/workspace';
import { AdminConsole } from '@/components/admin/AdminConsole';

export const metadata: Metadata = { title: 'Admin Center', robots: { index: false } };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'ADMIN') notFound();
  const data = await getAdminData();
  return <AdminConsole data={data} currentUserId={user.id} />;
}
