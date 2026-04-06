import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CategoryStrip } from '../components/public/CategoryStrip';
import { ActivityGridCard } from '../components/public/ActivityGridCard';
import { BannerCarousel } from '../components/public/BannerCarousel';
import { EmptyState } from '../components/public/EmptyState';
import { LoadingCards } from '../components/public/LoadingCards';
import { RecommendationList } from '../components/public/RecommendationList';
import { HOME_SECTION_ORDER } from '../constants/public';
import { HOME_BANNERS } from '../data/home';
import { listActivities, getHotRecommendations, getRecommendations } from '../api/endpoints';
import type {
  ActivitySearchParams,
  HomeCategorySection,
  RecommendationSectionItem,
} from '../types';
import type { PublicLayoutContext } from '../layouts/PublicLayout';

export default function HomePage() {
  const { t } = useTranslation();
  const { preferredCity } = useOutletContext<PublicLayoutContext>();
  const [recommendations, setRecommendations] = useState<RecommendationSectionItem[]>([]);
  const [sections, setSections] = useState<HomeCategorySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const baseSearch: ActivitySearchParams = {
      keyword: '',
      region: preferredCity,
      artist: '',
      category: 'ALL',
      sort: 'hot',
      page: 1,
      pageSize: 4,
    };

    async function load() {
      try {
        setIsLoading(true);

        const [recommendationResult, ...sectionResults] = await Promise.all([
          getRecommendations(4).catch(() => getHotRecommendations(4).then((list) => ({ list, strategy: 'hot_fallback' }))),
          ...HOME_SECTION_ORDER.map(async (category) => {
            const result = await listActivities({
              ...baseSearch,
              category,
            });

            return {
              category,
              title: t(`categories.${category}`),
              items: result.list,
            };
          }),
        ]);

        if (!active) {
          return;
        }

        setRecommendations(recommendationResult.list);
        setSections(sectionResults.filter((section) => section.items.length > 0));
      } catch {
        if (!active) {
          return;
        }

        setRecommendations([]);
        setSections([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [preferredCity, t]);

  return (
    <div className="space-y-8 pb-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <BannerCarousel items={HOME_BANNERS} />
        <RecommendationList
          items={recommendations}
          isLoading={isLoading}
          title={t('home.recommendations')}
        />
      </section>

      <CategoryStrip />

      {isLoading ? (
        <LoadingCards count={8} />
      ) : sections.length === 0 ? (
        <EmptyState />
      ) : (
        sections.map((section) => (
          <section
            key={section.category}
            className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm lg:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">
                  {t('home.sectionEyebrow')}
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  {section.title}
                </h2>
              </div>
              <Link
                to={`/activities?category=${section.category}${preferredCity !== 'ALL' ? `&region=${encodeURIComponent(preferredCity)}` : ''}`}
                className="text-sm font-semibold text-slate-400 transition hover:text-rose-600"
              >
                {t('public.viewAll')}
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {section.items.map((item) => (
                <ActivityGridCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
