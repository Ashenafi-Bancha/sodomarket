import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/session';
import { getWorkspaceData } from '@/lib/server/workspace';
import { Workspace } from '@/components/workspace/Workspace';

export const metadata: Metadata = { title: 'My Workspace', robots: { index: false } };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');
  const data = await getWorkspaceData(user);
  return <Workspace user={user} data={data} />;
}
