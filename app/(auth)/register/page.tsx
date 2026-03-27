'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="container-glass w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--accent-primary)' }}>Join SkillSwap</h1>
        <p className="text-center mb-8" style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Start trading skills with your peers.</p>

        {error && <div className="error-banner mb-6">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2" style={{ width: '100%', padding: '0.85rem' }}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Already have an account?{' '}
          <Link href="/login" className="link-accent">Log in here</Link>
        </p>
      </div>
    </main>
  );
}
