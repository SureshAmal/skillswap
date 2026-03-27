import Link from 'next/link';
import { ArrowRight, GraduationCap, Award, Clock, MessageCircle, RefreshCcw } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-3xl mx-auto" style={{ padding: '3rem 2rem' }}>

        {/* Logo Mark */}
        <div className="mb-8 inline-flex items-center justify-center rounded-full"
          style={{
            width: '80px',
            height: '80px',
            background: 'var(--accent-primary)',
          }}
        >
          <RefreshCcw size={36} color="#fff" strokeWidth={2.5} />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--accent-primary)', lineHeight: 1.2 }}>
          SkillSwap
        </h1>

        <p className="text-xl md:text-2xl mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Share your skills, learn from your peers,<br />
          and earn <strong style={{ color: 'var(--accent-primary)' }}>Time Credits</strong>.
        </p>

        <p className="text-base" style={{ color: 'var(--text-tertiary)', maxWidth: '480px', margin: '0 auto 3rem' }}>
          The peer-to-peer platform where university students teach what they know and learn what they need.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Link href="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <Link href="/explore" className="btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
            Explore Skills
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex gap-3 justify-center flex-wrap">
          <span className="feature-pill"><GraduationCap size={16} /> University Peers</span>
          <span className="feature-pill"><Award size={16} /> Earn Certificates</span>
          <span className="feature-pill"><Clock size={16} /> Time Credits</span>
          <span className="feature-pill"><MessageCircle size={16} /> In-app Messaging</span>
        </div>
      </div>
    </main>
  );
}
