import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await verifySession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="container-glass col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent-primary)]">Welcome back, {session.email}</h2>
          <p className="text-[var(--text-secondary)]">Your Time Credits: <strong>0</strong></p>
          <p className="text-[var(--text-secondary)] mt-4">You haven't set up your profile yet. Add your bio, university, and skills to start swapping!</p>
        </div>
        
        <div className="container-glass">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Quick Actions</h2>
          <ul className="flex flex-col gap-2">
            <li><a href="/explore" className="text-[var(--accent-primary)] hover:underline">Explore Skills</a></li>
            <li><a href="/profile/edit" className="text-[var(--accent-primary)] hover:underline">Edit Profile</a></li>
            <li><a href="/messages" className="text-[var(--accent-primary)] hover:underline">Messages</a></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
