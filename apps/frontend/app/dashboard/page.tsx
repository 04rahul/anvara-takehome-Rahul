import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers.server';

export default async function DashboardIndexPage() {
  const session = await getServerSession();

  if (!session.user) {
    redirect('/login');
  }

  if (session.role === 'sponsor') {
    redirect('/dashboard/sponsor');
  }

  if (session.role === 'publisher') {
    redirect('/dashboard/publisher');
  }

  // Logged in but no role assigned (or role lookup failed)
  redirect('/');
}

