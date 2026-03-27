'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-transparent border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-4 py-2 rounded-md transition-colors cursor-pointer"
    >
      Logout
    </button>
  );
}
