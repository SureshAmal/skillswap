export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="container-glass text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-[var(--accent-primary)]">
          Welcome to SkillSwap
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8">
          Share your skills, learn from your peers, and earn Time Credits!
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-primary)] font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer">
            Get Started
          </button>
          <button className="bg-transparent border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer">
            Explore Skills
          </button>
        </div>
      </div>
    </main>
  );
}
