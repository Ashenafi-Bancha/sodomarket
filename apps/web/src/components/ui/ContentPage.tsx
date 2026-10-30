import React from 'react';

/** Simple, consistent layout for informational pages. */
export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="hero-pattern absolute inset-0" aria-hidden />
        <div className="container-page relative py-16 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-300">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-100/80">{intro}</p>
        </div>
      </section>
      <div className="container-page py-12 sm:py-16">{children}</div>
    </div>
  );
}

export function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">{icon}</span>
      <h3 className="mt-5 text-lg font-bold text-ink-900">{title}</h3>
      <div className="mt-2 text-[15px] leading-relaxed text-ink-600">{children}</div>
    </div>
  );
}
