import type { ReactNode } from 'react';

interface MerchantPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function MerchantPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: MerchantPageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72)_55%,rgba(225,29,72,0.16))] px-6 py-6 shadow-[0_24px_80px_-48px_rgba(225,29,72,0.6)] sm:px-8 sm:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.14),transparent_28%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-[2rem]">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            {description}
          </p>
        </div>
        {actions ? <div className="relative flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
