import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { HomeBannerItem } from '../../types';

export function BannerCarousel({ items }: { items: HomeBannerItem[] }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const activeItem = items[activeIndex];

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-100 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.4)]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-black/5" />
      <img
        src={activeItem.imageUrl}
        alt={activeItem.title}
        className="h-[360px] w-full object-cover lg:h-[460px]"
      />

      <div className="absolute inset-0 flex flex-col justify-end px-6 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
        <p className="mb-3 text-base font-semibold tracking-[0.2em] text-white/80">
          {activeItem.title}
        </p>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-6xl">
          {activeItem.subtitle}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 lg:text-lg">
          {activeItem.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={activeItem.href}
            className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-rose-50 hover:text-rose-600"
          >
            {activeItem.ctaLabel}
          </Link>
          <span className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            {t(`categories.${activeItem.category}`)}
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition ${
                index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50'
              }`}
              aria-label={item.title}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((current) => (current - 1 + items.length) % items.length)
            }
            className="rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/25"
            aria-label={t('common.previous')}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current + 1) % items.length)}
            className="rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/25"
            aria-label={t('common.next')}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
